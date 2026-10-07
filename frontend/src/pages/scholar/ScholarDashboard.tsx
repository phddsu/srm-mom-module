import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import {
  getMyMoms, createDraft, submitMom,
  uploadSectionAttachment, listSectionAttachments, deleteSectionAttachment, attachmentDownloadUrl,
  type SectionAttachment,
} from '../../api/mom';
import type { MinutesOfMeeting } from '../../types/mom';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MILESTONES = ['Literature Review','Problem Identification','Formulation of Methodology','Experimental Validation','Publication Submission','Pre-PhD Preparation','Thesis Writing','Synopsis Submitted','Doctoral Committee Meeting','Comprehensive Viva Completed','Pre-PhD Synopsis Meeting Completed'];
const THROUGHPUTS = ['Journal Articles Published','Journal Articles Accepted','Journal Articles under Review','Journal Articles Under Preparation','Conference Publications / Proceedings','Book Chapters','Patents Filed/Published/Granted'];
const JOURNALS = ['SCI/SCIE','WOS','Scopus','PUBMED/MEDLINE','E/ABDC/Others'];
const SKILLS = ['Programming Tools','Software Packages','Laboratory Techniques','AI/ML Tools','Simulation Tools','Statistical Analysis Tools','Other Technical Skills'];
const CHALLENGES = ['Research-related Issues','Laboratory/Computational Issues','Publication-related Issues','Administrative Issues','Other Issues'];
const PARTICIPATION = ['PhD/Workshop','Seminar Presentation','Conference Participation','Guest Lectures Attended','Research Discussions','Hackathon','Internship','Other'];
const MAX_FILE_MB = 10;

const statusColor = (s: string) => {
  if (s === 'DEAN_APPROVED') return 'text-green-700 bg-green-50 border-green-200';
  if (s === 'DRAFT') return 'text-gray-600 bg-gray-50 border-gray-200';
  if (s.endsWith('_RETURNED') || s === 'DEAN_REJECTED') return 'text-red-700 bg-red-50 border-red-200';
  return 'text-blue-700 bg-blue-50 border-blue-200';
};

