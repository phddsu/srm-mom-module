import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  getMomById, submitMom, saveMomDraft, getMyMoms, getMyProfile,
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

const COURSEWORKS = [
  { code: '', title: '', type: 'DL', lectureHours: 0, tutorialHours: 0, practicalHours: 0, credits: 0, status: 'Not Started', mandatory: true },
  { code: '', title: '', type: 'DL', lectureHours: 0, tutorialHours: 0, practicalHours: 0, credits: 0, status: 'Not Started', mandatory: true },
  { code: '', title: '', type: 'MC', lectureHours: 0, tutorialHours: 0, practicalHours: 0, credits: 0, status: 'Not Started', mandatory: false },
  { code: '', title: '', type: 'MC', lectureHours: 0, tutorialHours: 0, practicalHours: 0, credits: 0, status: 'Not Started', mandatory: false },
];

const statusColor = (s: string) => {
  if (s === 'DEAN_APPROVED') return 'text-green-700 bg-green-50 border-green-200';
  if (s === 'DRAFT') return 'text-gray-600 bg-gray-50 border-gray-200';
  if (s.endsWith('_RETURNED') || s === 'DEAN_REJECTED') return 'text-red-700 bg-red-50 border-red-200';
  return 'text-blue-700 bg-blue-50 border-blue-200';
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

export default function MoMDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<MinutesOfMeeting | null>(null);
  const [form, setForm] = useState<any>(null);
  const [attachments, setAttachments] = useState<SectionAttachment[]>([]);
  const [typedName, setTypedName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('A');
  const [previousDSubmissions, setPreviousDSubmissions] = useState<any[]>([]);
  const [scholarProfile, setScholarProfile] = useState<any>(null);

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
    sectionBCourseworks: COURSEWORKS.map((r) => ({ ...r })),
    sectionBCompletedCount: 0,
    sectionBCVCompleted: false,
    sectionBCVDate: '',
    sectionBDcmConducted: false,
    sectionBPrePhdCompleted: false,
    sectionBSynopsisSubmitted: false,
    sectionBThesisSubmitted: false,
    sectionCMilestones: MILESTONES.map((name) => ({ name, status: 'In-Progress', expectedCompletionDate: '' })),
    sectionDThroughputs: THROUGHPUTS.map((particular) => ({
      articleType: particular,
      stage: 'Published',
      journalName: 'Scopus',
      count: 0
    })),
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

  const loadAttachments = async (momId: number) => {
    try { const r = await listSectionAttachments(momId); setAttachments(r.data); }
    catch { setAttachments([]); }
  };

  const loadPreviousD = async (currentMom: MinutesOfMeeting) => {
    try {
      const r = await getMyMoms();
      const curY = currentMom.periodYear || 0;
      const curM = currentMom.periodMonth || 0;
      
      // Filter for MoMs that are STRICTLY OLDER than the current month
      const older = r.data.filter((mm: any) => 
        mm.id !== currentMom.id &&
        ((mm.periodYear || 0) < curY || 
         ((mm.periodYear || 0) === curY && (mm.periodMonth || 0) < curM))
      );

      const rows: any[] = [];
      for (const mm of older) {
        let rawData = mm.sectionDThroughputs;
        if (!rawData) continue;

        let parsed = rawData;
        if (typeof rawData === 'string') {
          try { parsed = JSON.parse(rawData); } catch { continue; }
        }

        if (!Array.isArray(parsed) || parsed.length === 0) continue;
        const monthLabel = `${MONTHS[(mm.periodMonth || 1) - 1].slice(0,3)} ${mm.periodYear}`;

        for (const item of parsed) {
          if (!item) continue;

          if (item.articleType || item.stage || item.journalName) {
            rows.push({ month: monthLabel, articleType: item.articleType || 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â', stage: item.stage || 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â', journalName: item.journalName || 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â' });
            continue;
          }
          if (item.particular && Array.isArray(item.entries)) {
            for (const e of item.entries) {
              if (!e) continue;
              rows.push({ month: monthLabel, articleType: item.particular, stage: e.journalType || 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â', journalName: e.count ? String(e.count) : 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â' });
            }
            continue;
          }
          if (item.particular) {
            rows.push({ month: monthLabel, articleType: item.particular, stage: item.journalType || 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â', journalName: item.count ? String(item.count) : 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â' });
          }
        }
      }
      rows.reverse(); // Most recent older MoM at the top
      setPreviousDSubmissions(rows);
    } catch { setPreviousDSubmissions([]); }
  };

    const openMom = (m: MinutesOfMeeting, profileData: any = null) => {
    setSelected(m); setSuccess(''); setError(''); setTypedName(''); setActiveTab('A');
    const f = freshForm();
    
    const isLocked = profileData && profileData.status === 'APPROVED';
    if (isLocked) {
      if (profileData.scholarFullName) f.sectionAScholarName = profileData.scholarFullName;
      if (profileData.supervisorName) f.sectionASupervisorName = profileData.supervisorName;
      if (profileData.tentativeTopic) f.sectionAPhdTitle = profileData.tentativeTopic;
      if (profileData.batch) f.sectionASessionYear = profileData.batch.includes('July') ? 'July' : 'January';
    }

    if (m.sectionCMilestones) try { const p = JSON.parse(m.sectionCMilestones); if(Array.isArray(p)) f.sectionCMilestones = p; } catch {}
    if (m.sectionBCourseworks) try { const p = JSON.parse(m.sectionBCourseworks); if(Array.isArray(p)) f.sectionBCourseworks = p; } catch {}
    if (m.sectionDThroughputs) try {
      const raw = JSON.parse(m.sectionDThroughputs);
      const isNewShape = Array.isArray(raw) && raw.some((x: any) => x && (x.articleType || x.stage));
      if (isNewShape) {
        const cleaned = raw.filter((x: any) => x && (x.articleType || x.stage || x.journalName));
        f.sectionDThroughputs = cleaned.length ? cleaned : THROUGHPUTS.map((particular) => ({ articleType: particular, stage: 'Published', journalName: 'Scopus', count: 0 }));
      }
    } catch {}
    
    if (m.sectionESkills) try { const p = JSON.parse(m.sectionESkills); if(Array.isArray(p)) f.sectionESkills = p; } catch {}
    if (m.sectionFChallenges) try { const p = JSON.parse(m.sectionFChallenges); if(Array.isArray(p)) f.sectionFChallenges = p; } catch {}
    if (m.sectionFParticipation) try { const p = JSON.parse(m.sectionFParticipation); if(Array.isArray(p)) f.sectionFParticipation = p; } catch {}
    if (m.sectionFPlannedActivities) try { const p = JSON.parse(m.sectionFPlannedActivities); if(Array.isArray(p)) f.sectionFPlannedActivities = p; } catch {}
    if (m.sectionGLeaves) try { const p = JSON.parse(m.sectionGLeaves); if(Array.isArray(p)) f.sectionGLeaves = p; } catch {}
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
      sectionAPhdTitle: isLocked ? f.sectionAPhdTitle : (m.sectionAPhdTitle || ''),
      sectionAFunding: m.sectionAFunding || 'NO',
      sectionAJrfSrf: m.sectionAJrfSrf || 'JRF',
      sectionAProjectTitle: m.sectionAProjectTitle || '',
      sectionAFundingAgency: m.sectionAFundingAgency || '',
      sectionAPiName: m.sectionAPiName || '',
      sectionBCourseworkCompleted: m.sectionBCourseworkCompleted || false,
      sectionBCourseworksRecommended: m.sectionBCourseworksRecommended || 0,
      sectionBCourseworks: Array.isArray(f.sectionBCourseworks) ? f.sectionBCourseworks : COURSEWORKS.map((r) => ({ ...r })),
      sectionGLabHours: m.sectionGLabHours || 0,
      sectionGTutorialHours: m.sectionGTutorialHours || 0,
      sectionGSupport: m.sectionGSupport || 'YES',
      sectionGRemarks: m.sectionGRemarks || '',
    });
    loadAttachments(m.id);
    loadPreviousD(m);
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await getMomById(Number(id));
        let profileData = null;
        try {
          const profileRes = await getMyProfile();
          profileData = profileRes.data;
        } catch (err) {
          console.warn("Profile fetch failed", err);
        }
        setScholarProfile(profileData);
        openMom(r.data, profileData);
      } catch (e: any) {
        console.error("MoM Load Error:", e);
        setError(e?.response?.data?.message || e?.message || 'Load failed');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const updRow = (s: string, i: number, k: string, v: any) => {
    setForm((f: any) => {
      const a = [...f[s]];
      a[i] = { ...a[i], [k]: v };
      return { ...f, [s]: a };
    });
  };

  const editable = !!selected && (selected.currentStatus === 'DRAFT' || selected.currentStatus.endsWith('_RETURNED'));
  const isProfileLocked = scholarProfile?.status === 'APPROVED';
  const isNameLocked = isProfileLocked && !!scholarProfile?.scholarFullName;
  const isSessionLocked = isProfileLocked && !!scholarProfile?.batch;
  const isSupervisorLocked = isProfileLocked && !!scholarProfile?.supervisorName;
  const isTitleLocked = isProfileLocked && !!scholarProfile?.tentativeTopic;
  const canEditSectionA = editable && !isProfileLocked;

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

  const handleDeleteAttachment = async (aid: number) => {
    if (!selected) return;
    try { await deleteSectionAttachment(aid); await loadAttachments(selected.id); }
    catch (e: any) { setError(e?.response?.data?.message || 'Delete failed'); }
  };

  const handleSaveDraft = async () => {
    if (!selected) return;
    setError(''); setSuccess('');
    try {
      await saveMomDraft(selected.id, { ...form });
      setSuccess('Draft saved.');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Save failed');
    }
  };
  const handleSubmit = async () => {
    if (!selected) return;
    if (!typedName.trim()) { setError('Please type your full name to sign.'); return; }
    setError('');
    try {
      await submitMom(selected.id, { ...form, typedName });
      setConfirmOpen(false);
      setSuccess('MoM submitted. Routed to your Supervisor.');
      navigate('/scholar');
    } catch (e: any) { setError(e?.response?.data?.message || 'Submit failed'); }
  };

  const completedCount = form && Array.isArray(form.sectionCMilestones) ? form.sectionCMilestones.filter((m: any) => m.status === 'Completed').length : 0;
  const progressPct = (() => {
    if (!form) return 0;
    if (selected && selected.currentStatus === 'DEAN_APPROVED') return 100;
    const total = Array.isArray(form.sectionCMilestones) ? form.sectionCMilestones.length : 0;
    return total ? Math.round((completedCount / total) * 100) : 0;
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
    { key: 'REVIEW', label: 'Review & Submit' },
  ];

  if (!form || !selected) {
    return (
      <div className="p-8 w-full">
        <button onClick={() => navigate('/scholar')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-srm-blueLight text-srm-blue border border-srm-blue/20 hover:bg-srm-blue hover:text-white transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back
        </button>
        {error ? <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
          : <div className="p-3 text-sm text-gray-500">Loading MoM...</div>}
      </div>
    );
  }

  return (
    <div className="p-8 w-full">
      <div className="flex items-center gap-4 mb-5">
        <button onClick={() => navigate('/scholar')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-srm-blueLight text-srm-blue border border-srm-blue/20 hover:bg-srm-blue hover:text-white transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back
        </button>
        <span className="font-mono text-sm font-bold text-gray-800">{selected.momNumber}</span>
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColor(selected.currentStatus)}`}>
          {selected.currentStatus.replace(/_/g, ' ')}
        </span>
      </div>

      {error ? <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div> : null}
      {success ? <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{success}</div> : null}

      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-srm-border shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-mono text-base font-bold text-gray-800">{selected.momNumber}</p>
              <p className="text-xs text-gray-500 mt-1">
                <strong className="text-gray-700">{MONTHS[form.periodMonth - 1]} {form.periodYear}</strong>
                <span className="mx-2 text-gray-300">|</span>Scholar ID: {selected.scholarId}
              </p>
            </div>
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

        <div className="bg-white rounded-xl border border-srm-border shadow-sm overflow-hidden">
          <div className="flex border-b border-srm-border overflow-x-auto bg-gray-50/70">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-5 py-3.5 text-[12px] font-semibold whitespace-nowrap transition-all relative ${activeTab === t.key ? 'text-srm-blue bg-srm-blueLight font-bold' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
                {t.label}
                {activeTab === t.key ? <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-srm-blue"></span> : null}
              </button>
            ))}
          </div>

          <div className="p-7">
            {activeTab === 'A' ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-srm-blue uppercase tracking-wider">Section A - Scholar Profile</h3>
                {isProfileLocked ? (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg mb-4 mt-2">
                    Your profile is approved. Fields marked with a lock are auto-filled from your profile. The remaining fields can be edited for this month's MoM.
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Scholar Name"><input className="srm-input" value={form.sectionAScholarName} disabled={!editable || isNameLocked} onChange={(e) => update('sectionAScholarName', e.target.value)} /></Field>
                  <Field label="Date of Registration"><input type="date" className="srm-input" value={form.sectionARegistrationDate} disabled={!editable} onChange={(e) => update('sectionARegistrationDate', e.target.value)} /></Field>
                  <Field label="Session">
                    <select className="srm-input" value={form.sectionASessionYear} disabled={!editable || isSessionLocked} onChange={(e) => update('sectionASessionYear', e.target.value)}>
                      <option>January</option><option>July</option>
                    </select>
                  </Field>
                  <Field label="Supervisor Name"><input className="srm-input" value={form.sectionASupervisorName} disabled={!editable || isSupervisorLocked} onChange={(e) => update('sectionASupervisorName', e.target.value)} /></Field>
                  <Field label="Co-Supervisor"><input className="srm-input" value={form.sectionACosupervisorName} disabled={!editable} onChange={(e) => update('sectionACosupervisorName', e.target.value)} /></Field>
                  <Field label="Department"><input className="srm-input" value={form.sectionADepartment} disabled={!editable} onChange={(e) => update('sectionADepartment', e.target.value)} /></Field>
                  <Field label="Scopus ID"><input className="srm-input" value={form.sectionAScopusId} disabled={!editable} onChange={(e) => update('sectionAScopusId', e.target.value)} /></Field>
                  <Field label="ORCID ID"><input className="srm-input" value={form.sectionAOrcidId} disabled={!editable} onChange={(e) => update('sectionAOrcidId', e.target.value)} /></Field>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.sectionALinked} disabled={!editable} onChange={(e) => update('sectionALinked', e.target.checked)} />
                  Scopus linked to ORCID
                </label>
                <Field label="Title of PhD Work"><input className="srm-input" value={form.sectionAPhdTitle} disabled={!editable || isTitleLocked} onChange={(e) => update('sectionAPhdTitle', e.target.value)} /></Field>
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
                  <input type="checkbox" checked={form.sectionBCourseworkCompleted} disabled={!editable}
                    onChange={(e) => update('sectionBCourseworkCompleted', e.target.checked)} />
                  Course Work Completed
                </label>
                <div className="max-w-xs">
                  <Field label="No. of Course Works recommended by DAC">
                    <input type="number" className="srm-input" value={form.sectionBCourseworksRecommended}
                      disabled={!editable}
                      onChange={(e) => update('sectionBCourseworksRecommended', Number(e.target.value))} />
                  </Field>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">
                    Coursework details - first 2 rows are Mandatory. Upload syllabus per row (max {MAX_FILE_MB} MB).
                  </p>
                  <table className="srm-table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Title</th>
                        <th>Type</th>
                        <th>L</th>
                        <th>T</th>
                        <th>P</th>
                        <th>C</th>
                        <th>Status</th>
                        <th>Syllabus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(form.sectionBCourseworks || []).map((r: any, i: number) => (
                        <tr key={i}>
                          <td>
                            {r.mandatory ? <span className="text-red-600 font-bold mr-1" title="Mandatory">*</span> : null}
                            <input className="srm-input" value={r.code} disabled={!editable}
                              onChange={(e) => updRow('sectionBCourseworks', i, 'code', e.target.value)} />
                          </td>
                          <td>
                            <input className="srm-input" value={r.title} disabled={!editable}
                              onChange={(e) => updRow('sectionBCourseworks', i, 'title', e.target.value)} />
                          </td>
                          <td>
                            <select className="srm-input" value={r.type} disabled={!editable}
                              onChange={(e) => updRow('sectionBCourseworks', i, 'type', e.target.value)}>
                              <option>DL</option>
                              <option>MC</option>
                            </select>
                          </td>
<td className="w-20"><input type="text" inputMode="numeric" className="srm-input text-center" value={r.lectureHours === 0 ? '' : String(r.lectureHours)} disabled={!editable} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); updRow('sectionBCourseworks', i, 'lectureHours', val === '' ? 0 : Number(val)); }} /></td>
                          <td className="w-20"><input type="text" inputMode="numeric" className="srm-input text-center" value={r.tutorialHours === 0 ? '' : String(r.tutorialHours)} disabled={!editable} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); updRow('sectionBCourseworks', i, 'tutorialHours', val === '' ? 0 : Number(val)); }} /></td>
                          <td className="w-20"><input type="text" inputMode="numeric" className="srm-input text-center" value={r.practicalHours === 0 ? '' : String(r.practicalHours)} disabled={!editable} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); updRow('sectionBCourseworks', i, 'practicalHours', val === '' ? 0 : Number(val)); }} /></td>
                          <td className="w-20"><input type="text" inputMode="numeric" className="srm-input text-center" value={r.credits === 0 ? '' : String(r.credits)} disabled={!editable} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); updRow('sectionBCourseworks', i, 'credits', val === '' ? 0 : Number(val)); }} /></td>
                          <td>
                            <select className="srm-input" value={r.status} disabled={!editable}
                              onChange={(e) => updRow('sectionBCourseworks', i, 'status', e.target.value)}>
                              <option>Not Started</option>
                              <option>In-Progress</option>
                              <option>Completed</option>
                            </select>
                          </td>
                          <td className="w-48">
                                  <div className="flex flex-col gap-1">
                                    <span className={`text-[10px] font-bold uppercase ${attachments.some(a => a.section === 'B' && a.rowIndex === i) ? 'text-green-600' : 'text-red-500'}`}>
                                      Proof Attached: {attachments.some(a => a.section === 'B' && a.rowIndex === i) ? 'Yes' : 'No'}
                                    </span>
                                    <ProofCell section="B" rowIndex={i} />
                                  </div>
                                </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                                            {/* Extra Section B Fields (Mirroring Physical Form) */}
                      <div className="mt-8">
                        <h4 className="text-sm font-bold text-srm-blue uppercase tracking-wider mb-4">Additional Status Checks</h4>
                        <table className="srm-table">
                          <thead>
                            <tr>
                              <th className="w-2/3">Particulars</th>
                              <th className="w-1/3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="font-medium">No. of Course Works completed as of date</td>
                              <td>
                                <input type="number" className="srm-input w-32" value={form.sectionBCompletedCount} disabled={!editable} onChange={(e) => update('sectionBCompletedCount', Number(e.target.value))} />
                              </td>
                            </tr>
                            <tr>
                              <td className="font-medium">Comprehensive Viva Completed</td>
                              <td className="space-x-6">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" name="cvCompleted" checked={form.sectionBCVCompleted === true} disabled={!editable} onChange={() => update('sectionBCVCompleted', true)} className="w-4 h-4 rounded-sm border-gray-300 text-srm-blue focus:ring-srm-blue shadow-sm" /> Yes
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" name="cvCompleted" checked={form.sectionBCVCompleted === false} disabled={!editable} onChange={() => update('sectionBCVCompleted', false)} className="w-4 h-4 rounded-sm border-gray-300 text-srm-blue focus:ring-srm-blue shadow-sm" /> No
                                </label>
                              </td>
                            </tr>
                            <tr>
                              <td className="font-medium">If completed, mention the date of completion of the CV</td>
                              <td>
                                <input type="date" className="srm-input w-48" value={form.sectionBCVDate} disabled={!editable} onChange={(e) => update('sectionBCVDate', e.target.value)} />
                              </td>
                            </tr>
                            <tr>
                              <td className="font-medium">Doctoral Committee Meeting Conducted</td>
                              <td className="space-x-6">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" name="dcmConducted" checked={form.sectionBDcmConducted === true} disabled={!editable} onChange={() => update('sectionBDcmConducted', true)} className="w-4 h-4 rounded-sm border-gray-300 text-srm-blue focus:ring-srm-blue shadow-sm" /> Yes
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" name="dcmConducted" checked={form.sectionBDcmConducted === false} disabled={!editable} onChange={() => update('sectionBDcmConducted', false)} className="w-4 h-4 rounded-sm border-gray-300 text-srm-blue focus:ring-srm-blue shadow-sm" /> No
                                </label>
                              </td>
                            </tr>
                            <tr>
                              <td className="font-medium">Pre-PhD Synopsis Meeting Completed</td>
                              <td className="space-x-6">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" name="prePhdCompleted" checked={form.sectionBPrePhdCompleted === true} disabled={!editable} onChange={() => update('sectionBPrePhdCompleted', true)} className="w-4 h-4 rounded-sm border-gray-300 text-srm-blue focus:ring-srm-blue shadow-sm" /> Yes
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" name="prePhdCompleted" checked={form.sectionBPrePhdCompleted === false} disabled={!editable} onChange={() => update('sectionBPrePhdCompleted', false)} className="w-4 h-4 rounded-sm border-gray-300 text-srm-blue focus:ring-srm-blue shadow-sm" /> No
                                </label>
                              </td>
                            </tr>
                            <tr>
                              <td className="font-medium">Synopsis Submitted</td>
                              <td className="space-x-6">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" name="synopsisSubmitted" checked={form.sectionBSynopsisSubmitted === true} disabled={!editable} onChange={() => update('sectionBSynopsisSubmitted', true)} className="w-4 h-4 rounded-sm border-gray-300 text-srm-blue focus:ring-srm-blue shadow-sm" /> Yes
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" name="synopsisSubmitted" checked={form.sectionBSynopsisSubmitted === false} disabled={!editable} onChange={() => update('sectionBSynopsisSubmitted', false)} className="w-4 h-4 rounded-sm border-gray-300 text-srm-blue focus:ring-srm-blue shadow-sm" /> No
                                </label>
                              </td>
                            </tr>
                            <tr>
                              <td className="font-medium">Thesis Submitted</td>
                              <td className="space-x-6">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" name="thesisSubmitted" checked={form.sectionBThesisSubmitted === true} disabled={!editable} onChange={() => update('sectionBThesisSubmitted', true)} className="w-4 h-4 rounded-sm border-gray-300 text-srm-blue focus:ring-srm-blue shadow-sm" /> Yes
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" name="thesisSubmitted" checked={form.sectionBThesisSubmitted === false} disabled={!editable} onChange={() => update('sectionBThesisSubmitted', false)} className="w-4 h-4 rounded-sm border-gray-300 text-srm-blue focus:ring-srm-blue shadow-sm" /> No
                                </label>
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-srm-blue uppercase tracking-wider mb-1">Section D - Research Throughputs</h3>
                  <p className="text-xs text-gray-500">
                    For each particular, add one or more entries. Count = number of upload slots. Click "+ Add Entry" to add another journal type.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {form.sectionDThroughputs.map((row: any, ri: number) => (
                      <div key={ri} className="border border-srm-border rounded-lg overflow-hidden">
                        <div className="bg-gray-50/70 px-4 py-2.5 border-b border-srm-border">
                          <h4 className="text-sm font-bold text-gray-800">{row.particular}</h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {(row.entries || []).map((entry: any, ei: number) => {
                            const attachCount = Math.max(1, Number(entry.count) || 0);
                            return (
                              <div key={ei} className="bg-white border border-gray-100 rounded-lg p-3">
                                <div className="flex items-start gap-4 flex-nowrap">
                                  <div style={{ width: 200, flexShrink: 0 }}>
                                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Journal Type</label>
                                    <select className="srm-input w-full" value={entry.journalType} disabled={!editable}
                                      onChange={(e) => {
                                        const arr = [...row.entries];
                                        arr[ei] = { ...arr[ei], journalType: e.target.value };
                                        update('sectionDThroughputs', form.sectionDThroughputs.map((r: any, idx: number) =>
                                          idx === ri ? { ...r, entries: arr } : r));
                                      }}>
                                      {JOURNALS.map((j) => <option key={j}>{j}</option>)}
                                    </select>
                                  </div>

                                  <div style={{ width: 90, flexShrink: 0 }}>
                                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Count</label>
                                    <input type="number" min={0} className="srm-input w-full" value={entry.count} disabled={!editable}
                                      onChange={(e) => {
                                        const arr = [...row.entries];
                                        arr[ei] = { ...arr[ei], count: Number(e.target.value) };
                                        update('sectionDThroughputs', form.sectionDThroughputs.map((r: any, idx: number) =>
                                          idx === ri ? { ...r, entries: arr } : r));
                                      }} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <label className="block text-[10px] font-medium text-gray-500 mb-1">
                                      Proof ({attachCount} slot{attachCount > 1 ? 's' : ''})
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                      {Array.from({ length: attachCount }).map((_, slot) => {
                                        const slotRowIndex = ri * 1000 + ei * 100 + slot;
                                        return (
                                          <div key={slot} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-2 py-1">
                                            <span className="text-[10px] text-gray-500 font-mono">#{slot + 1}</span>
                                            <ProofCell section="D" rowIndex={slotRowIndex} />
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {editable && row.entries.length > 1 ? (
                                    <button type="button"
                                      onClick={() => {
                                        const arr = row.entries.filter((_: any, k: number) => k !== ei);
                                        update('sectionDThroughputs', form.sectionDThroughputs.map((r: any, idx: number) =>
                                          idx === ri ? { ...r, entries: arr } : r));
                                      }}
                                      className="mt-5 text-xs font-semibold text-red-600 hover:underline whitespace-nowrap"
                                      style={{ flexShrink: 0 }}>
                                      Remove
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                          {editable ? (
                            <button type="button"
                              onClick={() => {
                                update('sectionDThroughputs', form.sectionDThroughputs.map((r: any, idx: number) =>
                                  idx === ri ? { ...r, entries: [...(r.entries || []), { journalType: 'Scopus', count: 0 }] } : r));
                              }}
                              className="text-xs font-semibold text-srm-blue hover:underline">
                              + Add Entry
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 border border-srm-border rounded-lg p-4 lg:sticky lg:top-4">
                      <h4 className="text-[11px] font-bold text-srm-blue uppercase tracking-wider mb-3">
                        Previous Months - Section D
                      </h4>
                      {previousDSubmissions.length === 0 ? (
                        <p className="text-xs text-gray-500">No prior throughputs recorded.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-[11px]">
                            <thead>
                              <tr className="text-gray-500 uppercase tracking-wider">
                                <th className="text-left pb-2 font-semibold">#</th>
                                <th className="text-left pb-2 font-semibold">Month</th>
                                <th className="text-left pb-2 font-semibold">Particular</th>
                                <th className="text-left pb-2 font-semibold">Journal</th>
                                <th className="text-right pb-2 font-semibold">Count</th>
                              </tr>
                            </thead>
                            <tbody>
                              {previousDSubmissions.map((p, idx) => (
                                <tr key={idx} className="border-t border-gray-200">
                                  <td className="py-2 text-gray-400">{idx + 1}</td>
                                  <td className="py-2 text-gray-500 whitespace-nowrap">{p.month}</td>
                                  <td className="py-2 text-gray-700" style={{ maxWidth: 140 }} title={p.articleType}>
                                    <div className="truncate">{p.articleType}</div>
                                  </td>
                                  <td className="py-2 text-gray-700 whitespace-nowrap">{p.stage}</td>
                                  <td className="py-2 text-right text-gray-700">{p.journalName}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
              
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-2'>Timetable (TT Copy) <span className='text-red-600'>*</span></label>
                  <p className='text-[11px] text-gray-500 mb-2'>Upload your teaching timetable for this period (max {MAX_FILE_MB} MB).</p>
                  <ProofCell section='G_TT' rowIndex={0} />
                </div>
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
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-srm-border">
              <button
                type="button"
                onClick={() => {
                  const idx = TABS.findIndex((t) => t.key === activeTab);
                  if (idx > 0) setActiveTab(TABS[idx - 1].key);
                }}
                className="srm-btn srm-btn-primary"
              >
                Previous
              </button>

              <span className="text-xs text-gray-500">
                Section {TABS.findIndex((t) => t.key === activeTab) + 1} of {TABS.length}
              </span>

              <button
                type="button"
                onClick={() => {
                  const idx = TABS.findIndex((t) => t.key === activeTab);
                  if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].key);
                }}
                className="srm-btn srm-btn-primary"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        title="Submit MoM for Approval?"
        message={'You will not be able to edit this MoM while it is under review.'}
        confirmLabel="Submit"
        requireCheckbox
        checkboxLabel="I have verified all information in this form is correct and complete."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
      />
    </div>
  );
}
