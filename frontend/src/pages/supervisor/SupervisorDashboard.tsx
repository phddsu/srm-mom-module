import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { client } from '../../api/client';
import { getGuidePending, getMomById } from '../../api/mom';
import type { MinutesOfMeeting } from '../../types/mom';
import MomReviewPanel from '../../components/MomReviewPanel';
import ViewButton from '../../components/ViewButton';

const statusClass = (s: string) => {
  if (s === 'APPROVED') return 'srm-badge-completed';
  if (s === 'DRAFT') return 'srm-badge-draft';
  if (s.includes('RETURNED')) return 'srm-badge-danger';
  return 'srm-badge-active';
};

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [pending, setPending] = useState<MinutesOfMeeting[]>([]);
  const [selected, setSelected] = useState<MinutesOfMeeting | null>(null);
  const [loading, setLoading] = useState(false);

  // MESSAGING STATE
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTarget, setMessageTarget] = useState<{ id: number; name: string } | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getGuidePending();
      setPending(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openMom = async (id: number) => {
    try {
      const res = await getMomById(id);
      setSelected(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !messageTarget || !user?.id) return;
    setSendingMessage(true);
    try {
      await client.post('/api/notifications/send-message', {
        senderId: user.id,
        recipientId: messageTarget.id,
        recipientName: messageTarget.name, // Ensures name is sent
        message: messageContent,
        title: "Message from Guide:"
      });
      alert('Message sent successfully!');
      setShowMessageModal(false);
      setMessageContent('');
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Unknown error';
      alert('Error: ' + errorMsg);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center gap-5 shadow-sm">
        <div className="flex-1 border-l-4 border-srm-blue pl-5">
          <h1 className="font-serif text-xl font-bold text-srm-blue leading-tight">Supervisor Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Review and approve your scholars' progress</p>
        </div>
      </div>

      {!selected ? (
        <>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Pending My Approval ({pending.length})</h2>
          </div>

          <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
            <table className="srm-table">
              <thead>
                <tr>
                  <th>MoM Number</th>
                  <th>Scholar</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-500">Loading...</td></tr>
                ) : pending.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-500">No pending MoMs to review.</td></tr>
                ) : (
                  pending.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="font-mono text-xs font-semibold">{m.momNumber}</td>
                      <td>
                        <p className="font-semibold text-gray-800">{m.sectionAScholarName || ('Scholar #' + m.scholarId)}</p>
                        <p className="text-xs text-gray-500">ID: {m.scholarId}</p>
                      </td>
                      <td className="text-xs">{m.periodMonth}/{m.periodYear}</td>
                      <td><span className={`srm-badge ${statusClass(m.currentStatus)}`}>{m.currentStatus.replace(/_/g, ' ')}</span></td>
                      <td className="text-right whitespace-nowrap">
                        <ViewButton onClick={() => openMom(m.id)} label="Review" />
                        
                        <button 
                          onClick={() => {
                            setMessageTarget({ id: m.scholarId, name: m.sectionAScholarName || 'Scholar' });
                            setShowMessageModal(true);
                          }} 
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-wide ml-4 px-3 py-1.5 rounded bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                          Message
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm w-full">
          <div className="flex justify-between items-center mb-5 pb-4 border-b">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-800">Review: {selected.momNumber}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Scholar: {selected.sectionAScholarName || ('#' + selected.scholarId)}
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-xl font-bold px-2 hover:bg-gray-100 rounded">×</button>
          </div>
          <div className="w-full">
            <MomReviewPanel mom={selected} />
          </div>
        </div>
      )}

      {/* MESSAGE MODAL */}
      {showMessageModal && messageTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h3 className="font-serif text-xl font-bold text-gray-800 mb-1">Send Official Message</h3>
            <p className="text-sm text-gray-500 mb-4">
              To: <span className="font-semibold text-gray-800">{messageTarget.name}</span>. This will appear in the scholar's portal.
            </p>
            
            <textarea 
              className="w-full h-32 resize-none p-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-srm-blue focus:border-transparent"
              placeholder="Type your message or feedback here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowMessageModal(false)} className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button 
                onClick={handleSendMessage} 
                disabled={sendingMessage || !messageContent.trim()} 
                className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-srm-blue text-white hover:bg-srm-blue/90 disabled:opacity-50"
              >
                {sendingMessage ? 'Sending...' : 'Send Notice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}