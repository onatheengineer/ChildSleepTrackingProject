data "aws_cognito_user_pools" "user_pool" {
  name = var.user_pool_name
}