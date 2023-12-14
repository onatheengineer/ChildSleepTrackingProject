// to use this funtion:
// needs to take in a non-null values is the form of toISODtring date, specifically the date with dashes
// mySQL Date Data Types:
// DATE - format YYYY-MM-DD
// DATETIME - format: YYYY-MM-DD HH:MI:SS

import { isValidDateObject } from './isValidDateObject.ts'

const formatDateAs = (date: any): string => {
  if (typeof date === 'string') {
    const dateObj = new Date(date)
    if (isValidDateObject(dateObj)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return dateObj.toISOString().split('T', 1)[0]!
    } else {
      throw new TypeError('Failed to format typeof date === string to string')
    }
  }
  if (typeof date === 'number') {
    // unix_timestamps in both seconds and milliseconds.
    const d = new Date(date.toString().length > 10 ? date : date * 1000)
    if (isValidDateObject(d)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return d.toISOString().split('T', 1)[0]!
    } else {
      throw new TypeError('Failed to format typeof date === number to string')
    }
  }
  if (date instanceof Date) {
    if (isValidDateObject(date)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return new Date(date).toISOString().split('T', 1)[0]!
    } else {
      throw new TypeError('Failed to format date instanceof Date to string')
    }
  }
  if (!isValidDateObject(date)) {
    throw new TypeError('Failed to format date to string')
  }
  return (
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
  )
}

export { formatDateAs }
