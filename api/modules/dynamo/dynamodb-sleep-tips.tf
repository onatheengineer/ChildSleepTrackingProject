resource "aws_dynamodb_table" "PROJECT_sleep_tips" {
  name             = "${var.localPrefix}-PROJECT_sleep_tips"
  billing_mode     = "PAY_PER_REQUEST"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
  hash_key         = "sleep_tips"

  attribute {
    name = "sleep_tips"
    type = "S"
  }

  attribute {
    name = "age"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }
  global_secondary_index {
    name            = "age_index"
    hash_key        = "age"
    projection_type = "ALL"
  }
  tags = merge(
    var.localTags,
    tomap({ "Name" = "${var.localPrefix}-dynamodb-sleep_tips" })
  )
}

