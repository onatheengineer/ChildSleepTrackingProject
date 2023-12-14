// can not have more than 60 diapers a day
interface DiaperItem {
  diaper_id: string
  subject_id: string
  category: 'WET' | 'DIRTY' | 'BOTH'
  amount: number
  notes: string | undefined
  createdAt: string
}

interface DiaperItemPost {
  subject_id: string
  refDate: string
  category: 'WET' | 'DIRTY' | 'BOTH'
  amount: number
  notes: string | undefined
}

interface DiaperItemPut {
  diaper_id: string
  refDate: string
  category?: 'WET' | 'DIRTY' | 'BOTH'
  amount?: number
  notes: string | undefined
}

interface DiaperDDBPost {
  TableName: string
  Item: DiaperItem
}

interface DiaperDDBUpdate {
  TableName: string
  Key: {
    diaper_id: string
  }
  UpdateExpression: string
  ExpressionAttributeValues: Record<string, any>
}

interface DiaperDDBDeleteGet {
  TableName: string
  Key: {
    diaper_id: string
  }
}

// Diaper Graph
interface GetGraphDataDiaperProps {
  subject_id: string
  featureType: string
  refDate: Date
  interval: 'DAILY | WEEKLY | MONTHLY'
}

interface DiaperDataPoint {
  label: string
  labelDate: string
  dirtyAmount: number
  wetAmount: number
  bothAmount: number
}

interface DiaperGraphReturn {
  data: DiaperDataPoint[]
  raw: DiaperItem[]
  refDate: string
}

export type {
  DiaperItemPost,
  DiaperDDBDeleteGet,
  DiaperDDBUpdate,
  DiaperDDBPost,
  DiaperItem,
  DiaperItemPut
}
