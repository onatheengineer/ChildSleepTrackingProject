import { DAY_OF_WEEK, MONTHS, ODataInterval } from 'schema'
import { getSunday } from './getSunday.ts'

interface GraphDataPointLabel {
  date: Date
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY'
}

const graphDataPointLabel = ({
  date,
  interval
}: GraphDataPointLabel): [string, Date] => {
  const dte: Date = new Date(date.getTime())
  // Daily
  if (interval === ODataInterval.DAILY) {
    // getDay() is: Sunday - Saturday : 0 - 6
    const dow: number = dte.getDay()
    if (dow > 6) {
      throw new Error('Day of week cannot be greater than 7.')
    }
    const dailyLabel: string = DAY_OF_WEEK[dow] ?? ''
    return [dailyLabel, dte]
  }

  // Weekly
  if (interval === ODataInterval.WEEKLY) {
    const getSun = getSunday(dte)
    return [
            `${MONTHS[getSun.getMonth()]} ${getSun.getDate()}`,
            new Date(getSun.getTime())
    ]
  }

  // Monthly
  return [
        `${MONTHS[dte.getMonth()]}`,
        new Date(dte.getFullYear(), dte.getMonth(), 1)
  ]
}

export { graphDataPointLabel }
