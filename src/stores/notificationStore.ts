// ============================================================
// Notification Store (Zustand)
// Admin notification state management
// ============================================================
import { create } from 'zustand';
import { notificationBusiness, type AdminNotification } from '@/business/notificationBusiness';

interface NotificationState {
    notifications: AdminNotification[];
    loading: boolean;
    lastFetched: number | null;
    unreadCount: number;

    // Actions
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    dismissAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
    notifications: [],
    loading: false,
    lastFetched: null,
    unreadCount: 0,

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const notifications = await notificationBusiness.getAdminNotifications();
            // Preserve read state from existing notifications
            const existingReadIds = new Set(
                get().notifications.filter((n) => n.is_read).map((n) => n.id)
            );
            const merged = notifications.map((n) => ({
                ...n,
                is_read: existingReadIds.has(n.id) ? true : n.is_read,
            }));
            const unread = merged.filter(n => !n.is_read).length;
            set({ notifications: merged, unreadCount: unread, lastFetched: Date.now() });
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            set({ loading: false });
        }
    },

    markAsRead: (id) => {
        set((state) => {
            const updated = state.notifications.map((n) =>
                n.id === id ? { ...n, is_read: true } : n
            );
            return {
                notifications: updated,
                unreadCount: updated.filter(n => !n.is_read).length
            };
        });
    },

    markAllAsRead: () => {
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
            unreadCount: 0
        }));
    },

    dismissAll: () => {
        set({ notifications: [], unreadCount: 0 });
    },
}));
