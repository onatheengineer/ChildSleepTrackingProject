interface IsRespiratoryRateState {
  isNormal: boolean
  isHistorical: boolean
  isElevated: boolean
}

interface RespiratoryItem {
  createdAt: Date
  meanLast24: number
  meanLast7Days: number
  sdvLast7Days: number
}

interface IllnessInformation {
  metricsStatement: string
  videoStatement: string
  videoURL: string
}

interface RespiratoryItemGet {
  subject_id: string
  refDate: Date
}

interface RespiratoryItemReturn {
  lastUpdatedAt: string | undefined
  statement: string
  subStatement: 'Make sure that your baby sleeps under the PROJECT Monitor through the night' | ''
  attention: 'lower' | 'consistent' | 'inconsistentHigh' | 'higher' | 'na' | 'Error'
  middleNumberRPM: number // from nightly summary runs at 10am local, 17 hrs of data gathered from 5PM - 10AM
  illnessInformation: IllnessInformation
}

export type {
  RespiratoryItem,
  RespiratoryItemGet,
  IsRespiratoryRateState,
  RespiratoryItemReturn
}
