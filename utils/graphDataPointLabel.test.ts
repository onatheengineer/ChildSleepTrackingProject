import { describe, expect, test } from '@jest/globals'
import { ODataInterval } from 'schema'
import { DAY_OF_WEEK, MONTHS } from 'schema/constants.ts'
import { getSunday } from './getSunday'

import { graphDataPointLabel } from './graphDataPointLabel.ts'

describe('graphDataPointLabel', () => {
  test('DAILY - createdAt (date) is before given date', () => {
    const a: Date = new Date()

    a.setDate(a.getDate() - 10)

    const [dayOfWeek, createdAtDataPoint] = graphDataPointLabel({
      date: a,
      interval: ODataInterval.DAILY
    })

    expect(dayOfWeek).toBe(DAY_OF_WEEK[a.getDay()])
    expect(createdAtDataPoint).toBe(a)
  })

  test('DAILY - createdAt (date) is NOT after given date', () => {
    const a: Date = new Date()
    const b: Date = new Date()

    a.setDate(a.getDate() + 10)
    b.setDate(b.getDate() - 10)

    const [dayOfWeek, dayOfMonth] = graphDataPointLabel({
      date: a,
      interval: ODataInterval.DAILY
    })

    expect(dayOfWeek).not.toBe(b.setDate(b.getDate() - 10))
    expect(dayOfMonth).not.toBe(b.toLocaleDateString())
  })

  test('WEEKLY - month and dayOfMonth', () => {
    const a: Date = new Date()

    // a.setDate(a.getDate() - 10);

    const getSun = getSunday(a)
    const getSunCopy: Date = new Date(getSun.getTime())

    const [monthAndDayOfMonth, givenDateDate] = graphDataPointLabel({
      date: a,
      interval: ODataInterval.WEEKLY
    })

    expect(getSun).toEqual(expect.any(Date))
    expect(monthAndDayOfMonth).toEqual(expect.any(String))
    expect(givenDateDate).toEqual(expect.any(Date))
    expect(givenDateDate).toEqual(new Date(getSun.getTime()))
    expect(monthAndDayOfMonth).toStrictEqual(
            `${MONTHS[getSunCopy.getMonth()]} ${getSunCopy.getDate()}`
    )
  })

  test('MONTHLY - createdAt (date) is before given date', () => {
    const a: Date = new Date()

    a.setMonth(a.getMonth() - 7)
    a.setFullYear(a.getFullYear() - 3)
    const yearMonth = new Date(a.getFullYear(), a.getMonth(), 1)

    const [month, yearAndMonth] = graphDataPointLabel({
      date: a,
      interval: ODataInterval.MONTHLY
    })

    expect(month).toBe(`${MONTHS[a.getMonth()]}`)
    expect(yearAndMonth).toEqual(expect.any(Date))
    expect(yearAndMonth).toStrictEqual(yearMonth)
  })

  test('MONTHLY - createdAt (date) is NOT after given date', () => {
    const a: Date = new Date()
    const b: Date = new Date()

    a.setDate(a.getMonth() + 10)
    b.setDate(b.getMonth() - 10)

    const [monthAndDay, date] = graphDataPointLabel({
      date: a,
      interval: ODataInterval.MONTHLY
    })

    expect(monthAndDay).not.toBe(b.setDate(b.getDate() - 10))
    expect(date).not.toBe(b.toLocaleDateString())
  })
})
