const QUEUE_URL_SQS_MORNING: string =
    'https://sqs...../PROJECT_subject_idDateMorning'
const QUEUE_URL_SQS_NIGHTSLEEPQUALITY: string = 'https://sqs...../PROJECT-sqs-queue-nightsleepquality'

const DAY_OF_WEEK: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MONTHS: string[] = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC'
]

const CFeatureType: string[] = [
  'TEMPERATURE',
  'WEIGHT',
  'HEIGHT',
  'FOOD',
  'DIAPER',
  'RESPIRATORY',
  'SLEEP',
  'HEALTHISSUE',
  'ILLNESS',
  'PARENTINGTIPS',
  'SURVEY'
]

export { CFeatureType, MONTHS, DAY_OF_WEEK, QUEUE_URL_SQS_MORNING, QUEUE_URL_SQS_NIGHTSLEEPQUALITY }
