export interface AdvanAnalSleepDataNightlySum {
  id: number
  subject_id: string
  sleepScore: number
  sleepDurationPercentile: number
  sleepQualityPercentile: number
  userVerification: boolean
  createdAt: Date
  PROJECT_seen: boolean
  PROJECT_used: boolean
  SleepDurationScore: number
  SleepQualityScore: number
}
