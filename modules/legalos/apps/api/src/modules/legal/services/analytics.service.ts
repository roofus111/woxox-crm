import { LegalCase } from '../models/legal-case.model.js';
import { Complaint } from '../models/complaint.model.js';
import { Fir } from '../models/fir.model.js';
import { Hearing } from '../models/hearing.model.js';
import { Evidence } from '../models/evidence.model.js';
import { listAllCapabilities } from '../../../providers/registry.js';
import {
  caseVisibilityFilter,
  linkedCaseListFilter,
  resolveVisibleCaseIds,
  workspaceObjectId,
  type AccessActor,
} from './case-access.util.js';

export class AnalyticsService {
  async getPortfolio(workspaceId: string, actor?: AccessActor) {
    const wsId = workspaceObjectId(workspaceId);
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const weekAhead = new Date(endOfDay);
    weekAhead.setDate(weekAhead.getDate() + 7);

    const base = { workspaceId: wsId, deletedAt: null };

    let caseMatch: Record<string, unknown> = { ...base };
    let complaintMatch: Record<string, unknown> = { ...base };
    let firMatch: Record<string, unknown> = { ...base };
    let hearingMatch: Record<string, unknown> = { ...base };
    let evidenceMatch: Record<string, unknown> = { ...base };

    if (actor) {
      const [caseVis, complaintAcl, firAcl, visibleCases] = await Promise.all([
        caseVisibilityFilter(workspaceId, actor),
        linkedCaseListFilter(workspaceId, actor, 'linkedCaseId'),
        linkedCaseListFilter(workspaceId, actor, 'linkedCaseId'),
        resolveVisibleCaseIds(workspaceId, actor),
      ]);

      if (caseVis) caseMatch = { ...caseMatch, ...caseVis };
      if (complaintAcl) complaintMatch = { ...complaintMatch, ...complaintAcl };
      if (firAcl) firMatch = { ...firMatch, ...firAcl };

      if (visibleCases !== 'ALL') {
        hearingMatch = { ...hearingMatch, caseId: { $in: visibleCases } };
        evidenceMatch = {
          ...evidenceMatch,
          $or: [
            { caseId: { $in: visibleCases } },
            { caseId: null },
            { caseId: { $exists: false } },
          ],
        };
      }
    }

    const [
      caseStatusBreakdown,
      practiceAreaBreakdown,
      complaintConversion,
      todaysHearings,
      upcomingHearings,
      pendingComplaints,
      pendingFirs,
      evidenceCounts,
      totals,
      recentCases,
      recentComplaints,
      recentFirs,
    ] = await Promise.all([
      LegalCase.aggregate([
        { $match: caseMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      LegalCase.aggregate([
        { $match: caseMatch },
        {
          $group: {
            _id: { status: '$status', practiceArea: '$practiceArea' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.practiceArea': 1, '_id.status': 1 } },
      ]),
      Complaint.aggregate([
        { $match: complaintMatch },
        {
          $group: {
            _id: '$category',
            total: { $sum: 1 },
            converted: { $sum: { $cond: [{ $ne: ['$convertedFirId', null] }, 1, 0] } },
          },
        },
        {
          $project: {
            total: 1,
            converted: 1,
            conversionRate: {
              $cond: [{ $gt: ['$total', 0] }, { $divide: ['$converted', '$total'] }, 0],
            },
          },
        },
      ]),
      Hearing.find({
        ...hearingMatch,
        scheduledAt: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['SCHEDULED', 'ADJOURNED'] },
      })
        .sort({ scheduledAt: 1 })
        .limit(20)
        .lean(),
      Hearing.find({
        ...hearingMatch,
        scheduledAt: { $gt: endOfDay, $lte: weekAhead },
        status: 'SCHEDULED',
      })
        .sort({ scheduledAt: 1 })
        .limit(20)
        .lean(),
      Complaint.countDocuments({
        ...complaintMatch,
        status: { $in: ['REGISTERED', 'UNDER_INVESTIGATION', 'ESCALATED'] },
      }),
      Fir.countDocuments({
        ...firMatch,
        status: { $in: ['REGISTERED', 'UNDER_INVESTIGATION'] },
      }),
      Evidence.aggregate([
        { $match: evidenceMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Promise.all([
        LegalCase.countDocuments(caseMatch),
        Complaint.countDocuments(complaintMatch),
        Fir.countDocuments(firMatch),
        Evidence.countDocuments(evidenceMatch),
      ]),
      LegalCase.find(caseMatch).sort({ updatedAt: -1 }).limit(10).lean(),
      Complaint.find(complaintMatch).sort({ updatedAt: -1 }).limit(10).lean(),
      Fir.find(firMatch).sort({ updatedAt: -1 }).limit(10).lean(),
    ]);

    return {
      generatedAt: now.toISOString(),
      totals: {
        cases: totals[0],
        complaints: totals[1],
        firs: totals[2],
        evidence: totals[3],
      },
      caseStatusBreakdown,
      practiceAreaBreakdown,
      complaintConversion,
      todaysHearings,
      upcomingHearings,
      pendingComplaints,
      pendingFirs,
      evidenceCounts,
      recentCases,
      recentComplaints,
      recentFirs,
      providerCapabilities: listAllCapabilities(),
    };
  }
}

export const analyticsService = new AnalyticsService();
