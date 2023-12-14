resource "aws_api_gateway_rest_api" "PROJECT_PROJECT_api" {
  name        = "${var.localPrefix}-${var.PROJECT_PROJECT_api}"
  description = "${var.localPrefix}-PROJECT PROJECT API"
  tags        = merge(
    var.localTags,
    tomap({ "Name" = "${var.localPrefix}-${var.PROJECT_PROJECT_api}" })
  )
}

resource "aws_api_gateway_authorizer" "api_authorizer" {
  name          = "CognitoUserPoolAuthorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  provider_arns = [var.cognito_user_pools_arn]
}

resource "time_static" "redeployment_at_time_static" {}

resource "aws_api_gateway_deployment" "PROJECT_PROJECT_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  triggers    = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.PROJECT_PROJECT_api.body))
  }
  #    redeployment = sha1(jsonencode([
  #      aws_api_gateway_resource.graph_food_bottle_resource.id,
  #      aws_api_gateway_method.graph_food_bottle_method.id,
  #      aws_api_gateway_integration.graph_food_bottle_integration.id
  #    ]))
  variables = {
    deployed_at = timestamp()
  }
  lifecycle {
    create_before_destroy = true
  }
}

data "aws_api_gateway_domain_name" "PROJECT_api_domain_name" {
  domain_name = var.PROJECT_api_domain_name
}

resource "aws_api_gateway_stage" "PROJECT_PROJECT_api_stage_default" {
  deployment_id = aws_api_gateway_deployment.PROJECT_PROJECT_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  depends_on    = [aws_cloudwatch_log_group.PROJECT_PROJECT_api_stage_default_cloudwatch_log_group]
  stage_name    = "default"
}

resource "aws_api_gateway_base_path_mapping" "test_api_PROJECT_PROJECT_com_base_path_mapping" {
  api_id      = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  stage_name  = aws_api_gateway_stage.PROJECT_PROJECT_api_stage_default.stage_name
  domain_name = data.aws_api_gateway_domain_name.PROJECT_api_domain_name.domain_name
}

resource "aws_cloudwatch_log_group" "PROJECT_PROJECT_api_stage_default_cloudwatch_log_group" {
  name              = "API-Gateway-Execution-Logs_${aws_api_gateway_rest_api.PROJECT_PROJECT_api.id}/${var.stage_name_default}"
  retention_in_days = 7
}

resource "aws_api_gateway_method_settings" "PROJECT_PROJECT_api_method_settings" {
  rest_api_id = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  stage_name  = aws_api_gateway_stage.PROJECT_PROJECT_api_stage_default.stage_name
  method_path = "*/*"
  settings {
    metrics_enabled = true
    logging_level   = "ERROR"
  }
}

resource "aws_api_gateway_gateway_response" "DEFAULT_5XX" {
  rest_api_id        = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  response_type      = "DEFAULT_5XX"
  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }
  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'OPTION,POST,PUT,GET,DELETE'"

  }
}

resource "aws_api_gateway_gateway_response" "DEFAULT_4XX" {
  rest_api_id        = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  response_type      = "DEFAULT_4XX"
  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }
  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'OPTION,POST,PUT,GET,DELETE'"
  }
}

resource "aws_api_gateway_gateway_response" "UNAUTHORIZED" {
  rest_api_id        = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  response_type      = "UNAUTHORIZED"
  status_code        = "401"
  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }
  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'OPTION,POST,PUT,GET,DELETE'"
  }
}

resource "aws_api_gateway_gateway_response" "EXPIRED_TOKEN" {
  rest_api_id        = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  response_type      = "EXPIRED_TOKEN"
  status_code        = "403"
  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }
  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'OPTION,POST,PUT,GET,DELETE'"
  }
}

resource "aws_api_gateway_gateway_response" "BAD_REQUEST_BODY" {
  rest_api_id        = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  response_type      = "BAD_REQUEST_BODY"
  status_code        = "400"
  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }
  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'OPTION,POST,PUT,GET,DELETE'"
  }
}
