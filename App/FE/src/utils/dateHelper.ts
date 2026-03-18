export const formatDate = (
  dateString: string | Date | undefined, 
  withTime: boolean = false
): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  };

  const dateFormatted = date.toLocaleDateString('id-ID', options);

  if (withTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dateFormatted} • ${hours}:${minutes}`;
  }

  return dateFormatted;
};