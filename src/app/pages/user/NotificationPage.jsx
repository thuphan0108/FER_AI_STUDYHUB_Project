import { useEffect, useMemo, useState } from 'react';
import { Bell, MoreHorizontal, RefreshCw } from 'lucide-react';
import { Button } from 'react-bootstrap';
import { toast } from 'sonner';
import { getNotificationDisplayTime, getNotifications } from '../../data/Notification';

function getInitials(name = '') {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials.slice(0, 2) || 'SD';
}

function getNotificationDateGroup(notification) {
  const value = notification.time || notification.createdAt || notification.date || notification.uploadedAt;
  const timestamp = typeof value === 'number'
    ? (value < 100000000000 ? value * 1000 : value)
    : new Date(value).getTime();

  if (!timestamp || Number.isNaN(timestamp)) return 'New';

  const diffInHours = Math.floor(Math.max(0, Date.now() - timestamp) / (1000 * 60 * 60));
  if (diffInHours < 24) return 'New';
  return 'Earlier';
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const groupedNotifications = useMemo(() => {
    return notifications.reduce((groups, notification) => {
      const group = getNotificationDateGroup(notification);
      return {
        ...groups,
        [group]: [...(groups[group] || []), notification],
      };
    }, {});
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      toast.error(error.message || 'Could not load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="container-fluid px-4 py-4 py-md-5">
      <div className="mx-auto" style={{ maxWidth: '860px' }}>
        <div
          className="bg-white shadow-sm"
          style={{
            border: '1px solid #FFE2CF',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >
          <div className="d-flex align-items-center justify-content-between gap-3 p-4 pb-3">
            <div>
              <h1 className="fw-bold mb-1" style={{ color: '#001A41', fontSize: '2rem' }}>
                Notifications
              </h1>
              <p className="mb-0" style={{ color: '#667085' }}>
                New document uploads you may want to check out
              </p>
            </div>
            <Button
              variant="light"
              className="d-inline-flex align-items-center justify-content-center border-0 rounded-circle"
              style={{ width: '40px', height: '40px', backgroundColor: '#FFF7F0', color: '#FD8F52' }}
              onClick={loadNotifications}
              disabled={isLoading}
              aria-label="Refresh notifications"
            >
              <RefreshCw size={18} />
            </Button>
          </div>

          <div className="d-flex align-items-center gap-2 px-4 pb-3">
            <button
              type="button"
              className="btn btn-sm fw-semibold border-0"
              style={{ borderRadius: '999px', backgroundColor: '#FFF0E6', color: '#C73866' }}
            >
              All
            </button>
            <button
              type="button"
              className="btn btn-sm fw-semibold border-0"
              style={{ borderRadius: '999px', backgroundColor: '#F2F4F7', color: '#667085' }}
            >
              Unread
            </button>
          </div>

          <div style={{ borderTop: '1px solid #FFE2CF' }}>
            {isLoading ? (
              <div className="text-center py-5">
                <Bell size={36} className="mb-3" style={{ color: '#FD8F52' }} />
                <p className="text-muted mb-0">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-5">
                <Bell size={36} className="mb-3" style={{ color: '#FD8F52' }} />
                <p className="fw-semibold mb-1" style={{ color: '#001A41' }}>No notifications yet</p>
                <p className="text-muted mb-0">New uploads will appear here.</p>
              </div>
            ) : (
              ['New', 'Today', 'Earlier'].map((group) => (
                groupedNotifications[group]?.length ? (
                  <div key={group} className="px-3 px-md-4 py-3">
                    <h5 className="fw-bold mb-2" style={{ color: '#001A41' }}>
                      {group}
                    </h5>
                    <div className="d-flex flex-column gap-1">
                      {groupedNotifications[group].map((notification) => (
                        <div
                          key={notification.id}
                          className="d-flex align-items-center gap-3 p-2 p-md-3"
                          style={{
                            borderRadius: '12px',
                            backgroundColor: '#FFF7F0',
                          }}
                        >
                          <div className="position-relative flex-shrink-0">
                            <div
                              className="d-flex align-items-center justify-content-center fw-bold text-white"
                              style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #C73866, #FD8F52)',
                              }}
                            >
                              {getInitials(notification.user)}
                            </div>
                            <div
                              className="position-absolute d-flex align-items-center justify-content-center"
                              style={{
                                right: '-3px',
                                bottom: '-3px',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: '#FFFFFF',
                                color: '#FD8F52',
                                border: '1px solid #FFE2CF',
                              }}
                            >
                              <Bell size={14} />
                            </div>
                          </div>

                          <div className="flex-grow-1 overflow-hidden">
                            <p className="mb-1" style={{ color: '#344054', lineHeight: 1.45 }}>
                              <strong style={{ color: '#001A41' }}>{notification.user}</strong> has just uploaded{' '}
                              <strong style={{ color: '#001A41' }}>{notification.document}</strong>
                            </p>
                            <p className="mb-0 fw-semibold" style={{ fontSize: '13px', color: '#FD8F52' }}>
                              {getNotificationDisplayTime(notification)}
                            </p>
                          </div>

                          <div className="d-flex align-items-center gap-2 flex-shrink-0">
                            <span
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: '#FD8F52',
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm border-0 rounded-circle d-inline-flex align-items-center justify-content-center"
                              style={{ width: '34px', height: '34px', color: '#667085', backgroundColor: 'transparent' }}
                              aria-label="More notification actions"
                            >
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
