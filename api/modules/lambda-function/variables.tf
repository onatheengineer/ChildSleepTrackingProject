variable "PROJECT" {
  type        = string
  description = "The PROJECT tag to resources"
  default     = "PROJECT"
}

variable "localTags" {
  description = "Name of the PROJECT PROJECT API Environment State"
}
//value comes from main.tf

variable "localPrefix" {
  description = "Prefix name of the project: PROJECT"
}

variable "instance" {
  description = "instance (workspace) to tag resources"
}
//value comes from main.tf

variable "iam_lambda" {
  type        = string
  description = "The LambdaAdvancedAccess IAM Role"
  default     = "arn:aws:iam::....:role/LambdaAdvancedAccess"
}

// s3-lambda
variable "s3_lambda" {
  description = "The s3 bucket that hold lambda code."
}
//value comes from main.tf

// subject
variable "PROJECT_subject_lambda" {
  type        = string
  description = "The name of the PROJECT_subject lambda"
  default     = "PROJECT_subject"
}
variable "PROJECT_subject_s3" {
  type        = string
  description = "The name of the PROJECT_subject_s3"
  default     = "PROJECT-subject-s3"
}

// subject_manage_refactor
variable "PROJECT_subject_manage_refactor_lambda" {
  type        = string
  description = "The name of the PROJECT_subject_manage_refactor_lambda"
  default     = "PROJECT_subject_manage_refactor"
}
variable "PROJECT_subject_manage_refactor_s3" {
  type        = string
  description = "The name of the PROJECT-subject-manage-refactor-s3"
  default     = "PROJECT-subject-manage-refactor-s3"
}

// queryContentServer
variable "PROJECT_queryContentServer_lambda" {
  type        = string
  description = "The name of the PROJECT_queryContentServer_lambda"
  default     = "PROJECT_queryContentServer"
}

// bugreport
variable "PROJECT_bugReport_lambda" {
  type        = string
  description = "The name of the bugreport lambda"
  default     = "PROJECT_bugReport"
}
// healthtracker food
variable "PROJECT_healthtracker_food_lambda" {
  type        = string
  description = "The name of the PROJECT_healthtracker_food lambda"
  default     = "PROJECT_healthtracker_food"
}

variable "PROJECT_healthtracker_food_s3" {
  type        = string
  description = "The name of the PROJECT_healthtracker_food_s3"
  default     = "PROJECT-healthtracker-food-s3"
}

variable "PROJECT_healthtracker_diaper_lambda" {
  type        = string
  description = "The name of the PROJECT_healthtracker_diaper lambda"
  default     = "PROJECT_healthtracker_diaper"
}

variable "PROJECT_healthtracker_diaper_s3" {
  type        = string
  description = "The name of the PROJECT_healthtracker_diaper_s3"
  default     = "PROJECT-healthtracker-diaper-s3"
}

variable "PROJECT_healthtracker_healthissue_lambda" {
  type        = string
  description = "The name of the PROJECT_healthtracker_healthissue lambda"
  default     = "PROJECT_healthtracker_healthissue"
}

variable "PROJECT_healthtracker_healthissue_s3" {
  type        = string
  description = "The name of the PROJECT_healthtracker_healthissue_s3"
  default     = "PROJECT-healthtracker-healthissue-s3"
}

variable "PROJECT_healthtracker_temperature_lambda" {
  type        = string
  description = "The name of the PROJECT_healthtracker_temperature lambda"
  default     = "PROJECT_healthtracker_temperature"
}

variable "PROJECT_healthtracker_temperature_s3" {
  type        = string
  description = "The name of the PROJECT_healthtracker_temperature"
  default     = "PROJECT-healthtracker-temperature-s3"
}

variable "PROJECT_healthtracker_height_lambda" {
  type        = string
  description = "The name of the PROJECT_healthtracker_height lambda"
  default     = "PROJECT_healthtracker_height"
}

variable "PROJECT_healthtracker_height_s3" {
  type        = string
  description = "The name of the PROJECT_healthtracker_height"
  default     = "PROJECT-healthtracker-height-s3"
}

// weight
variable "PROJECT_healthtracker_weight_lambda" {
  type        = string
  description = "The name of the PROJECT_healthtracker_weight lambda"
  default     = "PROJECT_healthtracker_weight"
}

variable "PROJECT_healthtracker_weight_s3" {
  type        = string
  description = "The name of the PROJECT_healthtracker_weight"
  default     = "PROJECT-healthtracker-weight-s3"
}

// respiratory
variable "PROJECT_respiratory_lambda" {
  type        = string
  description = "The name of the PROJECT_respiratory_lambda"
  default     = "PROJECT_respiratory"
}

