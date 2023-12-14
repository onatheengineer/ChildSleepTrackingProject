output "cognito_user_pools_id" {
  value = data.aws_cognito_user_pools.user_pool.id
}
output "cognito_user_pools_arn" {
  value = var.user_pool_arn
}
