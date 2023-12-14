function isValidDateISOString (d: string): boolean {
  const ISOregex =
        /^(?:\d{4})-(?:\d{2})-(?:\d{2})T(?:\d{2}):(?:\d{2}):(?:\d{2}(?:\.\d*)?)(?:(?:-(?:\d{2}):(?:\d{2})|Z)?)$/
  // Validate ISO date
  return Boolean(ISOregex.test(d))
}

export { isValidDateISOString }
