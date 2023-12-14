// npx env-cmd ts-node intervalPlayground.ts
import { type IntervalLabels } from 'schema'
import { getIntervalLabels } from 'utils'

const deviceId = '1443211B0B50'
const refDate = new Date()
const interval: 'DAILY' | 'MONTHLY' | 'WEEKLY' = 'MONTHLY'

function calcLastDate (dte: Date): Date {
  const dt = new Date(dte.getTime())
  if (interval === 'DAILY') {
    dt.setDate(dt.getDate() + 1)
  }
  if (interval === 'WEEKLY') {
    dt.setDate(dt.getDate() + 7)
  }
  if (interval === 'MONTHLY') {
    dt.setMonth(dt.getMonth() + 1)
  }
  return dt
}

const getIntervals: IntervalLabels[] = getIntervalLabels({
  interval,
  refDate
})
getIntervals.sort((a, b) => {
  return (a.labelDate.getTime() - b.labelDate.getTime())
})
const query: string[] = []
getIntervals.forEach((item, idx) => {
  const endDate = idx + 1 === getIntervals.length
    ? calcLastDate(item.labelDate)
    : getIntervals[idx + 1].labelDate
  query.push(`SELECT '${item.label}'                      as label,
                       AVG(PROJECT.deviceAnalytics.bpm) as mean
                FROM PROJECT.deviceAnalytics
                WHERE deviceId = '${deviceId}'
                  AND state = 'breathing'
                  AND timestamp(from_unixtime(PROJECT.deviceAnalytics.createdAt))
                    >= '${item.labelDate.toISOString()}'
                  AND timestamp(from_unixtime(PROJECT.deviceAnalytics.createdAt))
                    < '${endDate.toISOString()}'
    `)
})

const queryString = query.join('\nUNION\n')
console.log(queryString)
