interface DayDiffDeltaOneProps {
  date: Date | string | number
  datePart: string
  delta: number
}

function dayDiffDeltaOne ({
  date,
  datePart,
  delta
}: DayDiffDeltaOneProps): string {
  if (date === null || date === undefined || Number.isNaN(date)) {
    return ''
  }

  const dateCopy: Date = new Date(date)

  // Getting required values
  const year = dateCopy.getFullYear()
  const month = dateCopy.getMonth()
  const day = dateCopy.getDate()

  // Creating a new Date (with the delta)
  if (datePart === 'day') {
    const deltaOne = new Date(year, month, day - delta)
    return deltaOne.toISOString()
  }
  // remember month of January is 0
  if (datePart === 'month') {
    const deltaOne = new Date(year, month - delta, day)
    return deltaOne.toISOString()
  }
  if (datePart === 'year') {
    const deltaOne = new Date(year - delta, month, day)
    return deltaOne.toISOString()
  }
  return ''
}

export { dayDiffDeltaOne }
