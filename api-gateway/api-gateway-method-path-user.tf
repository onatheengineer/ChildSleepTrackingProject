//path user
resource "aws_api_gateway_resource" "path_user_resource" {
  rest_api_id = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  parent_id   = aws_api_gateway_rest_api.PROJECT_PROJECT_api.root_resource_id
  path_part   = "user"
}