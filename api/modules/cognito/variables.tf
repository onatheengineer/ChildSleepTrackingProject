variable "user_pool_name" {
  type        = string
  description = "The name of the user pool"
  default     = "PROJECT Device Users"
}
variable "user_pool_arn" {
  type        = string
  description = "The name of the user pool"
  default     = "arn:aws:cognitos..."
}