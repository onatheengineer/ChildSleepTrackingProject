const CHealthIssuePROJECTCodeSymptom = [
  'Been sick',
  'Had a fever',
  'Cough',
  'Sneeze',
  'Change in feeding habit',
  'Had congestion (runny nose)',
  'Respiratory distress/trouble breathing',
  'Been more fussy than usual', // the medical term for this is `Colic`
  'Other'
]

const OHealthIssuePROJECTCode = {
  PROJECT10: 'Had a fever',
  PROJECT20: 'Cough',
  PROJECT30: 'Been sick',
  PROJECT40: 'Sneeze',
  PROJECT50: 'Change in feeding habit',
  PROJECT60: 'Had congestion (runny nose)',
  PROJECT70: 'Respiratory distress/trouble breathing',
  PROJECT80: 'Been more fussy than usual', // the medical term for this is `Colic`
  PROJECT9999: 'Other'
}

const CHealthIssuePROJECTCode = [
  'PROJECT10',
  'PROJECT20',
  'PROJECT30',
  'PROJECT40',
  'PROJECT50',
  'PROJECT60',
  'PROJECT70',
  'PROJECT80', // the medical term for this is `Colic`
  'PROJECT9999'
]

export { CHealthIssuePROJECTCodeSymptom, OHealthIssuePROJECTCode, CHealthIssuePROJECTCode }
