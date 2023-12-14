//path graph
resource "aws_api_gateway_resource" "graph_resource" {
  rest_api_id = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  parent_id   = aws_api_gateway_resource.subjectId_resource.id
  path_part   = "graph"
}