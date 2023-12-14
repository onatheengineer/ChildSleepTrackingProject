import { describe, expect, test } from '@jest/globals'
import { isValidDateObject } from './isValidDateObject'

describe('isValidDate', () => {
  test('is date a valid Date object and not NaN', () => {
    const d: Date = new Date('2023-03-07')

    const date = isValidDateObject(d)

    expect(date).toBeTruthy()
  })

  test('date is not a valid date object', () => {
    const d = new Date('garbage')

    const date = isValidDateObject(d)

    expect(date).toBeFalsy()
  })
})
