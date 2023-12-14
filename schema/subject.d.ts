interface SubjectItem {
  subject_id: string
  deviceId: string
  dob: string | undefined
  createdAt: Date
}

interface GetSubjectIdOrDeviceId {
  deviceId?: string
  subject_id?: string
}

interface DeviceInfoRDS {
  deviceId: string
  subjectName: string
  subjectDob: string
  subscriptionStatusId: boolean
  createdAt: number
}

interface DeviceInfoRDSETL {
  deviceId: string
  subjectName: string
  subjectDob: Date
  subscriptionStatusId: boolean
  maxCreatedAt: number
}

interface SubjectItemGet {
  subject_id: string
  deviceId: string
  name: string
  dob: string
  image: string | undefined
  subscriptionStatus: boolean
  subscriptionStatusType: string | undefined
  createdAt: string
}

interface GetSubjectProps {
  deviceId?: string
  subject_id?: string
}

export type { GetSubjectIdOrDeviceId, GetSubjectProps, SubjectItem, SubjectItemGet, DeviceInfoRDS, DeviceInfoRDSETL }
