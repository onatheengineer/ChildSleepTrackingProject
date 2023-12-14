// subjectId
resource "aws_api_gateway_resource" "subjectId_resource" {
  rest_api_id = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
  parent_id   = aws_api_gateway_resource.subject_resource.id
  path_part   = "{subject}"
}
