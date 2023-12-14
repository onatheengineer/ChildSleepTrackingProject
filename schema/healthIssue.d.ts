import { type CHealthIssuePROJECTCode } from './healthIssueC'

interface HealthIssueItem {
  healthissue_id: string
  subject_id: string
  PROJECTCode: typeof CHealthIssuePROJECTCode
  isSurvey: boolean
  initialResponse: 'yes' | 'no' | 'x' | 'na'
  notes: string | undefined
  createdAt: string
}

interface HealthIssueItemPost {
  subject_id: string
  refDate: string
  PROJECTCode: typeof CHealthIssuePROJECTCode
  isSurvey: boolean
  initialResponse: 'yes' | 'no' | 'x' | 'na'
  notes: string | undefined
}

interface HealthIssueItemPut {
  healthissue_id: string
  refDate: string
  PROJECTCode?: typeof CHealthIssuePROJECTCode
  notes: string | undefined
}

interface HealthIssueDDBPost {
  TableName: string
  Item: HealthIssueItem
}

interface HealthIssueDDBUpdate {
  TableName: string
  Key: {
    healthissue_id: string
  }
  UpdateExpression: string
  ExpressionAttributeValues: Record<string, any>
}

interface HealthIssueDDBDeleteGet {
  TableName: string
  Key: {
    healthissue_id: string
  }
}

export type {
  HealthIssueItem,
  HealthIssueItemPost,
  HealthIssueItemPut,
  HealthIssueDDBUpdate,
  HealthIssueDDBPost,
  HealthIssueDDBDeleteGet
}
