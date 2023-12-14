interface HeightItem {
  height_id: string
  subject_id: string
  height: number
  subHeight: number | undefined
  units: 'in' | 'cm'
  subUnits: 'ft' | 'na'
  notes: string | undefined
  createdAt: string
}

interface HeightItemPost {
  subject_id: string
  refDate: string
  height: number
  subHeight: number | undefined
  units: 'in' | 'cm'
  subUnits: 'ft' | 'na'
  notes: string | undefined
}

interface HeightItemPut {
  height_id: string
  refDate: string
  height: number | undefined
  subHeight: number | undefined
  units?: 'in' | 'cm'
  subUnits?: 'ft' | 'na'
  notes: string | undefined
}

interface HeightDDBPost {
  TableName: string
  Item: HeightItem
}

interface HeightDDBDeleteGet {
  TableName: string
  Key: {
    height_id: string
  }
}

interface HeightDDBUpdate {
  TableName: string
  Key: {
    height_id: string
  }
  UpdateExpression: string
  ExpressionAttributeValues: Record<string, any>
}

export type {
  HeightItem,
  HeightItemPost,
  HeightItemPut,
  HeightDDBPost,
  HeightDDBUpdate,
  HeightDDBDeleteGet
}
