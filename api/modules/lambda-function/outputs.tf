// subject
output "PROJECT_subject_name" {
  value = aws_lambda_function.PROJECT_subject.function_name
}

output "PROJECT_subject_arn" {
  value = aws_lambda_function.PROJECT_subject.invoke_arn
}

// queryContentServer
output "PROJECT_queryContentServer_name" {
  value = data.aws_lambda_function.PROJECT_queryContentServer.function_name
}
output "PROJECT_queryContentServer_arn" {
  value = data.aws_lambda_function.PROJECT_queryContentServer.invoke_arn
}


// bugreport
output "PROJECT_bugReport_name" {
  value = data.aws_lambda_function.PROJECT_bugReport.function_name
}

output "PROJECT_bugReport_arn" {
  value = data.aws_lambda_function.PROJECT_bugReport.invoke_arn
}

// healthtracker food
output "PROJECT_healthtracker_food_name" {
  value = aws_lambda_function.PROJECT_healthtracker_food.function_name
}

output "PROJECT_healthtracker_food_arn" {
  value = aws_lambda_function.PROJECT_healthtracker_food.invoke_arn
}

// healthtracker diaper
output "PROJECT_healthtracker_diaper_name" {
  value = aws_lambda_function.PROJECT_healthtracker_diaper.function_name
}

output "PROJECT_healthtracker_diaper_arn" {
  value = aws_lambda_function.PROJECT_healthtracker_diaper.invoke_arn
}

// healthtracker healthissue
output "PROJECT_healthtracker_healthissue_name" {
  value = aws_lambda_function.PROJECT_healthtracker_healthissue.function_name
}

output "PROJECT_healthtracker_healthissue_arn" {
  value = aws_lambda_function.PROJECT_healthtracker_healthissue.invoke_arn
}

// healthtracker temperature
output "PROJECT_healthtracker_temperature_name" {
  value = aws_lambda_function.PROJECT_healthtracker_temperature.function_name
}

output "PROJECT_healthtracker_temperature_arn" {
  value = aws_lambda_function.PROJECT_healthtracker_temperature.invoke_arn
}
// healthtracker height
output "PROJECT_healthtracker_height_name" {
  value = aws_lambda_function.PROJECT_healthtracker_height.function_name
}

output "PROJECT_healthtracker_height_arn" {
  value = aws_lambda_function.PROJECT_healthtracker_height.invoke_arn
}
// healthtracker weight
output "PROJECT_healthtracker_weight_name" {
  value = aws_lambda_function.PROJECT_healthtracker_weight.function_name
}

output "PROJECT_healthtracker_weight_arn" {
  value = aws_lambda_function.PROJECT_healthtracker_weight.invoke_arn
}

// respiratory
output "PROJECT_respiratory_name" {
  value = aws_lambda_function.PROJECT_respiratory.function_name
}

output "PROJECT_respiratory_arn" {
  value = aws_lambda_function.PROJECT_respiratory.invoke_arn
}

// dailytracker
output "PROJECT_dailytracker_name" {
  value = aws_lambda_function.PROJECT_dailytracker.function_name
}

output "PROJECT_dailytracker_arn" {
  value = aws_lambda_function.PROJECT_dailytracker.invoke_arn
}

// health issue display
output "PROJECT_healthIssuesSurveyDisplay_name" {
  value = data.aws_lambda_function.PROJECT_healthIssuesSurveyDisplay.function_name
}

output "PROJECT_healthIssuesSurveyDisplay_arn" {
  value = data.aws_lambda_function.PROJECT_healthIssuesSurveyDisplay.invoke_arn
}

// health issue response
output "PROJECT_saveHealthIssueSurveyResponse_name" {
  value = data.aws_lambda_function.PROJECT_saveHealthIssueSurveyResponse.function_name
}

output "PROJECT_saveHealthIssueSurveyResponse_arn" {
  value = data.aws_lambda_function.PROJECT_saveHealthIssueSurveyResponse.invoke_arn
}

// PROJECT Native health issue codes
output "PROJECT_getHealthIssues_name" {
  value = data.aws_lambda_function.PROJECT_getHealthIssues.function_name
}

output "PROJECT_getHealthIssues_arn" {
  value = data.aws_lambda_function.PROJECT_getHealthIssues.invoke_arn
}

// healthissue_PROJECTcodes
output "healthissue_PROJECTcodes_name" {
  value = aws_lambda_function.healthissue_PROJECTcodes.function_name
}

output "healthissue_PROJECTcodes_arn" {
  value = aws_lambda_function.healthissue_PROJECTcodes.invoke_arn
}

// graph_food_bottle
output "PROJECT_graph_food_bottle_name" {
  value = aws_lambda_function.PROJECT_graph_food_bottle.function_name
}

output "PROJECT_graph_food_bottle_arn" {
  value = aws_lambda_function.PROJECT_graph_food_bottle.invoke_arn
}

// graph_diaper
output "PROJECT_graph_diaper_name" {
  value = aws_lambda_function.PROJECT_graph_diaper.function_name
}

output "PROJECT_graph_diaper_arn" {
  value = aws_lambda_function.PROJECT_graph_diaper.invoke_arn
}

// graph_respiratory
output "PROJECT_graph_respiratory_name" {
  value = aws_lambda_function.PROJECT_graph_respiratory.function_name
}

output "PROJECT_graph_respiratory_arn" {
  value = aws_lambda_function.PROJECT_graph_respiratory.invoke_arn
}

// graph_respiratory
output "PROJECT_sleep_name" {
  value = aws_lambda_function.PROJECT_sleep.function_name
}

output "PROJECT_sleep_arn" {
  value = aws_lambda_function.PROJECT_sleep.invoke_arn
}
