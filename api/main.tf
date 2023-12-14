module "cognito" {
  source = "./modules/cognito"
}
module "lambda_function" {
  source      = "./modules/lambda-function"
  localTags   = local.common_tags
  localPrefix = local.prefix
  instance    = "${terraform.workspace}-instance"
  s3_lambda   = module.s3_bucket.s3_lambda_name
}

module "s3_bucket" {
  source      = "./modules/s3-bucket"
  localTags   = local.common_tags
  localPrefix = local.prefix
}

module "dynamo" {
  source      = "./modules/dynamo"
  localTags   = local.common_tags
  localPrefix = local.prefix
}

module "sqs" {
  source      = "./modules/sqs"
  localTags   = local.common_tags
  localPrefix = local.prefix
}

module "api_gateway" {
  source                                      = "./modules/api-gateway"
  localTags                                   = local.common_tags
  localPrefix                                 = local.prefix
  PROJECT_api_domain_name                    = local.domains[terraform.workspace]
  api_gateway_region                          = var.region
  cognito_user_pools_arn                      = module.cognito.cognito_user_pools_arn
  PROJECT_subject_name                       = module.lambda_function.PROJECT_subject_name
  PROJECT_subject_arn                        = module.lambda_function.PROJECT_subject_arn
  PROJECT_queryContentServer_name            = module.lambda_function.PROJECT_queryContentServer_name
  PROJECT_queryContentServer_arn             = module.lambda_function.PROJECT_queryContentServer_arn
  PROJECT_bugReport_name                     = module.lambda_function.PROJECT_bugReport_name
  PROJECT_bugReport_arn                      = module.lambda_function.PROJECT_bugReport_arn
  PROJECT_respiratory_name                   = module.lambda_function.PROJECT_respiratory_name
  PROJECT_respiratory_arn                    = module.lambda_function.PROJECT_respiratory_arn
  PROJECT_healthtracker_food_name            = module.lambda_function.PROJECT_healthtracker_food_name
  PROJECT_healthtracker_food_arn             = module.lambda_function.PROJECT_healthtracker_food_arn
  PROJECT_healthtracker_diaper_name          = module.lambda_function.PROJECT_healthtracker_diaper_name
  PROJECT_healthtracker_diaper_arn           = module.lambda_function.PROJECT_healthtracker_diaper_arn
  PROJECT_healthtracker_healthissue_name     = module.lambda_function.PROJECT_healthtracker_healthissue_name
  PROJECT_healthtracker_healthissue_arn      = module.lambda_function.PROJECT_healthtracker_healthissue_arn
  PROJECT_healthtracker_temperature_name     = module.lambda_function.PROJECT_healthtracker_temperature_name
  PROJECT_healthtracker_temperature_arn      = module.lambda_function.PROJECT_healthtracker_temperature_arn
  PROJECT_healthtracker_height_name          = module.lambda_function.PROJECT_healthtracker_height_name
  PROJECT_healthtracker_height_arn           = module.lambda_function.PROJECT_healthtracker_height_arn
  PROJECT_healthtracker_weight_name          = module.lambda_function.PROJECT_healthtracker_weight_name
  PROJECT_healthtracker_weight_arn           = module.lambda_function.PROJECT_healthtracker_weight_arn
  PROJECT_dailytracker_name                  = module.lambda_function.PROJECT_dailytracker_name
  PROJECT_dailytracker_arn                   = module.lambda_function.PROJECT_dailytracker_arn
  PROJECT_graph_food_bottle_name             = module.lambda_function.PROJECT_graph_food_bottle_name
  PROJECT_graph_food_bottle_arn              = module.lambda_function.PROJECT_graph_food_bottle_arn
  PROJECT_graph_diaper_name                  = module.lambda_function.PROJECT_graph_diaper_name
  PROJECT_graph_diaper_arn                   = module.lambda_function.PROJECT_graph_diaper_arn
  PROJECT_graph_respiratory_name             = module.lambda_function.PROJECT_graph_respiratory_name
  PROJECT_graph_respiratory_arn              = module.lambda_function.PROJECT_graph_respiratory_arn
  PROJECT_sleep_name                         = module.lambda_function.PROJECT_sleep_name
  PROJECT_sleep_arn                          = module.lambda_function.PROJECT_sleep_arn
  PROJECT_saveHealthIssueSurveyResponse_name = module.lambda_function.PROJECT_saveHealthIssueSurveyResponse_name
  PROJECT_saveHealthIssueSurveyResponse_arn  = module.lambda_function.PROJECT_saveHealthIssueSurveyResponse_arn
  PROJECT_healthIssuesSurveyDisplay_name     = module.lambda_function.PROJECT_healthIssuesSurveyDisplay_name
  PROJECT_healthIssuesSurveyDisplay_arn      = module.lambda_function.PROJECT_healthIssuesSurveyDisplay_arn
  PROJECT_getHealthIssues_name               = module.lambda_function.PROJECT_getHealthIssues_name
  PROJECT_getHealthIssues_arn                = module.lambda_function.PROJECT_getHealthIssues_arn
  healthissue_PROJECTcodes_name                  = module.lambda_function.healthissue_PROJECTcodes_name
  healthissue_PROJECTcodes_arn                   = module.lambda_function.healthissue_PROJECTcodes_arn

  depends_on = [
    module.lambda_function, module.cognito
  ]
}

locals {
  prefix      = "${var.project}-${terraform.workspace}"
  common_tags = {
    Environment = terraform.workspace
    Project     = var.project
    Owner       = var.contact
    ManagedBy : "Terraform"
  }
  domains = {
    default = "test.api.PROJECT.PROJECT.com"
    dev     = "dev.api.PROJECT.PROJECT.com"
    test    = "test.api.PROJECT.PROJECT.com"
    stage   = "stage.api.PROJECT.PROJECT.com"
    prod    = "prod.api.PROJECT.PROJECT.com"
  }
}
