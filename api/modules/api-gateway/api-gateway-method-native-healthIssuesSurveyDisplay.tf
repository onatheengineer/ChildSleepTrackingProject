//healthIssuesSurveyDisplay
resource "aws_api_gateway_resource" "healthIssuesSurveyDisplay_resource" {
  rest_api_id = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  parent_id   = aws_api_gateway_resource.saveHealthIssueSurveyResponse_resource.id
  path_part   = "display"
  depends_on  = [aws_api_gateway_resource.saveHealthIssueSurveyResponse_resource]
}

resource "aws_api_gateway_request_validator" "healthIssuesSurveyDisplay_validator" {
  name                        = "healthIssuesSurveyDisplayValidator"
  rest_api_id                 = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  validate_request_body       = true
  validate_request_parameters = false
}

resource "aws_lambda_permission" "healthIssuesSurveyDisplay_session_trigger" {
  statement_id  = "${var.localPrefix}-AllowAPIGatewayInvokeHealthIssue"
  action        = "lambda:InvokeFunction"
  function_name = var.PROJECT_healthIssuesSurveyDisplay_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.PROJECT_PROJECT_api.execution_arn}/*"
}

// options method
resource "aws_api_gateway_method" "healthIssuesSurveyDisplay_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id   = aws_api_gateway_resource.healthIssuesSurveyDisplay_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "healthIssuesSurveyDisplay_options_method_response_200" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.healthIssuesSurveyDisplay_resource.id
  http_method     = aws_api_gateway_method.healthIssuesSurveyDisplay_options_method.http_method
  status_code     = "200"
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  depends_on = [aws_api_gateway_method.healthIssuesSurveyDisplay_options_method]
}
resource "aws_api_gateway_integration" "healthIssuesSurveyDisplay_options_integration" {
  rest_api_id       = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id       = aws_api_gateway_resource.healthIssuesSurveyDisplay_resource.id
  http_method       = aws_api_gateway_method.healthIssuesSurveyDisplay_options_method.http_method
  type              = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
  depends_on = [aws_api_gateway_method.healthIssuesSurveyDisplay_options_method]
}

resource "aws_api_gateway_integration_response" "healthIssuesSurveyDisplay_options_integration_response" {
  rest_api_id         = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id         = aws_api_gateway_resource.healthIssuesSurveyDisplay_resource.id
  http_method         = aws_api_gateway_method.healthIssuesSurveyDisplay_options_method.http_method
  status_code         = aws_api_gateway_method_response.healthIssuesSurveyDisplay_options_method_response_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'*'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_method_response.healthIssuesSurveyDisplay_options_method_response_200]
}

// GET method
resource "aws_api_gateway_method" "healthIssuesSurveyDisplay_method" {
  rest_api_id        = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  authorizer_id      = aws_api_gateway_authorizer.api_authorizer.id
  resource_id        = aws_api_gateway_resource.healthIssuesSurveyDisplay_resource.id
  request_parameters = {
    "method.request.querystring.deviceId" = true
  }
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
}

resource "aws_api_gateway_integration" "healthIssuesSurveyDisplay_integration" {
  rest_api_id             = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id             = aws_api_gateway_resource.healthIssuesSurveyDisplay_resource.id
  http_method             = aws_api_gateway_method.healthIssuesSurveyDisplay_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.PROJECT_healthIssuesSurveyDisplay_arn
}

resource "aws_api_gateway_method_response" "healthIssuesSurveyDisplay_method_response_200" {
  rest_api_id         = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id         = aws_api_gateway_resource.healthIssuesSurveyDisplay_resource.id
  http_method         = aws_api_gateway_method.healthIssuesSurveyDisplay_method.http_method
  status_code         = "200"
  #  response_models = {
  #    "application/json" = aws_api_gateway_model.healthIssuesSurveyDisplay_response_schema.name
  #  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "healthIssuesSurveyDisplay_get_method_response_400" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.healthIssuesSurveyDisplay_resource.id
  http_method     = aws_api_gateway_method.healthIssuesSurveyDisplay_method.http_method
  response_models = {
    "application/json" = aws_api_gateway_model.status_and_message_response.name
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  status_code = "400"
}