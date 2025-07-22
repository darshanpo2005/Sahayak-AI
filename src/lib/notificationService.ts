
'use server';

import type { Notification } from './types';

// Mock notification service. No database connection needed.

// Use a global singleton to persist data across hot reloads in development
const globalForDb = globalThis as unknown as { notifications: Notification[] | undefined };

const notifications = globalForDb.notifications ?? [];

if (process.env.NODE_ENV !== 'production') globalForDb.notifications = notifications;


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const generateId = () => `notif_${Date.now()}${Math.random().toString(36).substring(2, 9)}`;

export async function createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<Notification> {
    await delay(50);
    const newNotification: Notification = {
        ...notification,
        id: generateId(),
        read: false,
        createdAt: new Date().toISOString(),
    };
    notifications.unshift(newNotification); // Add to the beginning of the array
    return newNotification;
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
    await delay(100);
    return notifications.filter(n => n.userId === userId);
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
    await delay(50);
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        return true;
    }
    return false;
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
    await delay(100);
    notifications.forEach(n => {
        if (n.userId === userId) {
            n.read = true;
        }
    });
}
