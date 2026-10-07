import { useEffect, useState } from 'react';
import type { MinutesOfMeeting } from '../types/mom';
import {
  listSectionAttachments, attachmentDownloadUrl, type SectionAttachment,
} from '../api/mom';

const Row = ({ label, value }: { label: string; value?: any }) => (
  <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-gray-100 text-sm">
    <span className="font-medium text-gray-600">{label}</span>
    <span className="col-span-2 text-gray-900">
      {value === null || value === undefined || value === '' ? '-' : String(value)}
    </span>
  </div>
);

const parseJSON = (s?: string) => {
  try { return s ? JSON.parse(s) : []; } catch { return []; }
};

export default function MomReviewPanel({ mom }: { mom: MinutesOfMeeting; showSignatures?: boolean }) {
  const [attachments, setAttachments] = useState<SectionAttachment[]>([]);

  useEffect(() => {
    if (!mom || !mom.id) return;
    listSectionAttachments(mom.id)
      .then((r) => setAttachments(r.data))
      .catch(() => setAttachments([]));
  }, [mom && mom.id]);

  if (!mom) return null;

  const milestones = parseJSON(mom.sectionCMilestones);
  const throughputs = parseJSON(mom.sectionDThroughputs);
  const skills = parseJSON(mom.sectionESkills);
  const challenges = parseJSON(mom.sectionFChallenges);
  const participation = parseJSON(mom.sectionFParticipation);
  const planned = parseJSON(mom.sectionFPlannedActivities);
  const leaves = parseJSON(mom.sectionGLeaves);

  const proofsFor = (section: string, rowIndex?: number) =>
    attachments.filter((a) => a.section === section && (rowIndex === undefined || a.rowIndex === rowIndex));

  const ProofInline = ({ section, rowIndex }: { section: string; rowIndex?: number }) => {
    const files = proofsFor(section, rowIndex);
    if (files.length === 0) return <span className="text-xs text-gray-400">-</span>;
    return (
      <div className="flex flex-col gap-1">
        {files.map((a) => (
          <a key={a.id} href={attachmentDownloadUrl(a.id)} target="_blank" rel="noreferrer"
            className="text-xs text-blue-700 hover:underline truncate max-w-[200px]">
            {a.fileName}
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-blue-900">{mom.momNumber}</h2>
            <p className="text-sm text-gray-600">
              Status: <strong>{String(mom.currentStatus).replace(/_/g, ' ')}</strong> | Stage: <strong>{String(mom.currentStage).replace(/_/g, ' ')}</strong>
            </p>
          </div>
          {mom.submissionDate ? (
            <p className="text-xs text-gray-500">Submitted: {new Date(mom.submissionDate).toLocaleString()}</p>
          ) : null}
        </div>
      </div>

      {/* A */}
      <section className="bg-white border rounded p-4">
        <h3 className="font-semibold text-blue-900 border-b pb-1 mb-3">A. Scholar Details</h3>
        <Row label="Scholar Name" value={mom.sectionAScholarName} />
        <Row label="Date of Registration" value={mom.sectionARegistrationDate} />
        <Row label="Session / Year" value={mom.sectionASessionYear} />
        <Row label="Supervisor" value={mom.sectionASupervisorName} />
        <Row label="Co-Supervisor" value={mom.sectionACosupervisorName} />
        <Row label="Department" value={mom.sectionADepartment} />
        <Row label="Scopus ID" value={mom.sectionAScopusId} />
        <Row label="ORCID ID" value={mom.sectionAOrcidId} />
        <Row label="Linked Scopus-ORCID" value={mom.sectionALinked ? 'Yes' : 'No'} />
        <Row label="PhD Work Title" value={mom.sectionAPhdTitle} />
        <Row label="Receiving Funding" value={mom.sectionAFunding} />
        {mom.sectionAFunding === 'YES' ? (
          <>
            <Row label="JRF / SRF" value={mom.sectionAJrfSrf} />
            <Row label="Project Title" value={mom.sectionAProjectTitle} />
            <Row label="Funding Agency" value={mom.sectionAFundingAgency} />
            <Row label="Principal Investigator" value={mom.sectionAPiName} />
          </>
        ) : null}
      </section>

      {/* B */}
      <section className="bg-white border rounded p-4">
        <h3 className="font-semibold text-blue-900 border-b pb-1 mb-3">B. Status of Research Work</h3>
        <Row label="Course Work Completed" value={mom.sectionBCourseworkCompleted ? 'Yes' : 'No'} />
        <Row label="No. of Course Works recommended by DAC" value={mom.sectionBCourseworksRecommended} />
      </section>

      {/* C */}
      <section className="bg-white border rounded p-4">
        <h3 className="font-semibold text-blue-900 border-b pb-1 mb-3">C. Research Milestones</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-2 py-1">Milestone</th>
              <th className="text-left px-2 py-1">Status</th>
              <th className="text-left px-2 py-1">Expected Date</th>
              <th className="text-left px-2 py-1">Proof</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((r: any, i: number) => (
              <tr key={i} className="border-t">
                <td className="px-2 py-1">{r.name}</td>
                <td className="px-2 py-1">{r.status}</td>
                <td className="px-2 py-1">{r.expectedCompletionDate || '-'}</td>
                <td className="px-2 py-1"><ProofInline section="C" rowIndex={i} /></td>
              </tr>
            ))}
            {milestones.length === 0 ? <tr><td colSpan={4} className="px-2 py-2 text-gray-500 text-xs">No data</td></tr> : null}
          </tbody>
        </table>
      </section>

      {/* D */}
      <section className="bg-white border rounded p-4">
        <h3 className="font-semibold text-blue-900 border-b pb-1 mb-3">D. Research Throughputs</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-2 py-1">Particulars</th>
              <th className="text-left px-2 py-1">Journal Type</th>
              <th className="text-left px-2 py-1">Count</th>
              <th className="text-left px-2 py-1">Proof</th>
            </tr>
          </thead>
          <tbody>
            {throughputs.map((r: any, i: number) => (
              <tr key={i} className="border-t">
                <td className="px-2 py-1">{r.particular}</td>
                <td className="px-2 py-1">{r.journalType}</td>
                <td className="px-2 py-1">{r.count}</td>
                <td className="px-2 py-1"><ProofInline section="D" rowIndex={i} /></td>
              </tr>
            ))}
            {throughputs.length === 0 ? <tr><td colSpan={4} className="px-2 py-2 text-gray-500 text-xs">No data</td></tr> : null}
          </tbody>
        </table>
      </section>

      {/* E */}
      <section className="bg-white border rounded p-4">
        <h3 className="font-semibold text-blue-900 border-b pb-1 mb-3">E. Skills Acquired</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="text-left px-2 py-1 w-1/3">Particulars</th><th className="text-left px-2 py-1">Details</th><th className="text-left px-2 py-1">Proof</th></tr>
          </thead>
          <tbody>
            {skills.map((r: any, i: number) => (
              <tr key={i} className="border-t">
                <td className="px-2 py-1">{r.skill}</td>
                <td className="px-2 py-1">{r.details || '-'}</td>
                <td className="px-2 py-1"><ProofInline section="E" rowIndex={i} /></td>
              </tr>
            ))}
            {skills.length === 0 ? <tr><td colSpan={3} className="px-2 py-2 text-gray-500 text-xs">No data</td></tr> : null}
          </tbody>
        </table>
      </section>

      {/* F.1 Challenges */}
      <section className="bg-white border rounded p-4">
        <h3 className="font-semibold text-blue-900 border-b pb-1 mb-3">F.1 Challenges Faced</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="text-left px-2 py-1 w-1/3">Area</th><th className="text-left px-2 py-1">Description</th></tr>
          </thead>
          <tbody>
            {challenges.map((r: any, i: number) => (
              <tr key={i} className="border-t">
                <td className="px-2 py-1">{r.area}</td>
                <td className="px-2 py-1">{r.description || '-'}</td>
              </tr>
            ))}
            {challenges.length === 0 ? <tr><td colSpan={2} className="px-2 py-2 text-gray-500 text-xs">No data</td></tr> : null}
          </tbody>
        </table>
      </section>

      {/* F.2 Participation */}
      <section className="bg-white border rounded p-4">
        <h3 className="font-semibold text-blue-900 border-b pb-1 mb-3">F.2 Participation in Scholarly Activities</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="text-left px-2 py-1 w-1/3">Activity</th><th className="text-left px-2 py-1">Details</th><th className="text-left px-2 py-1">Proof</th></tr>
          </thead>
          <tbody>
            {participation.map((r: any, i: number) => (
              <tr key={i} className="border-t">
                <td className="px-2 py-1">{r.activity}</td>
                <td className="px-2 py-1">{r.details || '-'}</td>
                <td className="px-2 py-1"><ProofInline section="F_PART" rowIndex={i} /></td>
              </tr>
            ))}
            {participation.length === 0 ? <tr><td colSpan={3} className="px-2 py-2 text-gray-500 text-xs">No data</td></tr> : null}
          </tbody>
        </table>
      </section>

      {/* F.3 Planned */}
      <section className="bg-white border rounded p-4">
        <h3 className="font-semibold text-blue-900 border-b pb-1 mb-3">F.3 Activities Planned</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="text-left px-2 py-1">Activity</th><th className="text-left px-2 py-1">Target Date</th></tr>
          </thead>
          <tbody>
            {planned.map((r: any, i: number) => (
              <tr key={i} className="border-t">
                <td className="px-2 py-1">{r.activityName}</td>
                <td className="px-2 py-1">{r.targetDate || '-'}</td>
              </tr>
            ))}
            {planned.length === 0 ? <tr><td colSpan={2} className="px-2 py-2 text-gray-500 text-xs">No data</td></tr> : null}
          </tbody>
        </table>
      </section>

      {/* G */}
      <section className="bg-white border rounded p-4">
        <h3 className="font-semibold text-blue-900 border-b pb-1 mb-3">G. Teaching Assistantship</h3>
        <Row label="Lab Hours / week" value={mom.sectionGLabHours} />
        <Row label="Tutorial Hours / week" value={mom.sectionGTutorialHours} />
        <Row label="Enough Support" value={mom.sectionGSupport} />
        <Row label="Remarks" value={mom.sectionGRemarks} />
      </section>

      {/* Leave */}
      {leaves.length > 0 ? (
        <section className="bg-white border rounded p-4">
          <h3 className="font-semibold text-blue-900 border-b pb-1 mb-3">Leave Requests</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-2 py-1">From</th>
                <th className="text-left px-2 py-1">To</th>
                <th className="text-left px-2 py-1">Type</th>
                <th className="text-left px-2 py-1">Reason</th>
                <th className="text-left px-2 py-1">Proof</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((r: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">{r.fromDate || '-'}</td>
                  <td className="px-2 py-1">{r.toDate || '-'}</td>
                  <td className="px-2 py-1">{r.type}</td>
                  <td className="px-2 py-1">{r.reason || '-'}</td>
                  <td className="px-2 py-1"><ProofInline section="LEAVE" rowIndex={i} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {/* H */}
      {mom.sectionHRecommendation ? (
        <section className="bg-green-50 border border-green-200 rounded p-4">
          <h3 className="font-semibold text-green-900 border-b pb-1 mb-3">H. Supervisor Assessment</h3>
          <Row label="Month" value={mom.sectionHMonth} />
          <Row label="Recommendation" value={mom.sectionHRecommendation} />
        </section>
      ) : null}

      {/* I */}
      {(mom.sectionIHoiRemarks || mom.sectionIDeanRemarks) ? (
        <section className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h3 className="font-semibold text-yellow-900 border-b pb-1 mb-3">I. Endorsements and Final Approval</h3>
          <Row label="Certified Leave" value={mom.sectionICertifiedLeave} />
          <Row label="Certified Fellowship" value={mom.sectionICertifiedFellowship} />
          <Row label="HOI Remarks" value={mom.sectionIHOIhRemarks || mom.sectionIHoiRemarks} />
          <Row label="Dean Remarks" value={mom.sectionIDeanRemarks} />
        </section>
      ) : null}
    </div>
  );
}