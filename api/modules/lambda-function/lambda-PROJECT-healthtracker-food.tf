data "archive_file" "PROJECT_healthtracker_food_archive" {
  type        = "zip"
  source_dir  = "${path.module}/PROJECT_healthtracker_food/dist"
  output_path = "${path.module}/PROJECT_healthtracker_food/index.zip"
}

#resource "aws_s3_bucket" "PROJECT_healthtracker_food_bucket" {
#  bucket = "${var.localPrefix}-${var.PROJECT_healthtracker_food_s3}"
#}

resource "aws_s3_object" "PROJECT_healthtracker_food_object" {
  bucket = var.s3_lambda.id
  key    = "PROJECT_healthtracker_food.zip"
  source = data.archive_file.PROJECT_healthtracker_food_archive.output_path
  etag   = filemd5(data.archive_file.PROJECT_healthtracker_food_archive.output_path)
}

resource "aws_lambda_function" "PROJECT_healthtracker_food" {
  function_name    = "${var.localPrefix}-${var.PROJECT_healthtracker_food_lambda}"
  s3_bucket        = var.s3_lambda.id
  s3_key           = aws_s3_object.PROJECT_healthtracker_food_object.key
  //  filename         = data.archive_file.lambda_zip_file.output_path
  runtime          = "nodejs18.x"
  handler          = "index.handler"
  timeout          = 3
  source_code_hash = data.archive_file.PROJECT_healthtracker_food_archive.output_base64sha256
  role             = var.iam_lambda
  vpc_config {
    security_group_ids = ["sg-b7812bdf"]
    subnet_ids         = ["subnet-0256282b70e9f78ef", "subnet-083a5845",]
  }
  environment {
    variables = {
      prefix = var.localPrefix
    }
  }
  tags = merge(
    var.localTags,
    tomap({ "Name" = "${var.localPrefix}-PROJECT_healthtracker_food" })
  )
}

resource "aws_cloudwatch_log_group" "PROJECT_healthtracker_food_bucket_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.PROJECT_healthtracker_food.function_name}"
  retention_in_days = 30
}

// Listens for events on the dynamodb table and then invokes a lambda function
#resource "aws_lambda_event_source_mapping" "event_source_mapping_PROJECT_healthtracker_food" {
#  event_source_arn  = var.dynamodb_PROJECT_healthtracker_food_stream_arn
#  function_name     = aws_lambda_function.PROJECT_healthtracker_food.arn
#  starting_position = "LATEST"
#}

