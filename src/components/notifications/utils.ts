/**
 * Notification utility functions
 */

import { Notification } from './NotificationCard';

/**
 * Generate a unique notification ID
 */
export const generateNotificationId = (): string => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new notification object
 */
export const createNotification = (
  title: string,
  message: string,
  type: 'info' | 'warning' | 'success' | 'error',
  targetRole: 'all' | 'admin' | 'teacher' | 'student',
  expiresAt?: string
): Notification => {
  return {
    id: generateNotificationId(),
    title,
    message,
    type,
    targetRole,
    createdAt: new Date(),
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    isActive: true
  };
};

/**
 * Get notification type label
 */
export const getNotificationTypeLabel = (type: string): string => {
  switch (type) {
    case 'info': return 'Bilgi';
    case 'warning': return 'Uyarı';
    case 'success': return 'Başarı';
    case 'error': return 'Hata';
    default: return 'Bilgi';
  }
};

/**
 * Check if a notification is expired
 */
export const isNotificationExpired = (notification: Notification): boolean => {
  if (!notification.expiresAt) return false;
  return new Date() > notification.expiresAt;
};

/**
 * Filter notifications by search term
 */
export const filterNotificationsBySearchTerm = (
  notifications: Notification[],
  searchTerm: string
): Notification[] => {
  if (!searchTerm) return notifications;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return notifications.filter(notification => 
    notification.title.toLowerCase().includes(lowerSearchTerm) ||
    notification.message.toLowerCase().includes(lowerSearchTerm)
  );
};

/**
 * Sort notifications by date
 */
export const sortNotificationsByDate = (
  notifications: Notification[],
  ascending: boolean = false
): Notification[] => {
  return [...notifications].sort((a, b) => {
    const dateA = a.createdAt.getTime();
    const dateB = b.createdAt.getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};