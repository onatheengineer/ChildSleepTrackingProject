interface TemperatureItem {
  temperature_id: string
  subject_id: string
  degree: number
  units: 'C' | 'F'
  notes: string | undefined
  createdAt: string
}

interface TemperatureItemPost {
  subject_id: string
  refDate: string
  degree: number
  units: 'C' | 'F'
  notes: string | undefined
}

interface TemperatureItemPut {
  temperature_id: string
  refDate: string
  degree: number | undefined
  units?: 'C' | 'F'
  notes: string | undefined
}

interface TemperatureDDBPost {
  TableName: string
  Item: TemperatureItem
}

interface TemperatureDDBDeleteGet {
  TableName: string
  Key: {
    temperature_id: string
  }
}

interface TemperatureDDBUpdate {
  TableName: string
  Key: {
    temperature_id: string
  }
  UpdateExpression: string
  ExpressionAttributeValues: Record<string, any>
}

export type {
  TemperatureItem,
  TemperatureItemPost,
  TemperatureItemPut,
  TemperatureDDBPost,
  TemperatureDDBUpdate,
  TemperatureDDBDeleteGet
}
