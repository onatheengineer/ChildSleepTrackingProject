interface IntervalLabels {
  label: string
  labelDate: Date
}

interface GetIntervalLabels {
  interval: string
  refDate: Date
}

interface GraphGet {
  subject_id: string
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  displayUnit?: string
  refDate: Date
}

interface DataItem {
  type: string
  value: number
  unit?: string
}

interface GraphDataPoint {
  label: string
  labelDate: Date
  dataPoints: Record<string, DataItem>
}

interface GraphReturn {
  graphPoints: GraphDataPoint[]
}

interface GraphDataPointRespiratory {
  label: string
  labelDate: string
  mean: number
  RPM: string
}

export type {
  GraphGet,
  GraphDataPoint,
  DataItem,
  GraphReturn,
  IntervalLabels,
  GetIntervalLabels,
  GraphDataPointRespiratory
}
