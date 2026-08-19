/**
 * Format ISO datetime string to friendly readable format
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Short relative time formatter
 */
export function timeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return 'Just now';
}

/**
 * Truncate long string
 */
export function truncate(text, max = 100) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

/**
 * Extract a user-friendly message from Urban Lens API error responses.
 */
export function parseApiError(error, fallback = 'Something went wrong. Please try again.') {
  if (!error?.response) {
    return 'Cannot reach the API server. Start the backend with: python manage.py runserver 8000';
  }

  const data = error.response.data;

  if (data?.error?.message) {
    return data.error.message;
  }

  if (data?.error?.details) {
    const details = data.error.details;
    if (typeof details === 'string') return details;
    if (Array.isArray(details)) return details.join(' ');
    if (typeof details === 'object') {
      return Object.entries(details)
        .map(([field, msgs]) => {
          const label = field.replace(/_/g, ' ');
          const text = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
          return `${label}: ${text}`;
        })
        .join(' ');
    }
  }

  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (Array.isArray(data?.non_field_errors)) return data.non_field_errors[0];

  return fallback;
}
