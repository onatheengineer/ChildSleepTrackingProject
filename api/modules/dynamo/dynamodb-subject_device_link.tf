#resource "aws_dynamodb_table" "PROJECT_subject_device_link" {
#  name             = "PROJECT_subject_device_link"
#  billing_mode     = "PAY_PER_REQUEST"
#  stream_enabled   = true
#  stream_view_type = "NEW_AND_OLD_IMAGES"
#  hash_key         = "subject_id"
#
#  attribute {
#    name = "subject_id"
#    type = "S"
#  }
#  attribute {
#    name = "deviceId"
#    type = "S"
#  }
#  attribute {
#    name = "dob"
#    type = "S"
#  }
#  attribute {
#    name = "createdAt"
#    type = "S"
#  }
#
#  point_in_time_recovery {
#    enabled = true
#  }
#
#  global_secondary_index {
#    name            = "deviceId_index"
#    hash_key        = "deviceId"
#    projection_type = "ALL"
#  }
#  global_secondary_index {
#    name            = "createdAt_index"
#    hash_key        = "createdAt"
#    projection_type = "ALL"
#  }
#  global_secondary_index {
#    name            = "dob_index"
#    hash_key        = "dob"
#    projection_type = "ALL"
#  }
#
#  tags = merge(
#    var.localTags,
#    tomap({ "Name" = "${var.localPrefix}-subject_device_link" })
#  )
#}