variable "PROJECT_respiratory_s3" {
  type        = string
  description = "The name of the PROJECT_respiratory"
  default     = "PROJECT-respiratory-s3"
}

// dailytracker
variable "PROJECT_dailytracker_lambda" {
  type        = string
  description = "The name of the PROJECT_dailytracker_lambda"
  default     = "PROJECT_dailytracker"
}

variable "PROJECT_dailytracker_s3" {
  type        = string
  description = "The name of the PROJECT_dailytracker"
  default     = "PROJECT-dailytracker-s3"
}

// health issue survey response
variable "PROJECT_saveHealthIssueSurveyResponse_lambda" {
  type        = string
  description = "The name of the PROJECT_saveHealthIssueSurveyResponse lambda"
  default     = "PROJECT_saveHealthIssueSurveyResponse"
}

// health issue survey display
variable "PROJECT_healthIssuesSurveyDisplay_lambda" {
  type        = string
  description = "The name of the PROJECT_healthIssuesSurveyDisplay lambda"
  default     = "PROJECT_healthIssuesSurveyDisplay"
}

// Native health issue getHealthIssues (health issue codes)
variable "PROJECT_getHealthIssues_lambda" {
  type        = string
  description = "The name of the PROJECT_getHealthIssues lambda"
  default     = "PROJECT_getHealthIssues"
}

// healthissue_PROJECTcodes (health issue codes)
variable "healthissue_PROJECTcodes_lambda" {
  type        = string
  description = "The name of the healthissue_PROJECTcodes lambda"
  default     = "healthissue_PROJECTcodes"
}

variable "healthissue_PROJECTcodes_s3" {
  type        = string
  description = "The name of the healthissue_PROJECTcodes lambda"
  default     = "healthissue-PROJECTcodes-s3"
}

// graph_food_bottle
variable "PROJECT_graph_food_bottle_lambda" {
  type        = string
  description = "The name of the PROJECT_graph_food_bottle_lambda"
  default     = "PROJECT_graph_food_bottle"
}

variable "PROJECT_graph_food_bottle_s3" {
  type        = string
  description = "The name of the PROJECT-graph-food-bottle-s3"
  default     = "PROJECT-graph-food-bottle-s3"
}

// graph_diaper
variable "PROJECT_graph_diaper_lambda" {
  type        = string
  description = "The name of the PROJECT_graph_diaper_lambda"
  default     = "PROJECT_graph_diaper"
}

variable "PROJECT_graph_diaper_s3" {
  type        = string
  description = "The name of the PROJECT-graph-diaper-s3"
  default     = "PROJECT-graph-diaper-s3"
}

// graph_respiratory
variable "PROJECT_graph_respiratory_lambda" {
  type        = string
  description = "The name of the PROJECT_graph_respiratory_lambda"
  default     = "PROJECT_graph_respiratory"
}

variable "PROJECT_graph_respiratory_s3" {
  type        = string
  description = "The name of the PROJECT-graph-respiratory-s3"
  default     = "PROJECT-graph-respiratory-s3"
}

// PROJECT_nightsleepquality_trigger_for_sqs
variable "PROJECT_nightsleepquality_trigger_for_sqs_lambda" {
  type        = string
  description = "The name of the PROJECT_nightsleepquality_trigger_for_sqs_lambda"
  default     = "PROJECT_nightsleepquality_trigger_for_sqs"
}

variable "PROJECT_nightsleepquality_trigger_for_sqs_s3" {
  type        = string
  description = "The name of the PROJECT_nightsleepquality_trigger_for_sqs_s3"
  default     = "PROJECT-nightsleepquality-trigger-for-sqs-s3"
}

// PROJECT_nightsleepquality_sqs_consumer
variable "PROJECT_nightsleepquality_sqs_consumer_lambda" {
  type        = string
  description = "The name of the PROJECT_nightsleepquality_sqs_consumer_lambda"
  default     = "PROJECT_nightsleepquality_sqs_consumer"
}

variable "PROJECT_nightsleepquality_sqs_consumer_s3" {
  type        = string
  description = "The name of the PROJECT_nightsleepquality_sqs_consumer_s3"
  default     = "PROJECT-nightsleepquality-sqs-consumer-s3"
}

// PROJECT_sleep_lambda
variable "PROJECT_sleep_lambda" {
  type        = string
  description = "The name of the PROJECT_sleep_lambda"
  default     = "PROJECT_sleep_lambda"
}

variable "PROJECT_sleep_s3" {
  type        = string
  description = "The name of the PROJECT_sleep_s3"
  default     = "PROJECT-sleep-s3"
}

