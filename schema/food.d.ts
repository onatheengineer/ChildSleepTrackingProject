interface FoodItem {
  food_id: string
  subject_id: string
  delivery: 'RIGHTBREAST' | 'LEFTBREAST' | 'BOTTLE' | 'UTENSIL'
  category: 'BREASTMILK' | 'FORMULA' | 'SOLID'
  solidFoodType: string | null
  amount: number | null
  units: 'oz' | 'ml' | 'min' | 'na'
  notes: string | null
  createdAt: string
}

interface FoodItemPost {
  subject_id: string
  refDate: string
  delivery: 'RIGHTBREAST' | 'LEFTBREAST' | 'BOTTLE' | 'UTENSIL'
  category: 'BREASTMILK' | 'FORMULA' | 'SOLID'
  solidFoodType: string | null
  amount: number | null
  units: 'oz' | 'ml' | 'min' | 'na'
  notes: string | null
}

interface FoodItemPut {
  food_id: string
  refDate: string
  subject_id?: string
  delivery?: 'RIGHTBREAST' | 'LEFTBREAST' | 'BOTTLE' | 'UTENSIL'
  category?: 'BREASTMILK' | 'FORMULA' | 'SOLID'
  solidFoodType: string | null
  amount: number | null
  units?: 'oz' | 'ml' | 'min' | 'na'
  notes: string | null
}

interface FoodDDBPost {
  TableName: string
  Item: FoodItem
}

interface FoodDDBUpdate {
  TableName: string
  Key: {
    food_id: string
  }
  UpdateExpression: string
  ExpressionAttributeValues: Record<string, any>
}

interface FoodDDBDeleteGet {
  TableName: string
  Key: {
    food_id: string
  }
}

// Graph Types and Interfaces
interface FoodGraph {
  foodType: string
  foodDelivery: string
  amount: number
  dayTotal: number
  time: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  units: string
  createdAt: number
}

interface FoodGraphProps {
  subject_id: string
  units: string
  refDate: Date
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY'
}

interface FoodGraphEvent {
  subject_id: string
  units: string
  refDate: string
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY'
}

interface TFoodGraphDataPoint {
  label: string
  labelDate: Date
  units: string
  breastMilkAmount: number
  formulaAmount: number
}

interface FoodGraphReturn {
  data: TFoodGraphDataPoint[]
  raw: FoodItem[]
  dataDate: string
}

export type {
  FoodDDBDeleteGet,
  FoodItem,
  FoodItemPost,
  FoodDDBPost,
  FoodItemPut,
  FoodDDBUpdate,
  FoodGraph,
  FoodGraphProps,
  FoodGraphReturn,
  FoodGraphEvent,
  TFoodGraphDataPoint
}
