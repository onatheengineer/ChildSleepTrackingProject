output "rest_api_id" {
  value = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
}

output "rest_api_root_id" {
  value = aws_api_gateway_rest_api.PROJECT_PROJECT_api.root_resource_id
}

output "rest_api_authorizer_id" {
  value = aws_api_gateway_authorizer.api_authorizer.id
}

output "aws_api_gateway_model_status_response" {
  value = aws_api_gateway_model.status_and_message_response.name
}





