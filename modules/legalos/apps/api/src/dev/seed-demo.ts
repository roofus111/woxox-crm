import mongoose from 'mongoose';
import { Party } from '../modules/legal/models/party.model.js';
import { LegalCase } from '../modules/legal/models/legal-case.model.js';
import { Complaint } from '../modules/legal/models/complaint.model.js';
import { Filing } from '../modules/legal/models/filing.model.js';
import { KnowledgeDoc } from '../modules/legal/models/knowledge.model.js';
import { Hearing } from '../modules/legal/models/hearing.model.js';
import { env } from '../config/env.js';

const WORKSPACE = new mongoose.Types.ObjectId('000000000000000000000001');
const ACTOR = new mongoose.Types.ObjectId('0000000000000000000000aa');

/**
 * Seeds a small demo dataset for local development (especially in-memory Mongo).
 */
export async function seedDemoDataIfEmpty(): Promise<void> {
  if (env.NODE_ENV === 'production') {
    return;
  }
  if (!env.LEGALOS_SEED_DEMO && !env.LEGALOS_USE_MEMORY_MONGO && env.NODE_ENV !== 'development') {
    return;
  }

  const existing = await LegalCase.countDocuments({ workspaceId: WORKSPACE });
  if (existing > 0) {
    return;
  }

  const client = await Party.create({
    workspaceId: WORKSPACE,
    type: 'IndividualClient',
    displayName: 'Rajesh Sharma',
    contact: { phone: '+91 98100 10001', city: 'New Delhi' },
    createdBy: ACTOR,
    updatedBy: ACTOR,
  });

  const opposite = await Party.create({
    workspaceId: WORKSPACE,
    type: 'OppositeParty',
    displayName: 'State of Delhi',
    createdBy: ACTOR,
    updatedBy: ACTOR,
  });

  const matter = await LegalCase.create({
    workspaceId: WORKSPACE,
    title: 'Sharma vs State of Delhi',
    caseNumber: 'WP(C) 482/2024',
    status: 'ACTIVE',
    visibility: 'FIRM',
    practiceArea: 'Writ',
    court: {
      name: 'Delhi High Court',
      state: 'Delhi',
      judgeName: "Hon'ble Justice A. Mehta",
      courtNumber: 'Court 12',
    },
    clientPartyIds: [client._id],
    oppositePartyIds: [opposite._id],
    advocateIds: [ACTOR],
    partiesSearch: 'Rajesh Sharma State of Delhi',
    nextHearingAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    summary: 'Writ petition listed for final arguments.',
    createdBy: ACTOR,
    updatedBy: ACTOR,
  });

  const { enterpriseService } = await import('../modules/legal/services/enterprise.service.js');
  await enterpriseService.bootstrapCaseAccess(
    {
      workspaceId: WORKSPACE.toString(),
      actorId: ACTOR.toString(),
    },
    matter.id,
  );

  await Hearing.create({
    workspaceId: WORKSPACE,
    caseId: matter._id,
    title: 'WP(C) 482/2024 — Final arguments',
    scheduledAt: (() => {
      const d = new Date();
      d.setHours(d.getHours() + 2, 0, 0, 0);
      return d;
    })(),
    status: 'SCHEDULED',
    purpose: 'Final arguments',
    court: {
      name: 'Delhi High Court',
      courtNumber: 'Court 12',
      judgeName: "Hon'ble Justice A. Mehta",
    },
    assignedAdvocateIds: [ACTOR],
    createdBy: ACTOR,
    updatedBy: ACTOR,
  });

  await Hearing.create({
    workspaceId: WORKSPACE,
    caseId: matter._id,
    title: 'WP(C) 482/2024 — Mention',
    scheduledAt: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      d.setHours(11, 0, 0, 0);
      return d;
    })(),
    status: 'SCHEDULED',
    purpose: 'Mention',
    court: {
      name: 'Delhi High Court',
      courtNumber: 'Court 12',
      judgeName: "Hon'ble Justice A. Mehta",
    },
    assignedAdvocateIds: [ACTOR],
    createdBy: ACTOR,
    updatedBy: ACTOR,
  });

  await Complaint.create({
    workspaceId: WORKSPACE,
    complaintNumber: 'CMP/2026/00142',
    status: 'UNDER_INVESTIGATION',
    category: 'FRAUD',
    policeStation: 'Connaught Place',
    policeStationKey: 'connaught-place',
    clientPartyId: client._id,
    oppositePartyIds: [opposite._id],
    description: 'Complaint pending FIR registration — follow up with IO.',
    nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdBy: ACTOR,
    updatedBy: ACTOR,
  });

  await Filing.create({
    workspaceId: WORKSPACE,
    caseId: matter._id,
    title: 'Writ petition — filing checklist',
    filingType: 'PETITION',
    status: 'CHECKLIST',
    checklist: [
      { item: 'Vakalatnama', done: true },
      { item: 'Affidavit in support', done: false },
    ],
    courtFees: 500,
    diaryNumber: 'DH/2026/00421',
    createdBy: ACTOR,
    updatedBy: ACTOR,
  });

  await KnowledgeDoc.create({
    workspaceId: WORKSPACE,
    title: 'Writ petition template — Delhi High Court',
    category: 'TEMPLATE',
    body: 'Sample writ petition structure for Delhi High Court practice.',
    tags: ['writ', 'delhi-hc', 'template'],
    bookmarkedBy: [],
    createdBy: ACTOR,
    updatedBy: ACTOR,
  });

  console.info(
    '[legalos-api] Demo seed loaded (1 case, 2 hearings, 1 complaint, 1 filing, 1 knowledge doc, 2 parties)',
  );
}
