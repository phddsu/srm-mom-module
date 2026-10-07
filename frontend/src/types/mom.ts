import type { MomStage, MomStatus } from './index';

export interface MinutesOfMeeting {
  id: number;
  momNumber: string;
  scholarId: number;
  scholarName?: string;
  supervisorId: number;
  supervisorName?: string;
  currentStatus: MomStatus;
  currentStage: MomStage;
  periodYear?: number;
  periodMonth?: number;
  submissionDate?: string;
  createdAt?: string;
  updatedAt?: string;

  // Section H
  sectionHRecommendation?: string;
  sectionHAssessmentScores?: string;
  sectionHMonth?: string;

  // Section I
  sectionICertifiedLeave?: string;
  sectionICertifiedFellowship?: string;
  sectionIHoiRemarks?: string;
  sectionIDirectorateRemarks?: string;
  sectionIDeanRemarks?: string;

  // Sections A-G fields can be added later as needed
  [key: string]: any;
}

export interface JournalPaper {
  id?: number;
  momId?: number;
  title: string;
  journalName?: string;
  journalType?: 'SCI' | 'WOS' | 'Scopus' | 'PubMed' | 'Other';
  status?: 'Communicated' | 'Under Review' | 'Under Preparation' | 'Accepted' | 'Published';
  expectedDate?: string;
  notes?: string;
}

export interface MomHistoryEntry {
  id: number;
  momId: number;
  action: string;
  previousStatus: string;
  newStatus: string;
  previousStage: string;
  newStage: string;
  performedByUsername: string;
  performedByRole: string;
  remarks?: string;
  actionTimestamp: string;
}

export interface MomSignature {
  id: number;
  momId: number;
  role: string;
  signedByName: string;
  signatureHash: string;
  signedAt: string;
}