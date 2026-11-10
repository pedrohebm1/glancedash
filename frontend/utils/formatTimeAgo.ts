export default function formatTimeAgo(sqliteDateStr: string | null | undefined): string {
  if (!sqliteDateStr) return '';

  const formattedStr = sqliteDateStr.includes('T')
    ? sqliteDateStr
    : sqliteDateStr.replace(' ', 'T');

  const pastDate = new Date(formattedStr);
  const now = new Date();

  if (isNaN(pastDate.getTime())) return '';

  const seconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  if (seconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} ${months === 1 ? 'mo' : 'mos'} ago`;
  }

  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'yr' : 'yrs'} ago`;
}