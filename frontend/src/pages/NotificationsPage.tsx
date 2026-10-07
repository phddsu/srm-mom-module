import { useEffect, useState } from 'react';
import {
  getNotifications, markAsRead, markAllAsRead,
  type NotificationDto,
} from '../api/notifications';

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMark = async (id: number) => {
    await markAsRead(id);
    load();
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    load();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {items.some((i) => !i.isRead) && (
          <button
            onClick={handleMarkAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}
      {!loading && items.length === 0 && (
        <div className="bg-white rounded border border-gray-200 p-12 text-center text-gray-500">
          No notifications yet.
        </div>
      )}

      <ul className="space-y-2">
        {items.map((n) => (
          <li
            key={n.id}
            className={`p-4 rounded border ${
              n.isRead
                ? 'bg-white border-gray-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(n.createdAt).toLocaleString()} • {n.eventType}
                </p>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => handleMark(n.id)}
                  className="ml-4 text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                >
                  Mark read
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}