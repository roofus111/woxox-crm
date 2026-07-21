import { Router } from 'express';

import { asyncHandler } from '../../common/asyncHandler.js';

import { requireAuth } from '../../host/auth.middleware.js';

import { requireWorkspace } from '../../host/workspace.middleware.js';

import { permit } from '../../host/permit.middleware.js';

import * as casesController from './controllers/cases.controller.js';

import * as complaintsController from './controllers/complaints.controller.js';

import * as firsController from './controllers/firs.controller.js';

import * as hearingsController from './controllers/hearings.controller.js';

import * as evidenceController from './controllers/evidence.controller.js';

import * as providersController from './controllers/providers.controller.js';

import * as aiController from './controllers/ai.controller.js';

import * as analyticsController from './controllers/analytics.controller.js';

import * as partiesController from './controllers/parties.controller.js';

import * as filingsController from './controllers/filings.controller.js';

import * as knowledgeController from './controllers/knowledge.controller.js';

import * as notificationsController from './controllers/notifications.controller.js';
import * as enterpriseController from './controllers/enterprise.controller.js';

import {

  caseIdParams,

  caseListParams,

  createCaseDto,

  updateCaseDto,

} from './validators/cases.validator.js';

import {

  complaintIdParams,

  complaintListParams,

  convertToFirDto,

  createComplaintDto,

  updateComplaintDto,

} from './validators/complaints.validator.js';

import {

  createFirDto,

  firIdParams,

  firListParams,

  updateFirDto,

} from './validators/firs.validator.js';

import {

  createHearingDto,

  caseHearingParams,

  hearingListParams,

} from './validators/hearings.validator.js';

import {

  evidenceIdParams,

  registerEvidenceDto,

  sealEvidenceDto,

} from './validators/evidence.validator.js';

import { aiRequestDto } from './validators/ai.validator.js';

import { providerParams, syncRequestDto } from './validators/providers.validator.js';

import {

  createPartyDto,

  partyIdParams,

  partyListParams,

  updatePartyDto,

} from './validators/parties.validator.js';

import {

  createFilingDto,

  filingIdParams,

  filingListParams,

  updateFilingDto,

} from './validators/filings.validator.js';

import {

  createKnowledgeDocDto,

  knowledgeIdParams,

  knowledgeListParams,

  notificationFeedParams,

  updateKnowledgeDocDto,

} from './validators/knowledge.validator.js';

import {
  advanceWorkflowDto,
  branchIdParams,
  caseAccessQuery,
  caseIdOnlyParams,
  conflictCheckDto,
  createBranchDto,
  createTimeEntryDto,
  createWarRoomEntryDto,
  createWorkflowDto,
  pinWarRoomDto,
  setCaseAclDto,
  teamMemberParams,
  timeEntryQuery,
  updateBranchDto,
  upsertMemberDto,
  upsertTeamMemberDto,
  warRoomEntryIdParams,
  workflowIdParams,
  workflowQuery,
} from './validators/enterprise.validator.js';

import {
  validateBody,
  validateParams,
  validateQuery,
} from './validators/validate.middleware.js';



const router = Router();



router.use(requireAuth, requireWorkspace);



router.get('/parties', permit('legal.case.read'), validateQuery(partyListParams), asyncHandler(partiesController.listParties));

router.post('/parties', permit('legal.case.create'), validateBody(createPartyDto), asyncHandler(partiesController.createParty));

router.get('/parties/:id', permit('legal.case.read'), validateParams(partyIdParams), asyncHandler(partiesController.getParty));

router.patch('/parties/:id', permit('legal.case.update'), validateParams(partyIdParams), validateBody(updatePartyDto), asyncHandler(partiesController.updateParty));

router.delete('/parties/:id', permit('legal.case.archive'), validateParams(partyIdParams), asyncHandler(partiesController.deleteParty));



router.get('/cases', permit('legal.case.read'), validateQuery(caseListParams), asyncHandler(casesController.listCases));

router.post('/cases', permit('legal.case.create'), validateBody(createCaseDto), asyncHandler(casesController.createCase));

router.get('/cases/:id', permit('legal.case.read'), validateParams(caseIdParams), asyncHandler(casesController.getCase));

router.patch('/cases/:id', permit('legal.case.update'), validateParams(caseIdParams), validateBody(updateCaseDto), asyncHandler(casesController.updateCase));

router.post(

  '/cases/:id/hearings',

  permit('legal.case.update'),

  validateParams(caseHearingParams),

  validateBody(createHearingDto),

  asyncHandler(hearingsController.createCaseHearing),

);



