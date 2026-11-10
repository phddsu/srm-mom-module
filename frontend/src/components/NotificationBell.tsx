import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { client } from '../api/client';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user || !user.id) return;
    if (!user || !user.id) return;
    if (!user || !user.id) return;
    try {
      // Fetch the actual list of notifications using the new backend endpoint
      const res = await client.get(`/api/notifications/user/${user.id}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Calculate how many are unread
  const count = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:text-blue-600 focus:outline-none"
        title="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="font-semibold text-sm text-gray-800">Notifications</span>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{count} unread</span>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-sm text-gray-500 text-center">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 border-b border-gray-50 text-sm hover:bg-gray-50 transition-colors ${n.isRead ? 'bg-white' : 'bg-blue-50/30'}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-1 text-blue-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{n.title}</p>
                      <p className="text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div 
            onClick={() => { setOpen(false); navigate('/notifications'); }}
            className="p-3 text-center text-xs font-semibold text-srm-blue hover:bg-gray-50 cursor-pointer border-t border-gray-100"
          >
            View All Notifications
          </div>
        </div>
      )}
    </div>
  );
}