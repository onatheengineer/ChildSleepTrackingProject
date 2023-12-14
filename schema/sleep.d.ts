interface SleepItem {
  sleepScore: number
  sleepScoreTotal: number
  sleepDurationPercentile: number
  sleepDurationScore: number
  sleepQualityScore: number
  sleepQualityPercentile: number
  nightSleepQuality: number // same thing as sleepEfficiency
  nightWakeTime: Date
  nightBedTime: Date
  nightSleepDuration: Date
  isSleepScoreActive?: boolean
  // sleepScoreInactiveVideo: string
}

export type { SleepItem }
