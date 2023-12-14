const isValidDateObject = (d: Date): boolean => {
  return Boolean(d) && !isNaN(d.getTime())
}

export { isValidDateObject }
