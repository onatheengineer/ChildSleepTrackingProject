output "dynamodb_PROJECT_healthtracker_food_arn" {
  value       = aws_dynamodb_table.PROJECT_healthtracker_food.arn
  description = "The ARN of the DynamoDB food table"
}

output "dynamodb_PROJECT_healthtracker_food_stream_arn" {
  value       = aws_dynamodb_table.PROJECT_healthtracker_food.stream_arn
  description = "The ARN of the DynamoDB food table"
}

