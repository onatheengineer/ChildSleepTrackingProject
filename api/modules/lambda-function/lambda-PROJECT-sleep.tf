data "archive_file" "PROJECT_sleep_archive" {
  type        = "zip"
  source_dir  = "${path.module}/PROJECT_sleep/dist"
  output_path = "${path.module}/PROJECT_sleep/index.zip"
}

resource "aws_s3_object" "PROJECT_sleep_lambda_object" {
  bucket = var.s3_lambda.id
  key    = "PROJECT_sleep.zip"
  source = data.archive_file.PROJECT_sleep_archive.output_path
  etag   = filemd5(data.archive_file.PROJECT_sleep_archive.output_path)
}

resource "aws_lambda_function" "PROJECT_sleep" {
  function_name    = "${var.localPrefix}-${var.PROJECT_sleep_lambda}"
  s3_bucket        = var.s3_lambda.id
  s3_key           = aws_s3_object.PROJECT_sleep_lambda_object.key
  runtime          = "python3.10"
  timeout          = 3
  handler          = "lambda_handler"
  source_code_hash = data.archive_file.PROJECT_sleep_archive.output_base64sha256
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
    tomap({ "Name" = "${var.localPrefix}-PROJECT_sleep" })
  )
}

resource "aws_cloudwatch_log_group" "lambda_sleep_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.PROJECT_sleep.function_name}"
  retention_in_days = 30
}

