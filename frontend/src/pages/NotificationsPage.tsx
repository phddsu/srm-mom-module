import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { client } from '../api/client';
import { getMyProfile } from '../api/mom';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [guideId, setGuideId] = useState<number | null>(null);
  
  // Compose State
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [targetRoles, setTargetRole] = useState<'COORDINATOR' | 'GUIDE'>('COORDINATOR');
  const [messageContent, setMessageContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      const res = await client.get(`/api/notifications/user/${user.id}`);
      setNotifications(res?.data || []);
      
      const profileRes = await getMyProfile();
      if (profileRes?.data?.supervisorId) {
        setGuideId(profileRes.data.supervisorId);
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !user?.id) return;
    setSendingMsg(true);
    try {
      if (targetRoles === 'COORDINATOR') {
        await client.post('/api/notifications/reply', {
          scholarId: user.id,
          message: messageContent
        });
      } else {
        if (!guideId) {
           alert("You do not have an assigned Guide yet. Please complete your profile.");
           return;
        }
        await client.post('/api/notifications/send-message', {
          senderId: user.id,
          recipientId: guideId,
          recipientName: "Guide", // Backend fallback
          message: messageContent,
          title: "Message from Scholar:"
        });
      }
      alert('Message sent successfully!');
      setShowComposeModal(false);
      setMessageContent('');
      fetchData(); // Refresh list
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data || err.message;
      alert('Failed to send: ' + errMsg);
    } finally {
      setSendingMsg(false);
    }
  };

    const toggleRole = (role: string) => {
    setTargetRole(prev => 
      prev === 'COORDINATOR' ? 'GUIDE' : 'COORDINATOR'
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header with Compose Button */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">All official communications and alerts</p>
        </div>
        <button 
          onClick={() => setShowComposeModal(true)}
          className="bg-srm-blue hover:bg-srm-blue/90 text-white px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          Compose Message
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No notifications yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div key={n.id} className={`p-6 transition-colors ${n.isRead ? 'bg-white' : 'bg-blue-50/30'}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-blue-100 text-srm-blue p-2 rounded-full shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-gray-900 text-lg break-words">{n.title}</h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed text-sm">{n.message}</p>
                    
                    {/* Quick Reply Buttons attached to specific notification */}
                    <div className="mt-4 flex gap-2">
                       <button onClick={() => { setTargetRole('COORDINATOR'); setShowComposeModal(true); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-srm-blue bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 px-3 py-1.5 rounded-md transition-colors">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                         Reply to Coordinator
                       </button>
                       <button onClick={() => { setTargetRole('GUIDE'); setShowComposeModal(true); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-green-700 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 px-3 py-1.5 rounded-md transition-colors">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                         Message Guide
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPOSE MESSAGE MODAL */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h3 className="font-serif text-xl font-bold text-gray-800 mb-4">New Message</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">To</label>
              
<div className="flex flex-col gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
  {['INSTITUTIONAL_RESEARCH_COORDINATOR', 'HEAD_OF_INSTITUTE', 'SUPERVISOR', 'SCHOLAR'].map(role => (
    <label key={role} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
      <input 
        type="checkbox" 
        className="rounded border-gray-300 text-srm-blue focus:ring-srm-blue"
        checked={targetRoles.includes(role)}
        onChange={() => toggleRole(role)}
      />
      {role.replace(/_/g, ' ')}
    </label>
  ))}
</div>

            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Message</label>
              <textarea 
                className="w-full h-40 resize-none p-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-srm-blue focus:border-transparent"
                placeholder="Type your official message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setShowComposeModal(false)} className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button 
                onClick={handleSendMessage} 
                disabled={sendingMsg || !messageContent.trim()} 
                className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-srm-blue text-white hover:bg-srm-blue/90 disabled:opacity-50 flex items-center gap-2"
              >
                {sendingMsg ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}