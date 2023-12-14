interface DeviceOwner {
  ownerId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  ownerCreatedAt: string
  updatedAt: string
}

// enum SubscriptionStatusTable {
// 0 = "inactive",
// 1 = "active",
// 2 = "paused"
// }

interface UserDeviceTable {
  id: string
  userCreatedAt: string
  subject_id: string
  email: string
  inviteCode: string
  // status: SubscriptionStatusTable;
  isOwner: boolean
  subjectRelation: string
  accessLevel: string
  notificationSettings: object
  createdAt: number
  modifiedAt: number
}

interface Subject {
  subjectId: string
  dateOfBirth: string
  firstName: string
  lastName?: string
  gender: Gender
  premature: boolean
  weeksPremature?: WeeksPremature
  subjectCreatedAt: string
  updatedAt: string
}

interface SharedOwner {
  email: string
  relationshipToUser: Relationship
  levelOfSharedAccess: SharedAccess
}

declare enum Gender {
  Female,
  Male,
}

declare enum SharedAccess {
  Full,
  LiveMonitorOnly,
  NoAccess,
}

declare enum Relationship {
  Mother,
  Father,
  Babysitter,
  Grandmother,
  Grandfather,
  Aunt,
  Uncle,
  Doctor,
  Nurse,
  Other,
}

declare enum WeeksPremature {
  Zero,
  One,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Eleven,
  Twelve,
  Thirteen,
  Fourteen,
  Fifteen,
  Sixteen,
  Seventeen,
  Eighteen,
  Nineteen,
  Twenty,
  TwentyOne,
  TwentyTwo,
  TwentyThree,
  TwentyFour,
  TwentyFive,
  TwentySix,
  TwentySeven,
  TwentyEight,
  TwentyNine,
  Thirty,
}

interface DeviceContent {
  subject_id: string
  originDate: Date
  subscriptionType: string
  deviceOwner: DeviceOwner
  sharedOwner: SharedOwner
  subject: Subject
}

export {
  type DeviceContent,
  WeeksPremature,
  type DeviceOwner,
  type SharedOwner,
  type UserDeviceTable,
  SharedAccess,
  Gender,
  type Subject,
  Relationship
}
