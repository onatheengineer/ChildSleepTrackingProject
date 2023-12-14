data "archive_file" "PROJECT_healthtracker_diaper_archive" {
  type        = "zip"
  source_dir  = "${path.module}/PROJECT_healthtracker_diaper/dist"
  output_path = "${path.module}/PROJECT_healthtracker_diaper/index.zip"
}

#resource "aws_s3_bucket" "PROJECT_healthtracker_diaper_bucket" {
#  bucket = "${var.localPrefix}-${var.PROJECT_healthtracker_diaper_s3}"
#}

resource "aws_s3_object" "PROJECT_healthtracker_diaper_object" {
  bucket = var.s3_lambda.id
  key    = "PROJECT_healthtracker_diaper.zip"
  source = data.archive_file.PROJECT_healthtracker_diaper_archive.output_path
  etag   = filemd5(data.archive_file.PROJECT_healthtracker_diaper_archive.output_path)
}

resource "aws_lambda_function" "PROJECT_healthtracker_diaper" {
  function_name    = "${var.localPrefix}-${var.PROJECT_healthtracker_diaper_lambda}"
  s3_bucket        = var.s3_lambda.id
  s3_key           = aws_s3_object.PROJECT_healthtracker_diaper_object.key
  runtime          = "nodejs18.x"
  handler          = "index.handler"
  timeout          = 3
  source_code_hash = data.archive_file.PROJECT_healthtracker_diaper_archive.output_base64sha256
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
    tomap({ "Name" = "${var.localPrefix}-${var.PROJECT_healthtracker_diaper_lambda}" })
  )
}

resource "aws_cloudwatch_log_group" "PROJECT_healthtracker_diaper_bucket_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.PROJECT_healthtracker_diaper.function_name}"
  retention_in_days = 30
}