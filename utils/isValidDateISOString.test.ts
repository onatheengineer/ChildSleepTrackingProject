import { describe, expect, test } from '@jest/globals'
import { isValidDateISOString } from './isValidDateISOString'

describe('isValidISOString', () => {
  test('date is a correct ISO/UTC format', () => {
    const d = '2021-11-04T22:32:47.142354-10:00'

    const date = isValidDateISOString(d)

    expect(date).toBeTruthy()
  })

  test('date is not correct ISO/UTC format', () => {
    const d = '03-07-2023'

    const date = isValidDateISOString(d)

    expect(date).toBeFalsy()
  })
})
