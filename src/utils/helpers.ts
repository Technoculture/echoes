export const calculateTime = (secs: number) => {
  const minutes = Math.floor(secs / 60);
  const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const seconds = Math.floor(secs % 60);
  const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
  return `${returnedMinutes}:${returnedSeconds}`;
};

export function timestampToDate(timestamp: number): string {
  const timestampLength = timestamp.toString().length;
  const date =
    timestampLength === 13 ? new Date(timestamp) : new Date(timestamp * 1000);
  return date.toLocaleString(); // Adjust format using toLocaleDateString(), toLocaleTimeString(), etc.
}
