// respiratory
resource "aws_api_gateway_resource" "respiratory_resource" {
  rest_api_id = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  parent_id   = aws_api_gateway_resource.subjectId_resource.id
  path_part   = "respiratory"
}

// options method
resource "aws_api_gateway_method" "respiratory_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id   = aws_api_gateway_resource.respiratory_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "respiratory_options_method_response_200" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.respiratory_resource.id
  http_method     = aws_api_gateway_method.respiratory_options_method.http_method
  status_code     = "200"
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  depends_on = [aws_api_gateway_method.respiratory_options_method]
}
resource "aws_api_gateway_integration" "respiratory_options_integration" {
  rest_api_id       = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id       = aws_api_gateway_resource.respiratory_resource.id
  http_method       = aws_api_gateway_method.respiratory_options_method.http_method
  type              = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
  depends_on = [aws_api_gateway_method.respiratory_options_method]
}

resource "aws_api_gateway_integration_response" "respiratory_options_integration_response" {
  rest_api_id         = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id         = aws_api_gateway_resource.respiratory_resource.id
  http_method         = aws_api_gateway_method.respiratory_options_method.http_method
  status_code         = aws_api_gateway_method_response.respiratory_options_method_response_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'*'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_method_response.respiratory_options_method_response_200]
}

// GET method
resource "aws_api_gateway_method" "respiratory_method" {
  rest_api_id        = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  authorizer_id      = aws_api_gateway_authorizer.api_authorizer.id
  resource_id        = aws_api_gateway_resource.respiratory_resource.id
  request_parameters = {
    "method.request.querystring.refDate" = true
    "method.request.path.subject"        = true
  }
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
}
resource "aws_lambda_permission" "respiratory_session_trigger" {
  statement_id  = "AllowAPIGatewayInvokeRespiratory"
  action        = "lambda:InvokeFunction"
  function_name = var.PROJECT_respiratory_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.PROJECT_PROJECT_api.execution_arn}/*"
}
resource "aws_api_gateway_integration" "respiratory_integration" {
  rest_api_id        = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id        = aws_api_gateway_resource.respiratory_resource.id
  http_method        = aws_api_gateway_method.respiratory_method.http_method
  request_parameters = {
    "integration.request.path.id" = "method.request.path.subject"
  }
  integration_http_method = "POST"
  uri                     = var.PROJECT_respiratory_arn
  type                    = "AWS_PROXY"
}

resource "aws_api_gateway_method_response" "PROJECT_PROJECT_api_respiratory_method_response_200" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.respiratory_resource.id
  http_method     = aws_api_gateway_method.respiratory_method.http_method
  response_models = {
    "application/json" = aws_api_gateway_model.response_schema_respiratory.name
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  status_code = "200"
}


resource "aws_api_gateway_method_response" "respiratory_get_method_response_400" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.respiratory_resource.id
  http_method     = aws_api_gateway_method.respiratory_method.http_method
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