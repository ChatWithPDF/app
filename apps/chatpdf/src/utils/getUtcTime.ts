export const getFormatedTime = (timeinstance: any) => {
  timeinstance = new Date(timeinstance);
  const hours = timeinstance.getHours();
  const minutes = timeinstance.getMinutes();
  const amPM = hours >= 12 ? 'pm' : 'am';
  const formattedHours = hours > 12 ? hours - 12 : hours;

  return `${timeinstance.getDate()}/${timeinstance.getMonth() + 1}/${timeinstance.getFullYear()} ${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${amPM}`;
};

export const getFormattedDate = (timeInstance: any) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  timeInstance = new Date(timeInstance);
  const day = timeInstance.getDate();
  const month = months[timeInstance.getMonth()];
  const year = timeInstance.getFullYear();

  return `${day} ${month} ${year}`;
};
