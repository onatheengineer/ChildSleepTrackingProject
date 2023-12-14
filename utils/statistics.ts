// Utility to calculate the mean, variance and standard deviation of an array

const calculateMean = (values: number[]): number => {
  const mean = (values.reduce((sum, current) => sum + current)) / values.length
  return mean
}

// Calculate variance
const calculateVariance = (values: number[]): number => {
  const average = calculateMean(values)
  const squareDiffs = values.map((value: number): number => {
    const diffSq = (value - average) ** 2
    return diffSq
  })
  const variance = calculateMean(squareDiffs)
  return variance
}

// Calculate standard deviation
const calculateSD = (values: number[]): number => {
  const variance = calculateVariance(values)
  return Math.sqrt(variance)
}

export { calculateMean, calculateVariance, calculateSD }