router.get('/hearings', permit('legal.case.read'), validateQuery(hearingListParams), asyncHandler(hearingsController.listHearings));



router.get('/complaints', permit('legal.complaint.read'), validateQuery(complaintListParams), asyncHandler(complaintsController.listComplaints));

router.post('/complaints', permit('legal.complaint.create'), validateBody(createComplaintDto), asyncHandler(complaintsController.createComplaint));

router.get(

  '/complaints/:id',

  permit('legal.complaint.read'),

  validateParams(complaintIdParams),

  asyncHandler(complaintsController.getComplaint),

);

router.patch(

  '/complaints/:id',

  permit('legal.complaint.update'),

  validateParams(complaintIdParams),

  validateBody(updateComplaintDto),

  asyncHandler(complaintsController.updateComplaint),

);

router.post(

  '/complaints/:id/convert-to-fir',

  permit('legal.complaint.convert_to_fir'),

  validateParams(complaintIdParams),

  validateBody(convertToFirDto),

  asyncHandler(complaintsController.convertComplaintToFir),

);



router.get('/firs', permit('legal.fir.read'), validateQuery(firListParams), asyncHandler(firsController.listFirs));

router.post('/firs', permit('legal.fir.create'), validateBody(createFirDto), asyncHandler(firsController.createFir));

router.get(

  '/firs/:id',

  permit('legal.fir.read'),

  validateParams(firIdParams),

  asyncHandler(firsController.getFir),

);

router.patch(

  '/firs/:id',

  permit('legal.fir.update'),

  validateParams(firIdParams),

  validateBody(updateFirDto),

  asyncHandler(firsController.updateFir),

);



router.get('/evidence', permit('legal.evidence.read'), asyncHandler(evidenceController.listEvidence));

router.get(

  '/evidence/:id',

  permit('legal.evidence.read'),

  validateParams(evidenceIdParams),

  asyncHandler(evidenceController.getEvidence),

);

router.post(

  '/evidence/upload-intents',

  permit('legal.evidence.upload'),

  validateBody(registerEvidenceDto),

  asyncHandler(evidenceController.createEvidenceUploadIntent),

);

router.post(

  '/evidence/:id/seal',

  permit('legal.evidence.seal'),

  validateParams(evidenceIdParams),

  validateBody(sealEvidenceDto),

  asyncHandler(evidenceController.sealEvidence),

);



router.get('/filings', permit('legal.case.read'), validateQuery(filingListParams), asyncHandler(filingsController.listFilings));

router.post('/filings', permit('legal.case.create'), validateBody(createFilingDto), asyncHandler(filingsController.createFiling));

router.get(

  '/filings/:id',

  permit('legal.case.read'),

  validateParams(filingIdParams),

  asyncHandler(filingsController.getFiling),

);

router.patch(

  '/filings/:id',

  permit('legal.case.update'),

  validateParams(filingIdParams),

  validateBody(updateFilingDto),

  asyncHandler(filingsController.updateFiling),

);



router.get('/knowledge', permit('legal.research.use'), validateQuery(knowledgeListParams), asyncHandler(knowledgeController.listKnowledgeDocs));

router.post('/knowledge', permit('legal.admin.manage'), validateBody(createKnowledgeDocDto), asyncHandler(knowledgeController.createKnowledgeDoc));

router.get(

  '/knowledge/:id',

  permit('legal.research.use'),

  validateParams(knowledgeIdParams),

  asyncHandler(knowledgeController.getKnowledgeDoc),

);

router.patch(

  '/knowledge/:id',

  permit('legal.admin.manage'),

  validateParams(knowledgeIdParams),

  validateBody(updateKnowledgeDocDto),

  asyncHandler(knowledgeController.updateKnowledgeDoc),

);

router.post(

  '/knowledge/:id/bookmark',

  permit('legal.research.use'),

  validateParams(knowledgeIdParams),

  asyncHandler(knowledgeController.bookmarkKnowledgeDoc),

);



router.get(

  '/notifications/feed',

  permit('legal.case.read', 'legal.dashboard.read'),

  validateQuery(notificationFeedParams),

  asyncHandler(notificationsController.getNotificationFeed),

);



router.get('/providers/capabilities', permit('legal.integration.manage', 'legal.dashboard.read'), asyncHandler(providersController.getProviderCapabilities));

router.post(

  '/providers/:provider/sync',

  permit('legal.integration.manage'),

  validateParams(providerParams),

  validateBody(syncRequestDto),

  asyncHandler(providersController.syncProvider),

);



router.post('/ai/requests', permit('legal.ai.use'), validateBody(aiRequestDto), asyncHandler(aiController.createAiRequest));



