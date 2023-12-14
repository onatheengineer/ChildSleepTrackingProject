// This utility function is for unit conversion and to be used for the following unit:
// 'C', 'F', 'oz', 'ml', 'g', 'kg', 'lb', 'in', 'ft', 'cm', 'm', 'na'
import { valueRounded } from './valueRounded.ts'

interface UnitConverter {
  value: number
  unit: string
  unitDisplay: string
}

const unitConverter = ({ value, unit, unitDisplay }: UnitConverter): number => {
  if (unit === unitDisplay) {
    return value
  }

  // Food
  if (unitDisplay === 'ml') {
    if (unit === 'oz') {
      return valueRounded((value * 29.5735296875), 2)
    }
  }
  if (unitDisplay === 'oz') {
    if (unit === 'ml') {
      return valueRounded((value / 29.5735296875), 2)
    }
  }

  // Height
  if (unitDisplay === 'in') {
    if (unit === 'cm') {
      return valueRounded((value * 2.54), 2)
    }
  }
  if (unitDisplay === 'cm') {
    if (unit === 'in') {
      return valueRounded((value / 2.54), 2)
    }
  }

  // Weight
  if (unitDisplay === 'kg') {
    if (unit === 'lb') {
      return valueRounded((value / 2.20462), 2)
    }
  }
  if (unitDisplay === 'lb') {
    if (unit === 'kg') {
      return valueRounded((value * 2.20462), 2)
    }
  }

  // Temperature
  if (unitDisplay === 'F') {
    if (unit === 'C') {
      return valueRounded((value * (9 / 5) + 32), 2)
    }
  }
  if (unitDisplay === 'C') {
    if (unit === 'F') {
      return valueRounded(((value - 32) / 1.8), 2)
    }
  }
  throw new Error('Unable to convert units.')
}
export { unitConverter }
