const API_URL = 'https://6a41389f1ff1d27becc15c4a.mockapi.io/notification';

async function request(endpoint = '', options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Notification API request failed with status ${response.status}`);
  }

  return response.json();
}

function parseNotificationTime(value) {
  if (!value) return 0;

  if (typeof value === 'number') {
    return value < 100000000000 ? value * 1000 : value;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getNotificationTimeValue(notification) {
  return parseNotificationTime(notification?.time || notification?.createdAt || notification?.date || notification?.uploadedAt);
}

export function formatNotificationTime(value) {
  const timestamp = parseNotificationTime(value);
  if (!timestamp) return 'Just now';

  const diffInSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffInSeconds < 1) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays <= 2) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;

  return new Date(timestamp).toLocaleDateString('en-US');
}

export function getNotificationDisplayTime(notification) {
  return formatNotificationTime(notification?.time || notification?.createdAt || notification?.date || notification?.uploadedAt);
}

export function sortNotificationsByNewest(notifications = []) {
  return [...notifications].sort((first, second) => {
    return getNotificationTimeValue(second) - getNotificationTimeValue(first);
  });
}

export async function getNotifications() {
  const notifications = await request();
  return Array.isArray(notifications) ? sortNotificationsByNewest(notifications) : [];
}

export async function getNotificationCount() {
  const notifications = await getNotifications();
  return Array.isArray(notifications) ? notifications.length : 0;
}

export function addNotification(notification) {
  return request('', {
    method: 'POST',
    body: JSON.stringify(notification),
  });
}

export function updateNotification(id, notification) {
  return request(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(notification),
  });
}

export function deleteNotification(id) {
  return request(`/${id}`, {
    method: 'DELETE',
  });
}
