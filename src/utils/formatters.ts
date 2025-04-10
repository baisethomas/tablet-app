/**
 * Formats milliseconds into MM:SS string format.
 * @param millis Milliseconds to format.
 * @returns Formatted string (e.g., "05:32") or "00:00" if input is invalid.
 */
export function formatMillisToMMSS(millis: number | undefined | null): string {
    if (millis === undefined || millis === null || millis < 0) return '00:00';
    const totalSeconds = Math.floor(millis / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Add other formatting functions here as needed 