import { describe, expect, test } from '@jest/globals'
import { unitConverter } from './unitConverter'

describe('unit conversions', () => {
  const val: number = 61.5
  test('test inches to centimeters', () => {
    const unit: string = 'cm'
    const unitDisplay: string = 'in'
    const endTotal = 156.21

    const inTocm = unitConverter({ value: val, unit, unitDisplay })

    expect(inTocm).toEqual(endTotal)
  })
  test('test centimeters to inches', () => {
    const unit: string = 'in'
    const unitDisplay: string = 'cm'
    const endTotal = 24.21

    const cmToin = unitConverter({ value: val, unit, unitDisplay })
    expect(cmToin).toEqual(endTotal)
  })
  test('test lb to kg', () => {
    const unit: string = 'lb'
    const unitDisplay: string = 'kg'
    const endTotal = 27.90

    const lbTokg = unitConverter({ value: val, unit, unitDisplay })
    expect(lbTokg).toEqual(endTotal)
  })
  test('test kg to lb', () => {
    const unit: string = 'kg'
    const unitDisplay: string = 'lb'
    const endTotal = 135.58

    const kgTolb = unitConverter({ value: val, unit, unitDisplay })
    expect(kgTolb).toEqual(endTotal)
  })
  test('test F to C', () => {
    const unit: string = 'F'
    const unitDisplay: string = 'C'
    const endTotal = 16.39

    const FtoC = unitConverter({ value: val, unit, unitDisplay })
    expect(FtoC).toEqual(endTotal)
  })
  test('test C to F', () => {
    const unit: string = 'C'
    const unitDisplay: string = 'F'
    const endTotal = 142.70

    const CtoF = unitConverter({ value: val, unit, unitDisplay })
    expect(CtoF).toEqual(endTotal)
  })
})
