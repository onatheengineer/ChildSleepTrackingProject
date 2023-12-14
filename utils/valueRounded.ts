// How to use: this function takes in a number value and an amount of decimal places needed and returns a fixed decimal place number

const valueRounded = (value: number, fixed: number): number => {
  const multiplier = Math.pow(10, fixed)
  return parseFloat((Math.round(value * multiplier) / multiplier).toFixed(fixed))
}

export { valueRounded }
