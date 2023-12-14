resource "aws_dynamodb_table" "PROJECT_healthtracker_diaper" {
  name             = "${var.localPrefix}-PROJECT_healthtracker_diaper"
  billing_mode     = "PAY_PER_REQUEST"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
  hash_key         = "diaper_id"

  attribute {
    name = "diaper_id"
    type = "S"
  }
  attribute {
    name = "createdAt"
    type = "S"
  }
  attribute {
    name = "subject_id"
    type = "S"
  }
  attribute {
    name = "category"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  global_secondary_index {
    name            = "category_index"
    hash_key        = "category"
    projection_type = "ALL"
  }
  global_secondary_index {
    name            = "subject_id_createdAt_index"
    hash_key        = "subject_id"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  tags = merge(
    var.localTags,
    tomap({ "Name" = "${var.localPrefix}-dynamodb-diaper" })
  )
}