router.get('/analytics/portfolio', permit('legal.analytics.read', 'legal.dashboard.read'), asyncHandler(analyticsController.getPortfolioAnalytics));

router.get('/dashboard', permit('legal.dashboard.read', 'legal.analytics.read'), asyncHandler(analyticsController.getPortfolioAnalytics));

/* —— Enterprise: org, ACL, war room, conflict, time, workflows —— */
router.get('/org/branches', permit('legal.org.manage', 'legal.admin.manage', 'legal.case.read'), asyncHandler(enterpriseController.listBranches));
router.post('/org/branches', permit('legal.org.manage', 'legal.admin.manage'), validateBody(createBranchDto), asyncHandler(enterpriseController.createBranch));
router.patch('/org/branches/:id', permit('legal.org.manage', 'legal.admin.manage'), validateParams(branchIdParams), validateBody(updateBranchDto), asyncHandler(enterpriseController.updateBranch));

router.get('/org/members', permit('legal.org.manage', 'legal.admin.manage', 'legal.case.read'), asyncHandler(enterpriseController.listMembers));
router.post('/org/members', permit('legal.org.manage', 'legal.admin.manage'), validateBody(upsertMemberDto), asyncHandler(enterpriseController.upsertMember));

router.get('/cases/:caseId/acl', permit('legal.case.read'), validateParams(caseIdOnlyParams), asyncHandler(enterpriseController.getCaseAcl));
router.put('/cases/:caseId/acl', permit('legal.case.update', 'legal.admin.manage'), validateParams(caseIdOnlyParams), validateBody(setCaseAclDto), asyncHandler(enterpriseController.setCaseAcl));
router.post('/cases/:caseId/acl/bootstrap', permit('legal.case.create', 'legal.case.update'), validateParams(caseIdOnlyParams), asyncHandler(enterpriseController.bootstrapCaseAccess));
router.get('/cases/:caseId/access-check', permit('legal.case.read'), validateParams(caseIdOnlyParams), validateQuery(caseAccessQuery), asyncHandler(enterpriseController.assertCaseAccess));

router.get('/cases/:caseId/team', permit('legal.case.read'), validateParams(caseIdOnlyParams), asyncHandler(enterpriseController.listMatterTeam));
router.post('/cases/:caseId/team', permit('legal.case.update'), validateParams(caseIdOnlyParams), validateBody(upsertTeamMemberDto), asyncHandler(enterpriseController.upsertMatterTeamMember));
router.delete('/cases/:caseId/team/:userId', permit('legal.case.update'), validateParams(teamMemberParams), asyncHandler(enterpriseController.removeMatterTeamMember));

router.get('/cases/:caseId/war-room', permit('legal.warroom.use', 'legal.case.read'), validateParams(caseIdOnlyParams), asyncHandler(enterpriseController.listWarRoom));
router.post('/cases/:caseId/war-room', permit('legal.warroom.use', 'legal.case.update'), validateParams(caseIdOnlyParams), validateBody(createWarRoomEntryDto), asyncHandler(enterpriseController.createWarRoomEntry));
router.post('/war-room/:id/pin', permit('legal.warroom.use', 'legal.case.update'), validateParams(warRoomEntryIdParams), validateBody(pinWarRoomDto), asyncHandler(enterpriseController.pinWarRoomEntry));

router.get('/cases/:caseId/graph', permit('legal.case.read'), validateParams(caseIdOnlyParams), asyncHandler(enterpriseController.getRelationshipGraph));

router.post('/conflict-checks', permit('legal.conflict.check', 'legal.case.create'), validateBody(conflictCheckDto), asyncHandler(enterpriseController.runConflictCheck));

router.get('/time-entries', permit('legal.time.record', 'legal.case.read'), validateQuery(timeEntryQuery), asyncHandler(enterpriseController.listTimeEntries));
router.post('/time-entries', permit('legal.time.record'), validateBody(createTimeEntryDto), asyncHandler(enterpriseController.createTimeEntry));

router.get('/workflows', permit('legal.workflow.approve', 'legal.case.read'), validateQuery(workflowQuery), asyncHandler(enterpriseController.listWorkflows));
router.post('/workflows', permit('legal.workflow.approve', 'legal.case.create'), validateBody(createWorkflowDto), asyncHandler(enterpriseController.createWorkflow));
router.post('/workflows/:id/advance', permit('legal.workflow.approve'), validateParams(workflowIdParams), validateBody(advanceWorkflowDto), asyncHandler(enterpriseController.advanceWorkflow));

router.get('/accessible-cases', permit('legal.case.read'), asyncHandler(enterpriseController.accessibleCaseIds));

export const legalRouter = router;

