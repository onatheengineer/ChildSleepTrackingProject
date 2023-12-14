variable "PROJECT_PROJECT_api" {
  type        = string
  description = "Name of the PROJECT PROJECT API that uses Stages for Environment State"
  default     = "PROJECT PROJECT API"
}

variable "localTags" {
  description = "Name of the PROJECT PROJECT API Environment State"
}
//value comes from main.tf

variable "localPrefix" {
  description = "Prefix name of the project: PROJECT"
}
//value comes from main.tf

variable "stage_name_default" {
  type    = string
  default = "PROJECT_PROJECT_api_stage_default"
}

variable "cognito_user_pools_arn" {
  type        = string
  description = "The ARN of the user pool"
}
//value comes from main.tf

variable "PROJECT_api_domain_name" {
  type        = string
  description = "api-gateway domain name"
}

variable "api_gateway_region" {
  type        = string
  description = "The region in which to create/manage resources"
}
//value comes from main.tf

// subject
variable "PROJECT_subject_name" {
  type        = string
  description = "PROJECT_subject_name"
}
//value comes from main.tf
variable "PROJECT_subject_arn" {
  type        = string
  description = "PROJECT_subject_arn"
}
//value comes from main.tf

// queryContentServer
variable "PROJECT_queryContentServer_name" {
  type        = string
  description = "PROJECT_queryContentServer_name"
}
variable "PROJECT_queryContentServer_arn" {
  type        = string
  description = "PROJECT_queryContentServer_arn"
}
//value comes from main.tf


// bugreport
variable "PROJECT_bugReport_name" {
  type        = string
  description = "PROJECT_bugReport_name"
}
//value comes from main.tf

variable "PROJECT_bugReport_arn" {
  type        = string
  description = "PROJECT_bugReport_arn"
}
//value comes from main.tf

variable "PROJECT_healthtracker_food_name" {
  type        = string
  description = "PROJECT_healthtracker_food_name"
}
//value comes from main.tf

variable "PROJECT_healthtracker_food_arn" {
  type        = string
  description = "PROJECT_healthtracker_food_arn"
}
//value comes from main.tf

variable "PROJECT_healthtracker_diaper_name" {
  type        = string
  description = "PROJECT_healthtracker_diaper_name"
}
//value comes from main.tf

variable "PROJECT_healthtracker_diaper_arn" {
  type        = string
  description = "PROJECT_healthtracker_diaper_arn"
}
//value comes from main.tf

// health issue
variable "PROJECT_healthtracker_healthissue_name" {
  type        = string
  description = "PROJECT_healthtracker_healthissue_name"
}
//value comes from main.tf
variable "PROJECT_healthtracker_healthissue_arn" {
  type        = string
  description = "PROJECT_healthtracker_healthissue_arn"
}
//value comes from main.tf


// temperature
variable "PROJECT_healthtracker_temperature_name" {
  type        = string
  description = "PROJECT_healthtracker_temperature_name"
}
//value comes from main.tf
variable "PROJECT_healthtracker_temperature_arn" {
  type        = string
  description = "PROJECT_healthtracker_temperature_arn"
}
//value comes from main.tf

// height
variable "PROJECT_healthtracker_height_name" {
  type        = string
  description = "PROJECT_healthtracker_height_name"
}
//value comes from main.tf
variable "PROJECT_healthtracker_height_arn" {
  type        = string
  description = "PROJECT_healthtracker_height_arn"
}
//value comes from main.tf

// weight
variable "PROJECT_healthtracker_weight_name" {
  type        = string
  description = "PROJECT_healthtracker_weight_name"
}
variable "PROJECT_healthtracker_weight_arn" {
  type        = string
  description = "PROJECT_healthtracker_weight_arn"

}

// respiratory
variable "PROJECT_respiratory_name" {
  type        = string
  description = "PROJECT_respiratory_name"
}
variable "PROJECT_respiratory_arn" {
  type        = string
  description = "PROJECT_respiratory_arn"
}
//value comes from main.tf

// dailytracker
variable "PROJECT_dailytracker_name" {
  type        = string
  description = "PROJECT_dailytracker_name"
}
variable "PROJECT_dailytracker_arn" {
  type        = string
  description = "PROJECT_dailytracker_arn"
}
//value comes from main.tf

// PROJECT_saveHealthIssueSurveyResponse
variable "PROJECT_saveHealthIssueSurveyResponse_name" {
  type        = string
  description = "PROJECT_saveHealthIssueSurveyResponse_name"
}
variable "PROJECT_saveHealthIssueSurveyResponse_arn" {
  type        = string
  description = "PROJECT_saveHealthIssueSurveyResponse_arn"
}
//value comes from main.tf

// PROJECT_healthIssuesSurveyDisplay.js
variable "PROJECT_healthIssuesSurveyDisplay_name" {
  type        = string
  description = "PROJECT_healthIssuesSurveyDisplay_name"
}
variable "PROJECT_healthIssuesSurveyDisplay_arn" {
  type        = string
  description = "PROJECT_healthIssuesSurveyDisplay_arn"
}
//value comes from main.tf

// PROJECT_getHealthIssues.js
variable "PROJECT_getHealthIssues_name" {
  type        = string
  description = "PROJECT_getHealthIssues_name"
}
variable "PROJECT_getHealthIssues_arn" {
  type        = string
  description = "PROJECT_getHealthIssues_arn"
}
//value comes from main.tf

// healthissue_PROJECTcodes.js
variable "healthissue_PROJECTcodes_name" {
  type        = string
  description = "healthissue_PROJECTcodes_name"
}
variable "healthissue_PROJECTcodes_arn" {
  type        = string
  description = "healthissue_PROJECTcodes_arn"
}
//value comes from main.tf

// graphFoodBottle
variable "PROJECT_graph_food_bottle_name" {
  type        = string
  description = "PROJECT_graph_food_bottle_name"
}
variable "PROJECT_graph_food_bottle_arn" {
  type        = string
  description = "PROJECT_graph_food_bottle_arn"
}
//value comes from main.tf

// graphDiaper
variable "PROJECT_graph_diaper_name" {
  type        = string
  description = "PROJECT_graph_diaper_name"
}
variable "PROJECT_graph_diaper_arn" {
  type        = string
  description = "PROJECT_graph_diaper_arn"
}
//value comes from main.tf

// graphDiaper
variable "PROJECT_graph_respiratory_name" {
  type        = string
  description = "PROJECT_graph_respiratory_name"
}
variable "PROJECT_graph_respiratory_arn" {
  type        = string
  description = "PROJECT_graph_respiratory_arn"
}
//value comes from main.tf

// sleep
variable "PROJECT_sleep_name" {
  type        = string
  description = "PROJECT_sleep_name"
}
variable "PROJECT_sleep_arn" {
  type        = string
  description = "PROJECT_sleep_arn"
}
//value comes from main.tf