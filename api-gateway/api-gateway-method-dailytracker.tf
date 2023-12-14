// dailytracker
resource "aws_api_gateway_resource" "dailytracker_resource" {
  rest_api_id = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  parent_id   = aws_api_gateway_resource.subjectId_resource.id
  path_part   = "dailytracker"
}

// options method
resource "aws_api_gateway_method" "dailytracker_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id   = aws_api_gateway_resource.dailytracker_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "dailytracker_options_method_response_200" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.dailytracker_resource.id
  http_method     = aws_api_gateway_method.dailytracker_options_method.http_method
  status_code     = "200"
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  depends_on = [aws_api_gateway_method.dailytracker_options_method]
}
resource "aws_api_gateway_integration" "dailytracker_options_integration" {
  rest_api_id       = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id       = aws_api_gateway_resource.dailytracker_resource.id
  http_method       = aws_api_gateway_method.dailytracker_options_method.http_method
  type              = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
  depends_on = [aws_api_gateway_method.dailytracker_options_method]
}

resource "aws_api_gateway_integration_response" "dailytracker_options_integration_response" {
  rest_api_id         = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id         = aws_api_gateway_resource.dailytracker_resource.id
  http_method         = aws_api_gateway_method.dailytracker_options_method.http_method
  status_code         = aws_api_gateway_method_response.dailytracker_options_method_response_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'*'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_method_response.dailytracker_options_method_response_200]
}

// GET method
resource "aws_api_gateway_method" "dailytracker_get_method" {
  rest_api_id        = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  authorizer_id      = aws_api_gateway_authorizer.api_authorizer.id
  resource_id        = aws_api_gateway_resource.dailytracker_resource.id
  request_parameters = {
    "method.request.querystring.refDate"   = true
    "method.request.querystring.startDate" = true
    "method.request.path.subject"          = true
  }
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
}
resource "aws_api_gateway_request_validator" "dailytracker_validator" {
  name                        = "dailytrackerModelValidator"
  rest_api_id                 = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  validate_request_parameters = false
}
resource "aws_lambda_permission" "dailytracker_session_trigger" {
  statement_id  = "${var.localPrefix}-AllowAPIGatewayInvokeDailytracker"
  action        = "lambda:InvokeFunction"
  function_name = var.PROJECT_dailytracker_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.PROJECT_PROJECT_api.execution_arn}/*"
}
resource "aws_api_gateway_integration" "dailytracker_get_integration" {
  rest_api_id             = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id             = aws_api_gateway_resource.dailytracker_resource.id
  http_method             = aws_api_gateway_method.dailytracker_get_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.PROJECT_dailytracker_arn
  request_parameters      = {
    "integration.request.path.id" = "method.request.path.subject"
  }
}

resource "aws_api_gateway_method_response" "dailytracker_method_response_200" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.dailytracker_resource.id
  http_method     = aws_api_gateway_method.dailytracker_get_method.http_method
  response_models = {
    "application/json" = aws_api_gateway_model.response_schema_dailytracker.name
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  status_code = "200"
}

resource "aws_api_gateway_method_response" "dailytracker_get_method_response_400" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.dailytracker_resource.id
  http_method     = aws_api_gateway_method.dailytracker_get_method.http_method
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