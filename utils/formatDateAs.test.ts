import { describe, expect, test } from '@jest/globals'
import { formatDateAs } from './formatDateAs'

describe('formatDateAs', () => {
  test('date is a correct ISO/UTC format YYYY-MM-DD', () => {
    const d = new Date('2023-03-21')
    const date = formatDateAs(d)
    console.log('fist:::', date)
    expect(date).toBeTruthy()
  })
  test('date is rearranged to correct ISO/UTC format YYYY-MM-DD', () => {
    const d = new Date('03-21-2023')
    const date = formatDateAs(d)
    console.log('second:::', date)
    expect(date).toBeTruthy()
  })
  test('date is split to only display YYYY-MM-DD', () => {
    const d = '21 March 2023 14:48 UTC'
    const date = formatDateAs(d)
    console.log('third:::', date)
    expect(date).toBeTruthy()
  })
  test('unix-timestamp number without milliseconds', () => {
    const d: number = 1679399752
    const date = formatDateAs(d)
    console.log('forth:::', date)
    expect(date).toBeTruthy()
  })
  test('unix-timestamp number with milliseconds', () => {
    const d: number = 1679399752000
    const date = formatDateAs(d)
    console.log('fifth:::', date)
    expect(date).toBeTruthy()
  })
  test('parameter equals garbage, throws error', () => {
    const d: string = 'garbage'
    console.log('sixth:::', d)
    expect(() => formatDateAs(d)).toThrow(TypeError)
  })
})
