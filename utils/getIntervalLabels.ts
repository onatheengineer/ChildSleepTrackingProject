import { type GetIntervalLabels, type IntervalLabels, ODataInterval } from 'schema'
import { graphDataPointLabel } from './graphDataPointLabel.ts'

function getIntervalLabels ({
  interval,
  refDate
}: GetIntervalLabels): IntervalLabels[] {
  const intervalLabelsArr: IntervalLabels[] = []

  // Prepopulate the date point labels into the datapoint, all labels for the interval should be in the data points dictionary, values will be aggregated from there
  if (interval === ODataInterval.DAILY) {
    // getDay() function is: Sunday - Saturday : 0 - 6
    const dte: Date = new Date(refDate.getTime())
    dte.setHours(0, 0, 0, 0)
    for (let i = 0; i <= 6; i++) {
      const [label, labelDate] = graphDataPointLabel({ date: dte, interval })
      intervalLabelsArr.push({ label, labelDate })
      dte.setDate(dte.getDate() - 1)
    }
  }
  // Week is a Sun to Sat added up for the datePoint
  if (interval === ODataInterval.WEEKLY) {
    for (let i = 0; i < 5; i++) {
      const dte = new Date(refDate.getTime())
      dte.setDate(dte.getDate() - i * 7)
      dte.setHours(0, 0, 0, 0)
      const [label, labelDate] = graphDataPointLabel({ date: dte, interval })
      intervalLabelsArr.push({ label, labelDate })
    }
  }
  if (interval === ODataInterval.MONTHLY) {
    for (let i = 0; i < 5; i++) {
      const dte = new Date(refDate.getTime())
      dte.setMonth(dte.getMonth() - i)
      dte.setHours(0, 0, 0, 0)
      const [label, labelDate] = graphDataPointLabel({ date: dte, interval })
      intervalLabelsArr.push({ label, labelDate })
    }
  }
  return intervalLabelsArr
}

export { getIntervalLabels }
