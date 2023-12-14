resource "aws_dynamodb_table" "PROJECT_developmental_tips" {
  name             = "${var.localPrefix}-developmental_tips"
  billing_mode     = "PAY_PER_REQUEST"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
  hash_key         = "developmental_tips"

  attribute {
    name = "developmental_tips"
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
    tomap({ "Name" = "${var.localPrefix}-dynamodb-developmental_tips" })
  )
}

