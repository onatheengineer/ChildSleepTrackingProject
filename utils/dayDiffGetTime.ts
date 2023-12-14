interface DayDiffProps {
  date1: Date;
  date2: Date;
}

// both dates should be converted to UTC time stamp
const dayDiffGetTime = ({ date1, date2 }: DayDiffProps): number => {
  // To calculate the time difference of two dates
  const Difference_In_Time = date2.getTime() - date1.getTime();

  // To calculate the no. of days between two dates
  return Difference_In_Time / (1000 * 3600 * 24);
};

export { dayDiffGetTime };
