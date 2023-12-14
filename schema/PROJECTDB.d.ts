import { type TimeStamp } from 'aws-sdk/clients/ebs'

export interface DeviceDBTable {
  subject_id: string
  subjectName?: string
  subjectDob?: string
  subjectGender?: string
  subjectIsPremature?: boolean
  hasSubjectImage?: boolean
  subscriptionState?: string | null
  subscriptionId?: string | null
  timezone?: string
  bedtime?: number
  waketime?: number
  sleepStartsRunAtUTC?: Date
  isDeleted?: boolean
  createdAt?: TimeStamp
  modifiedAt?: TimeStamp
}

export interface DeviceAnalyticsSummaryDBTable {
  subject_id: string
  date: Date
  nightWakeTime: string | null
  nightBedtime: string | null
  nightAvgOnset: string | null
  nightSleepDuration: string | null
  nightSleepQuality: string | null
  dayAvgOnset: string | null
  daySleepDuration: string | null
  daySleepQuality: number | null
  dayNumNaps: number | null
  dayAvgDuration: string | null
  totalAvgBpm: number | null
  totalAvgTemp: number | null
  totalAvgHumid: number | null
  version: number
  createdAt: string
  modifiedAt: Date | null
}

export interface DeviceAnalyticsSummaryTrackerDBTable {
  subject_id: string
  date: Date
  sqsDate: Date
  algoDate: Date
}
