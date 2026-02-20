export const formatDate = (
  dateString: string | Date | undefined, 
  withTime: boolean = false
): string => {
  if (!dateString) return "-";
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const dateFormatted = `${day}-${month}-${year}`;

  if (withTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dateFormatted} ${hours}:${minutes}`;
  }

  return dateFormatted;
};