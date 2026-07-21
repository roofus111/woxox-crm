import mongoose from 'mongoose';
import { env } from '../../../../config/env.js';
import { ApiError } from '../../../../common/ApiError.js';
import type { ServiceContext } from '../../../../common/types.js';
import { appendAuditEvent } from '../../models/audit-event.model.js';
import { AiRequest, type AiSourceRef } from '../../models/ai-request.model.js';
import { LegalCase } from '../../models/legal-case.model.js';
import { Evidence } from '../../models/evidence.model.js';
import type { AiRequestInput } from '../../validators/ai.validator.js';

function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function workspaceObjectId(workspaceId: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(workspaceId);
}

function redactText(text: string): string {
  return text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]')
    .replace(/\b\d{10,12}\b/g, '[REDACTED_PHONE]')
    .replace(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi, '[REDACTED_PAN]');
}

async function resolveAuthorizedSources(
  workspaceId: string,
  input: AiRequestInput,
): Promise<Array<{ type: string; id: string; content: string; ref: { type: string; id: string; label?: string } }>> {
  const sources: Array<{
    type: string;
    id: string;
    content: string;
    ref: { type: string; id: string; label?: string };
  }> = [];

  if (input.caseId) {
    const legalCase = await LegalCase.findOne({
      _id: toObjectId(input.caseId),
      workspaceId: workspaceObjectId(workspaceId),
      deletedAt: null,
    }).lean();

    if (!legalCase) {
      throw ApiError.notFound('Referenced case not found for AI request');
    }

    sources.push({
      type: 'case',
      id: legalCase._id.toString(),
      content: [legalCase.title, legalCase.summary, legalCase.caseNumber].filter(Boolean).join('\n'),
      ref: { type: 'case', id: legalCase._id.toString(), label: legalCase.title },
    });
  }

  for (const source of input.sourceIds ?? []) {
    if (source.type === 'evidence') {
      const evidence = await Evidence.findOne({
        _id: toObjectId(source.id),
        workspaceId: workspaceObjectId(workspaceId),
        deletedAt: null,
      }).lean();

      if (!evidence) {
        throw ApiError.notFound(`Evidence source ${source.id} not found`);
      }

      sources.push({
        type: 'evidence',
        id: evidence._id.toString(),
        content: [evidence.title, evidence.description].filter(Boolean).join('\n'),
        ref: { type: 'evidence', id: evidence._id.toString(), label: evidence.title },
      });
    }
  }

  return sources;
}

async function generateWithModel(task: string, prompt: string, sources: string[]): Promise<{
  result: string;
  model: string;
  citations: string[];
}> {
  const model = env.LEGALOS_AI_MODEL;
  const contextBlock = sources.length > 0 ? `\n\nSources:\n${sources.join('\n---\n')}` : '';
  const system =
    'You are WOXOX LegalOS AI for Indian advocates. Provide assistive drafts only. Always require attorney review before filing or client communication. Cite only provided sources.';

  if (env.OPENAI_API_KEY) {
    const response = await fetch(`${env.OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: `Task: ${task}\n\nPrompt:\n${prompt}${contextBlock}\n\nEnd with: Attorney review required.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw ApiError.badRequest(`AI provider error (${response.status}): ${body.slice(0, 200)}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw ApiError.badRequest('AI provider returned an empty response');
    }

    return {
      model,
      citations: sources.length ? ['Authorized workspace sources attached'] : [],
      result: text,
    };
  }

  return {
    model: 'local-template',
    citations: [],
    result: `[${task}] AI assist preview — configure OPENAI_API_KEY for model-backed output. ${prompt}${contextBlock}\n\nAttorney review required.`,
  };
}

export class LegalAiService {
  async run(ctx: ServiceContext, input: AiRequestInput, userPermissions: string[]) {
    if (!userPermissions.includes('legal.ai.use') && !userPermissions.includes('legal.admin.manage')) {
      throw ApiError.forbidden('Missing legal.ai.use permission');
    }

    const request = await AiRequest.create({
      workspaceId: workspaceObjectId(ctx.workspaceId),
      task: input.task,
      status: 'RUNNING',
      prompt: input.prompt,
      locale: input.locale,
      caseId: input.caseId ? toObjectId(input.caseId) : undefined,
      sourceRefs: (input.sourceIds ?? []).map((s) => ({ type: s.type, id: s.id })),
      redactionApplied: input.redact,
      reviewRequired: true,
      requestedBy: toObjectId(ctx.actorId),
      correlationId: ctx.correlationId,
    });

    try {
      const sources = await resolveAuthorizedSources(ctx.workspaceId, input);
      const sourceTexts = sources.map((s) => (input.redact ? redactText(s.content) : s.content));
      const prompt = input.prompt ?? `Perform task ${input.task} using authorized sources.`;
      const generated = await generateWithModel(input.task, prompt, sourceTexts);

      request.status = 'COMPLETED';
      request.result = generated.result;
      request.modelName = generated.model;
      request.citations = generated.citations;
      request.sourceRefs = sources.map((s) => ({
        type: s.ref.type as AiSourceRef['type'],
        id: s.ref.id,
        label: s.ref.label,
      }));
      request.redactionApplied = input.redact;
      request.completedAt = new Date();
      await request.save();

      await appendAuditEvent({
        workspaceId: workspaceObjectId(ctx.workspaceId),
        entityType: 'AiRequest',
        entityId: request._id,
        action: 'AI_REQUESTED',
        actorId: ctx.actorId,
        correlationId: ctx.correlationId,
        metadata: { task: input.task, model: generated.model },
      });

      return request;
    } catch (err) {
      request.status = 'FAILED';
      request.errorMessage = err instanceof Error ? err.message : 'AI request failed';
      await request.save();
      throw err;
    }
  }
}

export const legalAiService = new LegalAiService();
