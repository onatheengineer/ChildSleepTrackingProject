function getSunday (date: Date): Date {
  const dow: number = date.getDay()
  const dte: Date = new Date(date.getTime())
  dte.setDate(dte.getDate() - dow)
  return dte
}

export { getSunday }
