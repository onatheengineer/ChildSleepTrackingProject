resource "aws_dynamodb_table" "PROJECT_healthissue_PROJECTcodes" {
  name             = "${var.localPrefix}-PROJECT_healthissue_PROJECTcodes"
  billing_mode     = "PAY_PER_REQUEST"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
  hash_key         = "PROJECTCodeKey"

  attribute {
    name = "PROJECTCodeKey"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = merge(
    var.localTags,
    tomap({ "Name" = "${var.localPrefix}-dynamodb-PROJECT-healthissue-codes" })
  )
}

resource "aws_dynamodb_table_item" "PROJECTcodekey_aws_dynamodb_table_item" {
  table_name = "${var.localPrefix}-PROJECT_healthissue_PROJECTcodes"
  hash_key   = "PROJECTCodeKey"
  for_each   = local.PROJECTcodes_data
  item       = jsonencode(each.value)
}

locals {
  PROJECTcodes_json = file("./modules/dynamo/data/dynamodb-PROJECTcodes.json")
  PROJECTcodes_data = jsondecode(local.PROJECTcodes_json)
}
