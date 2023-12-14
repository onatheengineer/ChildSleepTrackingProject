resource "aws_api_gateway_resource" "healthtracker_temperature_resource" {
  rest_api_id = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  parent_id   = aws_api_gateway_resource.healthtracker_resource.id
  path_part   = "temperature"
}

resource "aws_api_gateway_request_validator" "healthtracker_temperature_validator" {
  name                        = "TemperatureModelValidatorMutation"
  rest_api_id                 = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  validate_request_body       = true
  validate_request_parameters = false
}

resource "aws_lambda_permission" "healthtracker_temperature_session_trigger" {
  statement_id  = "AllowAPIGatewayInvokeFood"
  action        = "lambda:InvokeFunction"
  function_name = var.PROJECT_healthtracker_temperature_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.PROJECT_PROJECT_api.execution_arn}/*"
}

// options method
resource "aws_api_gateway_method" "healthtracker_temperature_options_method" {
  rest_api_id   = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id   = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "healthtracker_temperature_options_method_response_200" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method     = aws_api_gateway_method.healthtracker_temperature_options_method.http_method
  status_code     = "200"
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  depends_on = [aws_api_gateway_method.healthtracker_temperature_options_method]
}
resource "aws_api_gateway_integration" "healthtracker_temperature_options_integration" {
  rest_api_id       = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id       = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method       = aws_api_gateway_method.healthtracker_temperature_options_method.http_method
  type              = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
  depends_on = [aws_api_gateway_method.healthtracker_temperature_options_method]
}

resource "aws_api_gateway_integration_response" "healthtracker_temperature_options_integration_response" {
  rest_api_id         = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id         = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method         = aws_api_gateway_method.healthtracker_temperature_options_method.http_method
  status_code         = aws_api_gateway_method_response.healthtracker_temperature_options_method_response_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'*'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_method_response.healthtracker_temperature_options_method_response_200]
}

// POST Method
resource "aws_api_gateway_method" "healthtracker_temperature_post_method" {
  rest_api_id          = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  authorizer_id        = aws_api_gateway_authorizer.api_authorizer.id
  resource_id          = aws_api_gateway_resource.healthtracker_temperature_resource.id
  request_validator_id = aws_api_gateway_request_validator.healthtracker_temperature_validator.id
  request_models       = {
    "application/json" = aws_api_gateway_model.temperature_event_schema_post.name
  }
  http_method        = "POST"
  authorization      = "COGNITO_USER_POOLS"
  request_parameters = {
    "method.request.path.subject" = true
  }
}

resource "aws_api_gateway_integration" "healthtracker_temperature_post_integration" {
  rest_api_id             = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id             = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method             = aws_api_gateway_method.healthtracker_temperature_post_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.PROJECT_healthtracker_temperature_arn
}

resource "aws_api_gateway_method_response" "healthtracker_temperature_post_method_response_201" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method     = aws_api_gateway_method.healthtracker_temperature_post_method.http_method
  response_models = {
    "application/json" = aws_api_gateway_model.temperature_event_schema_post.name
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  status_code = "201"
}

resource "aws_api_gateway_method_response" "healthtracker_temperature_post_method_response_400" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method     = aws_api_gateway_method.healthtracker_temperature_post_method.http_method
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

// PUT Method
resource "aws_api_gateway_method" "healthtracker_temperature_put_method" {
  rest_api_id          = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  authorizer_id        = aws_api_gateway_authorizer.api_authorizer.id
  resource_id          = aws_api_gateway_resource.healthtracker_temperature_resource.id
  request_validator_id = aws_api_gateway_request_validator.healthtracker_temperature_validator.id
  request_models       = {
    "application/json" = aws_api_gateway_model.temperature_event_schema_put.name
  }
  http_method        = "PUT"
  authorization      = "COGNITO_USER_POOLS"
  request_parameters = {
    "method.request.path.subject" = true
  }
}

resource "aws_api_gateway_integration" "healthtracker_temperature_put_integration" {
  rest_api_id             = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id             = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method             = aws_api_gateway_method.healthtracker_temperature_put_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.PROJECT_healthtracker_temperature_arn
}

resource "aws_api_gateway_method_response" "healthtracker_temperature_put_method_response_201" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method     = aws_api_gateway_method.healthtracker_temperature_put_method.http_method
  response_models = {
    "application/json" = aws_api_gateway_model.temperature_event_schema_put.name
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  status_code = "201"
}

resource "aws_api_gateway_method_response" "healthtracker_temperature_put_method_response_400" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method     = aws_api_gateway_method.healthtracker_temperature_put_method.http_method
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

// DELETE Method
resource "aws_api_gateway_method" "healthtracker_temperature_delete_method" {
  rest_api_id          = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  authorizer_id        = aws_api_gateway_authorizer.api_authorizer.id
  resource_id          = aws_api_gateway_resource.healthtracker_temperature_resource.id
  request_validator_id = aws_api_gateway_request_validator.healthtracker_temperature_validator.id
  http_method          = "DELETE"
  authorization        = "COGNITO_USER_POOLS"
  request_parameters   = {
    "method.request.path.subject"               = true
    "method.request.querystring.temperature_id" = true
  }
}

resource "aws_api_gateway_integration" "healthtracker_temperature_delete_integration" {
  rest_api_id             = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id             = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method             = aws_api_gateway_method.healthtracker_temperature_delete_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.PROJECT_healthtracker_temperature_arn
}

resource "aws_api_gateway_method_response" "healthtracker_temperature_delete_method_response_200" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method     = aws_api_gateway_method.healthtracker_temperature_delete_method.http_method
  response_models = {
    "application/json" = aws_api_gateway_model.response_schema_temperature.name
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  status_code = "200"
}

resource "aws_api_gateway_method_response" "healthtracker_temperature_delete_method_response_400" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method     = aws_api_gateway_method.healthtracker_temperature_delete_method.http_method
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

// GET Method
resource "aws_api_gateway_method" "healthtracker_temperature_get_method" {
  rest_api_id        = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  authorizer_id      = aws_api_gateway_authorizer.api_authorizer.id
  resource_id        = aws_api_gateway_resource.healthtracker_temperature_resource.id
  request_parameters = {
    "method.request.querystring.temperature_id" = true
    "method.request.path.subject"               = true
  }
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
}

resource "aws_api_gateway_integration" "healthtracker_temperature_get_integration" {
  rest_api_id             = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id             = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method             = aws_api_gateway_method.healthtracker_temperature_get_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.PROJECT_healthtracker_temperature_arn
}

resource "aws_api_gateway_method_response" "healthtracker_temperature_get_method_response_200" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method     = aws_api_gateway_method.healthtracker_temperature_get_method.http_method
  response_models = {
    "application/json" = aws_api_gateway_model.response_schema_temperature.name
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
  status_code = "200"
}

resource "aws_api_gateway_method_response" "healthtracker_temperature_get_method_response_400" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.healthtracker_temperature_resource.id
  http_method     = aws_api_gateway_method.healthtracker_temperature_get_method.http_method
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
