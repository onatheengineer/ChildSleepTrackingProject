data "archive_file" "PROJECT_nightsleepquality_trigger_for_sqs_archive" {
  type        = "zip"
  source_dir  = "${path.module}/PROJECT_nightsleepquality_trigger_for_sqs/dist"
  output_path = "${path.module}/PROJECT_nightsleepquality_trigger_for_sqs/index.zip"
}

resource "aws_s3_bucket" "PROJECT_nightsleepquality_trigger_for_sqs_lambda_bucket" {
  bucket = "${var.localPrefix}-${var.PROJECT_nightsleepquality_trigger_for_sqs_s3}"
}

resource "aws_s3_object" "PROJECT_nightsleepquality_trigger_for_sqs_lambda_object" {
  bucket = aws_s3_bucket.PROJECT_nightsleepquality_trigger_for_sqs_lambda_bucket.id
  key    = "PROJECT_nightsleepquality_trigger_for_sqs.zip"
  source = data.archive_file.PROJECT_nightsleepquality_trigger_for_sqs_archive.output_path
  etag   = filemd5(data.archive_file.PROJECT_nightsleepquality_trigger_for_sqs_archive.output_path)
}

resource "aws_lambda_function" "PROJECT_trigger_nightsleepquality_for_sqs" {
  function_name    = "${var.localPrefix}-${var.PROJECT_nightsleepquality_trigger_for_sqs_lambda}"
  s3_bucket        = aws_s3_bucket.PROJECT_nightsleepquality_trigger_for_sqs_lambda_bucket.id
  s3_key           = aws_s3_object.PROJECT_nightsleepquality_trigger_for_sqs_lambda_object.key
  runtime          = "nodejs18.x"
  handler          = "index.handler"
  timeout          = 3
  source_code_hash = data.archive_file.PROJECT_nightsleepquality_trigger_for_sqs_archive.output_base64sha256
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
    tomap({ "Name" = "${var.localPrefix}-PROJECT_nightsleepquality_trigger_for_sqs" })
  )
}

resource "aws_cloudwatch_log_group" "lambda_PROJECT_nightsleepquality_trigger_for_sqs_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.PROJECT_trigger_nightsleepquality_for_sqs.function_name}"
  retention_in_days = 30
}

