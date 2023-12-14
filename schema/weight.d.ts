interface WeightItem {
  weight_id: string
  subject_id: string
  weight: number
  units: 'kg' | 'lb'
  notes: string | undefined
  createdAt: string
}

interface WeightItemPost {
  subject_id: string
  refDate: string
  weight: number
  units: 'kg' | 'lb'
  notes: string | undefined
}

interface WeightItemPut {
  weight_id: string
  refDate: string
  weight: number
  units: 'kg' | 'lb'
  notes: string | undefined
}

interface WeightDDBPost {
  TableName: string
  Item: WeightItem
}

interface WeightDDBUpdate {
  TableName: string
  Key: {
    weight_id: string
  }
  UpdateExpression: string
  ExpressionAttributeValues: Record<string, any>
}

interface WeightDDBDeleteGet {
  TableName: string
  Key: {
    weight_id: string
  }
}

export type {
  WeightItem,
  WeightItemPost,
  WeightItemPut,
  WeightDDBPost,
  WeightDDBUpdate,
  WeightDDBDeleteGet
}
