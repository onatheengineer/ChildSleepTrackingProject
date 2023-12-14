//POST mutation bugreport
resource "aws_api_gateway_resource" "bugreport_resource" {
  rest_api_id = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  parent_id   = aws_api_gateway_resource.subjectId_resource.id
  path_part   = "bugreport"
}

resource "aws_api_gateway_method" "bugreport_method" {
  rest_api_id        = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  authorizer_id      = aws_api_gateway_authorizer.api_authorizer.id
  resource_id        = aws_api_gateway_resource.bugreport_resource.id
  http_method        = "POST"
  authorization      = "COGNITO_USER_POOLS"
  request_parameters = {
    "method.request.path.subject" = true
  }
}

resource "aws_api_gateway_integration" "bugreport_integration" {
  rest_api_id        = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id        = aws_api_gateway_resource.bugreport_resource.id
  http_method        = aws_api_gateway_method.bugreport_method.http_method
  request_parameters = {
    "integration.request.path.id" = "method.request.path.subject"
  }
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.PROJECT_bugReport_arn
}

resource "aws_api_gateway_method_response" "bugreport_method_response_200" {
  rest_api_id         = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id         = aws_api_gateway_resource.bugreport_resource.id
  http_method         = aws_api_gateway_method.bugreport_method.http_method
  status_code         = "200"
  #  response_models = {
  #    "application/json" = aws_api_gateway_model.bugreport_response_schema.name
  #  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "bugreport_get_method_response_400" {
  rest_api_id     = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  resource_id     = aws_api_gateway_resource.bugreport_resource.id
  http_method     = aws_api_gateway_method.bugreport_method.http_method
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