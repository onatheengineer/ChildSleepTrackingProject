#//path survey
#resource "aws_api_gateway_resource" "path_survey_resource" {
#  rest_api_id = aws_api_gateway_rest_api.PROJECT_PROJECT_api.id
#  parent_id   = aws_api_gateway_resource.path_user_resource.id
#  path_part   = "survey"
#}