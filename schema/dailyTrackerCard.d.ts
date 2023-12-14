import { type DiaperItem } from './diaper'
import { type FoodItem } from './food'
import { type HeightItem } from './height'
import { type HealthIssueItem } from './index'
import { type TemperatureItem } from './temperature'
import { type WeightItem } from './weight'

interface DailyTrackerItemGet {
  subject_id: string
  refDate: Date
  startDate: Date
}

interface DailyTrackerItemGetReturn {
  feature: 'Empty State' | 'Health issue' | 'Bottle Feed' | 'Breast Feed' | 'Solid Food' | 'Diaper Change' | 'Height' | 'Weight' | 'Temperature'
  totalDailyAmount?: number
  solidFoodType?: string
  unit?: 'oz' | 'ml' | 'min' | 'in' | 'cm' | 'C' | 'F' | 'kg' | 'lb'
  notes?: string
  createdAt?: string
  data: HealthIssueItem[] | FoodItem[] | DiaperItem[] | WeightItem[] | HeightItem[] | TemperatureItem[]
}

export {
  type DailyTrackerItemGet,
  type DailyTrackerItemGetReturn
}
