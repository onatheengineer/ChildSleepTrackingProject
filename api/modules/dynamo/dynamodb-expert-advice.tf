resource "aws_dynamodb_table" "PROJECT_expert_advice" {
  name             = "${var.localPrefix}-PROJECT_expert_advice"
  billing_mode     = "PAY_PER_REQUEST"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
  hash_key         = "expert_advice"

  attribute {
    name = "expert_advice"
    type = "S"
  }
  attribute {
    name = "illness"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }
  global_secondary_index {
    name            = "illness_index"
    hash_key        = "illness"
    projection_type = "ALL"
  }
  tags = merge(
    var.localTags,
    tomap({ "Name" = "${var.localPrefix}-dynamodb-expert-advice" })
  )
}