export default function ScholarDashboard() {
  const { user } = useAuth();
  const [moms, setMoms] = useState<MinutesOfMeeting[]>([]);
  const [selected, setSelected] = useState<MinutesOfMeeting | null>(null);
  const [form, setForm] = useState<any>(null);
  const [attachments, setAttachments] = useState<SectionAttachment[]>([]);
  const [typedName, setTypedName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('A');

  const freshForm = () => ({
    periodYear: new Date().getFullYear(),
    periodMonth: new Date().getMonth() + 1,
    sectionAScholarName: user?.fullName || '',
    sectionARegistrationDate: '',
    sectionASessionYear: 'January',
    sectionASupervisorName: '',
    sectionACosupervisorName: '',
    sectionADepartment: '',
    sectionAScopusId: '',
    sectionAOrcidId: '',
    sectionALinked: false,
    sectionAPhdTitle: '',
    sectionAFunding: 'NO',
    sectionAJrfSrf: 'JRF',
    sectionAProjectTitle: '',
    sectionAFundingAgency: '',
    sectionAPiName: '',
    sectionBCourseworkCompleted: false,
    sectionBCourseworksRecommended: 0,
    sectionCMilestones: MILESTONES.map((name) => ({ name, status: 'In-Progress', expectedCompletionDate: '' })),
    sectionDThroughputs: THROUGHPUTS.map((particular) => ({ particular, journalType: 'Scopus', count: 0 })),
    sectionESkills: SKILLS.map((skill) => ({ skill, details: '' })),
    sectionFChallenges: CHALLENGES.map((area) => ({ area, description: '' })),
    sectionFParticipation: PARTICIPATION.map((activity) => ({ activity, details: '' })),
    sectionFPlannedActivities: [{ activityName: '', targetDate: '' }],
    sectionGLeaves: [{ fromDate: '', toDate: '', type: 'Casual Leave', reason: '' }],
    sectionGLabHours: 0,
    sectionGTutorialHours: 0,
    sectionGSupport: 'YES',
    sectionGRemarks: '',
  });

  const load = async () => {
    try { const r = await getMyMoms(); setMoms(r.data); }
    catch (e: any) { setError(e?.response?.data?.message || 'Load failed'); }
  };
  useEffect(() => { load(); }, []);

  const loadAttachments = async (momId: number) => {
    try { const r = await listSectionAttachments(momId); setAttachments(r.data); }
    catch { setAttachments([]); }
  };

  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const updRow = (s: string, i: number, k: string, v: any) => {
    setForm((f: any) => {
      const a = [...f[s]];
      a[i] = { ...a[i], [k]: v };
      return { ...f, [s]: a };
    });
  };

  const isEditable = (m: MinutesOfMeeting) => m.currentStatus === 'DRAFT' || m.currentStatus.endsWith('_RETURNED');

  const handleCreate = async () => {
    setError(''); setSuccess('');
    try {
      const res = await createDraft(freshForm());
      setSelected(res.data);
      await load();
      setSuccess('Draft created.');
    } catch (e: any) { setError(e?.response?.data?.message || 'Create failed'); }
  };

  const openMom = async (m: MinutesOfMeeting) => {
    setSelected(m); setSuccess(''); setError(''); setTypedName(''); setActiveTab('A');
    const f = freshForm();
    if (m.sectionCMilestones) try { f.sectionCMilestones = JSON.parse(m.sectionCMilestones); } catch {}
    if (m.sectionDThroughputs) try { f.sectionDThroughputs = JSON.parse(m.sectionDThroughputs); } catch {}
    if (m.sectionESkills) try { f.sectionESkills = JSON.parse(m.sectionESkills); } catch {}
    if (m.sectionFChallenges) try { f.sectionFChallenges = JSON.parse(m.sectionFChallenges); } catch {}
    if (m.sectionFParticipation) try { f.sectionFParticipation = JSON.parse(m.sectionFParticipation); } catch {}
    if (m.sectionFPlannedActivities) try { f.sectionFPlannedActivities = JSON.parse(m.sectionFPlannedActivities); } catch {}
    if (m.sectionGLeaves) try { f.sectionGLeaves = JSON.parse(m.sectionGLeaves); } catch {}
    setForm({
      ...f,
      periodYear: m.periodYear || f.periodYear,
      periodMonth: m.periodMonth || f.periodMonth,
      sectionAScholarName: m.sectionAScholarName || f.sectionAScholarName,
      sectionARegistrationDate: m.sectionARegistrationDate || '',
      sectionASessionYear: m.sectionASessionYear || 'January',
      sectionASupervisorName: m.sectionASupervisorName || '',
      sectionACosupervisorName: m.sectionACosupervisorName || '',
      sectionADepartment: m.sectionADepartment || '',
      sectionAScopusId: m.sectionAScopusId || '',
      sectionAOrcidId: m.sectionAOrcidId || '',
      sectionALinked: m.sectionALinked || false,
      sectionAPhdTitle: m.sectionAPhdTitle || '',
      sectionAFunding: m.sectionAFunding || 'NO',
      sectionAJrfSrf: m.sectionAJrfSrf || 'JRF',
      sectionAProjectTitle: m.sectionAProjectTitle || '',
      sectionAFundingAgency: m.sectionAFundingAgency || '',
      sectionAPiName: m.sectionAPiName || '',
      sectionBCourseworkCompleted: m.sectionBCourseworkCompleted || false,
      sectionBCourseworksRecommended: m.sectionBCourseworksRecommended || 0,
      sectionGLabHours: m.sectionGLabHours || 0,
      sectionGTutorialHours: m.sectionGTutorialHours || 0,
      sectionGSupport: m.sectionGSupport || 'YES',
      sectionGRemarks: m.sectionGRemarks || '',
    });
    await loadAttachments(m.id);
  };

  const handleUpload = async (section: string, file: File, rowIndex?: number) => {
    if (!selected) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError('File too large. Maximum ' + MAX_FILE_MB + ' MB allowed.');
      return;
    }
    setUploading(section + ':' + (rowIndex ?? ''));
    try {
      await uploadSectionAttachment(selected.id, file, section, rowIndex);
      await loadAttachments(selected.id);
      setSuccess('Proof uploaded.');
    } catch (e: any) { setError(e?.response?.data?.message || 'Upload failed'); }
    finally { setUploading(null); }
  };

  const handleDeleteAttachment = async (id: number) => {
    if (!selected) return;
    try { await deleteSectionAttachment(id); await loadAttachments(selected.id); }
    catch (e: any) { setError(e?.response?.data?.message || 'Delete failed'); }
  };

  const handleSubmit = async () => {
    if (!selected) return;
    if (!typedName.trim()) { setError('Please type your full name to sign.'); return; }
    setError('');
    try {
      await submitMom(selected.id, { ...form, typedName });
      setConfirmOpen(false);
      setSelected(null);
      setSuccess('MoM submitted. Routed to your Supervisor.');
      await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Submit failed'); }
  };

  const editable = !!selected && isEditable(selected);
  const completedCount = form ? form.sectionCMilestones.filter((m: any) => m.status === 'Completed').length : 0;
  const progressPct = (() => {
    if (!form) return 0;
    if (selected && selected.currentStatus === 'DEAN_APPROVED') return 100;
    return Math.round((completedCount / form.sectionCMilestones.length) * 100);
  })();

  const ProofCell = ({ section, rowIndex }: { section: string; rowIndex?: number }) => {
    const files = attachments.filter((a) => a.section === section && (rowIndex === undefined || a.rowIndex === rowIndex));
    return (
      <div className="flex flex-wrap gap-1 items-center">
        {files.map((a) => (
          <span key={a.id} className="inline-flex items-center gap-1 bg-green-50 border border-green-300 rounded px-1.5 py-0.5 text-[11px]">
            <a href={attachmentDownloadUrl(a.id)} target="_blank" rel="noreferrer" className="text-green-800 hover:underline max-w-[140px] truncate">{a.fileName}</a>
            {editable ? <button onClick={() => handleDeleteAttachment(a.id)} className="text-red-600 font-bold">x</button> : null}
          </span>
        ))}
        {editable ? (
          <label className="cursor-pointer text-[11px] bg-blue-50 hover:bg-blue-100 border border-blue-200 text-srm-blue px-2 py-0.5 rounded font-medium whitespace-nowrap">
            {uploading === section + ':' + (rowIndex ?? '') ? 'Uploading...' : '+ Attach'}
            <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (f) handleUpload(section, f, rowIndex);
                e.target.value = '';
              }} />
          </label>
        ) : null}
        {files.length === 0 && !editable ? <span className="text-[11px] text-gray-400">-</span> : null}
      </div>
    );
  };

  const TABS = [
    { key: 'A', label: 'A. Scholar' },
    { key: 'B', label: 'B. Work' },
    { key: 'C', label: 'C. Milestones' },
    { key: 'D', label: 'D. Throughputs' },
    { key: 'E', label: 'E. Skills' },
    { key: 'F', label: 'F. Challenges' },
    { key: 'G', label: 'G. Assistantship' },
    { key: 'LEAVE', label: 'Leave' },
    { key: 'REVIEW', label: 'Review & Submit' },
  ];

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* SRM Header */}
      <div className="bg-white rounded-xl border border-srm-border p-4 mb-6 flex items-center gap-5 shadow-sm">
        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
          <img src="/srm-logo.jpg" alt="SRM" className="h-16 w-auto object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div className="flex-1 border-l-2 border-srm-blue pl-5">
          <h1 className="font-serif text-lg font-bold text-srm-blue leading-tight">SRM Institute of Science and Technology</h1>
          <p className="text-xs text-gray-500 mt-0.5">Directorate of Research &middot; Monthly Progress Review of Full-Time Scholars</p>
        </div>
      </div>

      {error ? <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div> : null}
      {success ? <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{success}</div> : null}

      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-gray-800 leading-tight">My Minutes of Meetings</h2>
          <p className="text-sm text-gray-500 mt-1">Create and submit your monthly progress reports for review</p>
        </div>
        <button onClick={handleCreate} className="srm-btn srm-btn-primary shadow-sm">+ Create New MoM</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List Panel */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-srm-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-srm-border bg-gray-50/70 flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-widest font-bold text-gray-600">My Submissions</h3>
              <span className="text-xs font-bold text-srm-blue bg-blue-50 px-2.5 py-1 rounded-full">{moms.length}</span>
            </div>
            <div className="max-h-[640px] overflow-y-auto">
              {moms.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">No MoMs yet</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {moms.map((m) => {
                    const isActive = selected && selected.id === m.id;
                    return (
                      <li key={m.id}>
                        <button onClick={() => openMom(m)}
                          className={`w-full text-left px-5 py-4 transition-all ${isActive ? 'bg-blue-50 border-l-4 border-srm-blue' : 'border-l-4 border-transparent hover:bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="font-mono text-[11px] font-bold text-gray-700">{m.momNumber}</p>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(m.currentStatus)}`}>
                              {m.currentStatus.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">{MONTHS[(m.periodMonth || 1) - 1]} {m.periodYear}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-8">
          {!selected ? (
            <div className="bg-white rounded-xl border border-srm-border shadow-sm p-16 text-center flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5 text-srm-blue text-3xl font-bold">MoM</div>
              <h3 className="font-serif text-xl font-bold text-gray-700 mb-2">No MoM Selected</h3>
              <p className="text-sm text-gray-500 max-w-sm mb-5">Choose a Minutes of Meeting from the list, or create a new one to get started.</p>
              <button onClick={handleCreate} className="srm-btn srm-btn-primary">Create New MoM</button>
            </div>
          ) : null}

          {selected && form ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="bg-white rounded-xl border border-srm-border shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-base font-bold text-gray-800">{selected.momNumber}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <strong className="text-gray-700">{MONTHS[form.periodMonth - 1]} {form.periodYear}</strong>
                      <span className="mx-2 text-gray-300">|</span>Scholar ID: {selected.scholarId}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusColor(selected.currentStatus)}`}>
                    {selected.currentStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="mt-5">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold text-gray-600 uppercase tracking-wider text-[10px]">Milestone Progress</span>
                    <span className="font-bold text-srm-blue">{progressPct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${progressPct === 100 ? 'bg-green-500' : 'bg-srm-blue'}`}
                      style={{ width: progressPct + '%' }} />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl border border-srm-border shadow-sm overflow-hidden">
                <div className="flex border-b border-srm-border overflow-x-auto bg-gray-50/70">
                  {TABS.map((t) => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                      className={`px-5 py-3.5 text-[12px] font-semibold whitespace-nowrap transition-all relative ${activeTab === t.key ? 'text-srm-blue bg-white' : 'text-gray-500 hover:text-gray-800'}`}>
                      {t.label}
                      {activeTab === t.key ? <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-srm-blue"></span> : null}
                    </button>
                  ))}
                </div>

                <div className="p-7">
                  {activeTab === 'A' ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-srm-blue uppercase tracking-wider">Section A - Scholar Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Scholar Name"><input className="srm-input" value={form.sectionAScholarName} disabled={!editable} onChange={(e) => update('sectionAScholarName', e.target.value)} /></Field>
                        <Field label="Date of Registration"><input type="date" className="srm-input" value={form.sectionARegistrationDate} disabled={!editable} onChange={(e) => update('sectionARegistrationDate', e.target.value)} /></Field>
                        <Field label="Session">
                          <select className="srm-input" value={form.sectionASessionYear} disabled={!editable} onChange={(e) => update('sectionASessionYear', e.target.value)}>
                            <option>January</option><option>July</option>
                          </select>
                        </Field>
                        <Field label="Supervisor Name"><input className="srm-input" value={form.sectionASupervisorName} disabled={!editable} onChange={(e) => update('sectionASupervisorName', e.target.value)} /></Field>
                        <Field label="Co-Supervisor"><input className="srm-input" value={form.sectionACosupervisorName} disabled={!editable} onChange={(e) => update('sectionACosupervisorName', e.target.value)} /></Field>
                        <Field label="Department"><input className="srm-input" value={form.sectionADepartment} disabled={!editable} onChange={(e) => update('sectionADepartment', e.target.value)} /></Field>
                        <Field label="Scopus ID"><input className="srm-input" value={form.sectionAScopusId} disabled={!editable} onChange={(e) => update('sectionAScopusId', e.target.value)} /></Field>
                        <Field label="ORCID ID"><input className="srm-input" value={form.sectionAOrcidId} disabled={!editable} onChange={(e) => update('sectionAOrcidId', e.target.value)} /></Field>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.sectionALinked} disabled={!editable} onChange={(e) => update('sectionALinked', e.target.checked)} />
                        Scopus linked to ORCID
                      </label>
                      <Field label="Title of PhD Work"><input className="srm-input" value={form.sectionAPhdTitle} disabled={!editable} onChange={(e) => update('sectionAPhdTitle', e.target.value)} /></Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Receiving Funding?">
                          <select className="srm-input" value={form.sectionAFunding} disabled={!editable} onChange={(e) => update('sectionAFunding', e.target.value)}>
                            <option>NO</option><option>YES</option>
                          </select>
                        </Field>
                        {form.sectionAFunding === 'YES' ? (
                          <>
                            <Field label="JRF / SRF">
                              <select className="srm-input" value={form.sectionAJrfSrf} disabled={!editable} onChange={(e) => update('sectionAJrfSrf', e.target.value)}>
                                <option>JRF</option><option>SRF</option>
                              </select>
                            </Field>
                            <Field label="Project Title"><input className="srm-input" value={form.sectionAProjectTitle} disabled={!editable} onChange={(e) => update('sectionAProjectTitle', e.target.value)} /></Field>
                            <Field label="Funding Agency"><input className="srm-input" value={form.sectionAFundingAgency} disabled={!editable} onChange={(e) => update('sectionAFundingAgency', e.target.value)} /></Field>
                            <Field label="Principal Investigator"><input className="srm-input" value={form.sectionAPiName} disabled={!editable} onChange={(e) => update('sectionAPiName', e.target.value)} /></Field>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {activeTab === 'B' ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-srm-blue uppercase tracking-wider">Section B - Status of Research Work</h3>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.sectionBCourseworkCompleted} disabled={!editable} onChange={(e) => update('sectionBCourseworkCompleted', e.target.checked)} />
                        Course Work Completed
                      </label>
                      <div className="max-w-xs">
                        <Field label="No. of Course Works recommended by DAC">
                          <input type="number" className="srm-input" value={form.sectionBCourseworksRecommended} disabled={!editable} onChange={(e) => update('sectionBCourseworksRecommended', Number(e.target.value))} />
                        </Field>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === 'C' ? (
                    <div>
                      <h3 className="text-sm font-bold text-srm-blue uppercase tracking-wider mb-2">Section C - Research Milestones</h3>
                      <p className="text-xs text-gray-500 mb-4">Attach proof for each milestone (max {MAX_FILE_MB} MB)</p>
                      <table className="srm-table">
                        <thead><tr><th>Milestone</th><th>Status</th><th>Expected Date</th><th>Proof</th></tr></thead>
                        <tbody>
                          {form.sectionCMilestones.map((r: any, i: number) => (
                            <tr key={i}>
                              <td className="font-medium">{r.name}</td>
                              <td><select className="srm-input" value={r.status} disabled={!editable} onChange={(e) => updRow('sectionCMilestones', i, 'status', e.target.value)}>
                                <option>Completed</option><option>In-Progress</option>
                              </select></td>
                              <td><input type="date" className="srm-input" value={r.expectedCompletionDate} disabled={!editable} onChange={(e) => updRow('sectionCMilestones', i, 'expectedCompletionDate', e.target.value)} /></td>
                              <td><ProofCell section="C" rowIndex={i} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {activeTab === 'D' ? (
                    <div>
                      <h3 className="text-sm font-bold text-srm-blue uppercase tracking-wider mb-2">Section D - Research Throughputs</h3>
                      <p className="text-xs text-gray-500 mb-4">Attach proof for each row (max {MAX_FILE_MB} MB)</p>
                      <table className="srm-table">
                        <thead><tr><th>Particulars</th><th>Journal Type</th><th>Count</th><th>Proof</th></tr></thead>
                        <tbody>
                          {form.sectionDThroughputs.map((r: any, i: number) => (
                            <tr key={i}>
                              <td className="font-medium">{r.particular}</td>
                              <td><select className="srm-input" value={r.journalType} disabled={!editable} onChange={(e) => updRow('sectionDThroughputs', i, 'journalType', e.target.value)}>
                                {JOURNALS.map((j) => <option key={j}>{j}</option>)}
                              </select></td>
                              <td className="w-24"><input type="number" className="srm-input" value={r.count} disabled={!editable} onChange={(e) => updRow('sectionDThroughputs', i, 'count', Number(e.target.value))} /></td>
                              <td><ProofCell section="D" rowIndex={i} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {activeTab === 'E' ? (
                    <div>
                      <h3 className="text-sm font-bold text-srm-blue uppercase tracking-wider mb-4">Section E - Skills Acquired During the Period</h3>
                      <table className="srm-table">
                        <thead><tr><th>Particulars</th><th>Details</th></tr></thead>
                        <tbody>
                          {form.sectionESkills.map((r: any, i: number) => (
                            <tr key={i}>
                              <td className="font-medium w-1/3">{r.skill}</td>
                              <td><input className="srm-input" value={r.details} disabled={!editable} onChange={(e) => updRow('sectionESkills', i, 'details', e.target.value)} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {activeTab === 'F' ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-srm-blue uppercase tracking-wider mb-4">F.1 - Challenges Faced</h3>
                        <table className="srm-table">
                          <thead><tr><th>Area</th><th>Description</th></tr></thead>
                          <tbody>
                            {form.sectionFChallenges.map((r: any, i: number) => (
                              <tr key={i}>
                                <td className="font-medium w-1/4">{r.area}</td>
                                <td><input className="srm-input" value={r.description} disabled={!editable} onChange={(e) => updRow('sectionFChallenges', i, 'description', e.target.value)} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-srm-blue uppercase tracking-wider mb-2">F.2 - Participation in Scholarly Activities</h3>
                        <p className="text-xs text-gray-500 mb-4">Attach proof (certificates, hackathon proof, conference registration)</p>
                        <table className="srm-table">
                          <thead><tr><th>Activity</th><th>Details</th><th>Proof</th></tr></thead>
                          <tbody>
                            {form.sectionFParticipation.map((r: any, i: number) => (
                              <tr key={i}>
                                <td className="font-medium w-1/4">{r.activity}</td>
                                <td><input className="srm-input" value={r.details} disabled={!editable} onChange={(e) => updRow('sectionFParticipation', i, 'details', e.target.value)} /></td>
                                <td className="w-48"><ProofCell section="F_PART" rowIndex={i} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-srm-blue uppercase tracking-wider mb-4">F.3 - Activities Planned</h3>
                        <table className="srm-table">
                          <thead><tr><th>Activity</th><th>Target Date</th>{editable ? <th></th> : null}</tr></thead>
                          <tbody>
                            {form.sectionFPlannedActivities.map((r: any, i: number) => (
                              <tr key={i}>
                                <td><input className="srm-input" value={r.activityName} disabled={!editable} onChange={(e) => updRow('sectionFPlannedActivities', i, 'activityName', e.target.value)} /></td>
                                <td className="w-48"><input type="date" className="srm-input" value={r.targetDate} disabled={!editable} onChange={(e) => updRow('sectionFPlannedActivities', i, 'targetDate', e.target.value)} /></td>
                                {editable ? (
                                  <td className="w-12">
                                    <button onClick={() => {
                                      const arr = form.sectionFPlannedActivities.filter((_: any, j: number) => j !== i);
                                      update('sectionFPlannedActivities', arr.length ? arr : [{ activityName: '', targetDate: '' }]);
                                    }} className="text-red-600 font-bold">x</button>
                                  </td>
                                ) : null}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {editable ? (
                          <button onClick={() => update('sectionFPlannedActivities', [...form.sectionFPlannedActivities, { activityName: '', targetDate: '' }])}
                            className="mt-3 text-xs font-semibold text-srm-blue hover:underline">+ Add Activity</button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {activeTab === 'G' ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-srm-blue uppercase tracking-wider">Section G - Teaching Assistantship</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Lab hours / week"><input type="number" className="srm-input" value={form.sectionGLabHours} disabled={!editable} onChange={(e) => update('sectionGLabHours', Number(e.target.value))} /></Field>
                        <Field label="Tutorial hours / week"><input type="number" className="srm-input" value={form.sectionGTutorialHours} disabled={!editable} onChange={(e) => update('sectionGTutorialHours', Number(e.target.value))} /></Field>
                      </div>
                      <div className="max-w-xs">
                        <Field label="Enough support from faculty and HoD?">
                          <select className="srm-input" value={form.sectionGSupport} disabled={!editable} onChange={(e) => update('sectionGSupport', e.target.value)}>
                            <option>YES</option><option>NO</option>
                          </select>
                        </Field>
                      </div>
                      <Field label="Remarks"><textarea className="srm-input" rows={3} value={form.sectionGRemarks} disabled={!editable} onChange={(e) => update('sectionGRemarks', e.target.value)} /></Field>
                    </div>
                  ) : null}

                  {activeTab === 'LEAVE' ? (
                    <div>
                      <h3 className="text-sm font-bold text-srm-blue uppercase tracking-wider mb-2">Leave Requests</h3>
                      <p className="text-xs text-gray-500 mb-4">Attach approval email or letter for each leave (max {MAX_FILE_MB} MB)</p>
                      <table className="srm-table">
                        <thead><tr><th>From</th><th>To</th><th>Type</th><th>Reason</th><th>Proof</th>{editable ? <th></th> : null}</tr></thead>
                        <tbody>
                          {form.sectionGLeaves.map((r: any, i: number) => (
                            <tr key={i}>
                              <td className="w-40"><input type="date" className="srm-input" value={r.fromDate} disabled={!editable} onChange={(e) => updRow('sectionGLeaves', i, 'fromDate', e.target.value)} /></td>
                              <td className="w-40"><input type="date" className="srm-input" value={r.toDate} disabled={!editable} onChange={(e) => updRow('sectionGLeaves', i, 'toDate', e.target.value)} /></td>
                              <td className="w-40">
                                <select className="srm-input" value={r.type} disabled={!editable} onChange={(e) => updRow('sectionGLeaves', i, 'type', e.target.value)}>
                                  {['Casual Leave','Medical Leave','OD (On Duty)','Vacation','Other'].map((t) => <option key={t}>{t}</option>)}
                                </select>
                              </td>
                              <td><input className="srm-input" value={r.reason} disabled={!editable} onChange={(e) => updRow('sectionGLeaves', i, 'reason', e.target.value)} /></td>
                              <td className="w-48"><ProofCell section="LEAVE" rowIndex={i} /></td>
                              {editable ? (
                                <td className="w-12">
                                  <button onClick={() => {
                                    const arr = form.sectionGLeaves.filter((_: any, j: number) => j !== i);
                                    update('sectionGLeaves', arr.length ? arr : [{ fromDate: '', toDate: '', type: 'Casual Leave', reason: '' }]);
                                  }} className="text-red-600 font-bold">x</button>
                                </td>
                              ) : null}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {editable ? (
                        <button onClick={() => update('sectionGLeaves', [...form.sectionGLeaves, { fromDate: '', toDate: '', type: 'Casual Leave', reason: '' }])}
                          className="mt-3 text-xs font-semibold text-srm-blue hover:underline">+ Add Leave</button>
                      ) : null}
                    </div>
                  ) : null}

                  {activeTab === 'REVIEW' ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-srm-blue uppercase tracking-wider mb-2">Final Step - Review and Submit</h3>
                        <p className="text-sm text-gray-600">Verify that all sections A through G, and Leave, are correctly filled before submitting.</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
                        <p className="font-semibold text-srm-blue mb-2">What happens after you submit:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Your MoM is routed to your assigned Supervisor for review.</li>
                          <li>Then to the Institutional Research Coordinator.</li>
                          <li>Then to the Head of Institute for endorsement.</li>
                          <li>Finally the Dean of Research gives the approval.</li>
                          <li>You cannot edit this MoM while it is under review. If any correction is needed, it will be returned to you with remarks.</li>
                        </ul>
                      </div>
                      {editable ? (
                        <div className="border-t pt-5">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Type your full name below to sign and submit</label>
                          <input className="srm-input mb-4 max-w-md" value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder="e.g. Scholar One" />
                          <button onClick={() => setConfirmOpen(true)} disabled={!typedName.trim()} className="srm-btn srm-btn-primary">Submit for Review</button>
                        </div>
                      ) : (
                        <div className="border-t pt-5 text-sm text-gray-600">
                          This MoM has already been submitted. Status: <strong>{selected.currentStatus.replace(/_/g, ' ')}</strong>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        title="Submit MoM for Approval?"
        message={'You are about to submit this Minutes of Meeting for approval.\n\nOnce submitted:\n- It will be routed to your assigned Supervisor for review\n- Then to the Institutional Research Coordinator\n- Then to the Head of Institute\n- Finally the Dean of Research gives approval\n\nYou will not be able to edit this MoM while it is under review.'}
        confirmLabel="Submit"
        requireCheckbox
        checkboxLabel="I have verified all information in this form is correct and complete."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
      />
    </div>
  );
}