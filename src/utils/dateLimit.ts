export const formatTimeLimit = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} minutes`;
  } else if (minutes === 60) {
    return '1 hour';
  } else if (minutes % 60 === 0) {
    return `${minutes / 60} hours`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
  }
};
