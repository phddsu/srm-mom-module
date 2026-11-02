import { client } from './client';
import type { MinutesOfMeeting, JournalPaper } from '../types/mom';

// ---- Scholar ----
export const createDraft = (payload: any) =>
  client.post<MinutesOfMeeting>('/api/mom/create', payload);

export const submitMom = (momId: number, payload: any) =>
  client.post(`/api/mom/${momId}/submit`, payload);

export const getMyMoms = () =>
  client.get<MinutesOfMeeting[]>('/api/mom/my');

export const saveJournalPaper = (momId: number, paper: JournalPaper) =>
  client.post(`/api/mom/${momId}/journals`, paper);

export const getJournalPapers = (momId: number) =>
  client.get<JournalPaper[]>(`/api/mom/${momId}/journals`);

// ---- Supervisor ----
export const getGuidePending = () =>
  client.get<MinutesOfMeeting[]>('/api/guide/mom/pending');

export const guideAction = (
  momId: number,
  action: 'RECOMMEND' | 'RETURN',
  remarks: string,
  typedName: string,
  month?: string,
  assessmentScores?: string
) =>
  client.post(`/api/guide/mom/${momId}/action`, {
    action, remarks, typedName, month, assessmentScores,
  });

// ---- Coordinator ----
export const getCoordinatorPending = () =>
  client.get<MinutesOfMeeting[]>('/api/coordinator/mom/pending');

export const coordinatorAction = (
  momId: number,
  action: 'RECOMMEND' | 'RETURN',
  remarks: string,
  typedName: string
) =>
  client.post(`/api/coordinator/mom/${momId}/action`, { action, remarks, typedName });

// ---- HOI ----
export const getHoiPending = () =>
  client.get<MinutesOfMeeting[]>('/api/hoi/mom/pending');

export const hoiAction = (
  momId: number,
  action: 'RECOMMEND' | 'RETURN',
  remarks: string,
  typedName: string,
  certifiedLeave: string,
  certifiedFellowship: string
) =>
  client.post(`/api/hoi/mom/${momId}/action`, {
    action, remarks, typedName, certifiedLeave, certifiedFellowship,
  });

// ---- Dean Research ----
export const getDeanPending = () =>
  client.get<MinutesOfMeeting[]>('/api/dean/mom/pending');

export const deanAction = (
  momId: number,
  action: 'APPROVE' | 'REJECT',
  remarks: string,
  typedName: string
) =>
  client.post(`/api/dean/mom/${momId}/action`, { action, remarks, typedName });

export const downloadMomPdf = (momId: number) =>
  client.get(`/api/dean/mom/${momId}/pdf`, { responseType: 'blob' });

export const uploadSignedCopy = (momId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return client.post(`/api/dean/mom/${momId}/upload-signed`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ---- Common ----
export const getMomById = (id: number) =>
  client.get<MinutesOfMeeting>(`/api/mom/${id}`);

// ---- Attachments ----
export interface SectionAttachment {
  id: number; momId: number; section: string; rowIndex?: number;
  fileName: string; filePath: string; fileSize: number; contentType: string;
  description?: string; uploadedAt: string;
}

export const uploadSectionAttachment = (
  momId: number, file: File, section: string, rowIndex?: number, description?: string
) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('section', section);
  if (rowIndex !== undefined && rowIndex !== null) fd.append('rowIndex', String(rowIndex));
  if (description) fd.append('description', description);
  return client.post<SectionAttachment>(`/api/mom/${momId}/attachments`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const listSectionAttachments = (momId: number, section?: string) =>
  client.get<SectionAttachment[]>(`/api/mom/${momId}/attachments`, {
    params: section ? { section } : {},
  });

export const deleteSectionAttachment = (attachmentId: number) =>
  client.delete(`/api/mom/attachments/${attachmentId}`);

export const attachmentDownloadUrl = (attachmentId: number) =>
  `${import.meta.env.VITE_API_BASE || 'http://localhost:8081'}/api/mom/attachments/${attachmentId}/download`;

// ---- Common ----
export const getAllMoms = () =>
  client.get<MinutesOfMeeting[]>('/api/mom/all');

// ---- Scholar Profile ----
export const getMyProfile = () =>
  client.get('/api/scholar/profile');

export const updateMyProfile = (payload: any) =>
  client.put('/api/scholar/profile', payload);

export const submitMyProfile = () =>
  client.post('/api/scholar/profile/submit', {});

export const listSupervisors = () =>
  client.get('/api/scholar/profile/supervisors');

// ---- Guide: Profile Approvals ----
export const getGuidePendingProfiles = () =>
  client.get('/api/guide/profile/pending');

export const getGuideAllProfiles = () =>
  client.get('/api/guide/profile/all');

export const approveScholarProfile = (profileId: number) =>
  client.post(`/api/guide/profile/${profileId}/approve`, {});

export const rejectScholarProfile = (profileId: number, remarks: string) =>
  client.post(`/api/guide/profile/${profileId}/reject`, { remarks });

// ---- User Profile (all roles) ----
export const getMyUserProfile = () =>
  client.get('/api/user/me');

export const updateMyUserProfile = (payload: any) =>
  client.put('/api/user/me', payload);
// ---- Admin: User Management ----
export const listAllUsers = (role?: string) =>
  client.get('/api/admin/users', { params: role ? { role } : {} });

export const listRoles = () =>
  client.get('/api/admin/roles');

export const createUser = (payload: any) =>
  client.post('/api/admin/users', payload);

export const updateUser = (id: number, payload: any) =>
  client.put(`/api/admin/users/${id}`, payload);

export const deactivateUser = (id: number) =>
  client.delete(`/api/admin/users/${id}`);

// ---- Save Draft (no submit) ----
export const saveMomDraft = (momId: number, payload: any) =>
  client.put('/api/mom/' + momId + '/save', payload);