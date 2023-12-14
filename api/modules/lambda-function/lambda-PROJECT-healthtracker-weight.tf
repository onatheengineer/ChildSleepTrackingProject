data "archive_file" "PROJECT_healthtracker_weight_archive" {
  type        = "zip"
  source_dir  = "${path.module}/PROJECT_healthtracker_weight/dist"
  output_path = "${path.module}/PROJECT_healthtracker_weight/index.zip"
}

#resource "aws_s3_bucket" "PROJECT_healthtracker_weight_bucket" {
#  bucket = "${var.localPrefix}-${var.PROJECT_healthtracker_weight_s3}"
#}

resource "aws_s3_object" "PROJECT_healthtracker_weight_object" {
  bucket = var.s3_lambda.id
  key    = "PROJECT_healthtracker_weight.zip"
  source = data.archive_file.PROJECT_healthtracker_weight_archive.output_path
  etag   = filemd5(data.archive_file.PROJECT_healthtracker_weight_archive.output_path)
}

resource "aws_lambda_function" "PROJECT_healthtracker_weight" {
  function_name    = "${var.localPrefix}-${var.PROJECT_healthtracker_weight_lambda}"
  s3_bucket        = var.s3_lambda.id
  s3_key           = aws_s3_object.PROJECT_healthtracker_weight_object.key
  //  filename         = data.archive_file.lambda_zip_file.output_path
  runtime          = "nodejs18.x"
  handler          = "index.handler"
  timeout          = 3
  source_code_hash = data.archive_file.PROJECT_healthtracker_weight_archive.output_base64sha256
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
    tomap({ "Name" = "${var.localPrefix}-PROJECT_healthtracker_weight" })
  )
}

resource "aws_cloudwatch_log_group" "PROJECT_healthtracker_weight_bucket_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.PROJECT_healthtracker_weight.function_name}"
  retention_in_days = 30
}

