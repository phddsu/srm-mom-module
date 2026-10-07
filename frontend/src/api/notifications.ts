import { client } from './client';

export interface NotificationDto {
  id: number;
  recipientUserId: number;
  recipientRole: string;
  momId?: number;
  title: string;
  message: string;
  eventType: string;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = () =>
  client.get<NotificationDto[]>('/api/notifications');

export const getUnreadCount = () =>
  client.get<{ count: number }>('/api/notifications/unread-count');

export const markAsRead = (id: number) =>
  client.post(`/api/notifications/${id}/read`);

export const markAllAsRead = () =>
  client.post('/api/notifications/read-all');