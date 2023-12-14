import { describe, expect, test } from '@jest/globals'
import { dayDiffGetTime } from './dayDiffGetTime'

describe('dayDiff', () => {
  test('the difference in time between two date objects', () => {
    const a: Date = new Date('July 20, 69 00:20:18')
    const b: Date = new Date()

    const dayDifference = dayDiffGetTime({ date1: a, date2: b })

    expect(dayDifference).toBeLessThanOrEqual(b.getTime())
  })
  test('date1 to equal date2', () => {
    const a: Date = new Date()
    const b: Date = new Date()

    const dayDifference = dayDiffGetTime({ date1: a, date2: b })
    console.log('dayDifference1', dayDifference)

    expect(dayDifference).toBeLessThanOrEqual(b.getTime())
  })

  test('date1 to equal date2', () => {
    const a: Date = new Date()
    const b: Date = new Date('July 20, 69 00:20:18')

    const dayDifference = dayDiffGetTime({ date1: a, date2: b })
    console.log('dayDifference2', dayDifference)

    expect(dayDifference).not.toBeLessThanOrEqual(b.getTime())
    expect(dayDifference).toEqual(expect.any(Number))
  })
})
