data "archive_file" "PROJECT_subject_archive" {
  type        = "zip"
  source_dir  = "${path.module}/PROJECT_subject/dist"
  output_path = "${path.module}/PROJECT_subject/index.zip"
}

#resource "aws_s3_bucket" "PROJECT_subject_lambda_bucket" {
#  bucket = "${var.localPrefix}-${var.PROJECT_subject_s3}"
#}

#resource "aws_s3_bucket_acl" "PROJECT_healthtracker_lambda_bucket_acl" {
#  bucket = aws_s3_bucket.PROJECT_healthtracker_lambda_bucket.id
#  acl = "private"
#}

resource "aws_s3_object" "PROJECT_subject_lambda_object" {
  bucket = var.s3_lambda.id
  key    = "PROJECT_subject.zip"
  source = data.archive_file.PROJECT_subject_archive.output_path
  etag   = filemd5(data.archive_file.PROJECT_subject_archive.output_path)
}

resource "aws_lambda_function" "PROJECT_subject" {
  function_name    = "${var.localPrefix}-${var.PROJECT_subject_lambda}"
  s3_bucket        = var.s3_lambda.id
  s3_key           = aws_s3_object.PROJECT_subject_lambda_object.key
  runtime          = "nodejs18.x"
  handler          = "index.handler"
  timeout          = 3
  source_code_hash = data.archive_file.PROJECT_subject_archive.output_base64sha256
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
    tomap({ "Name" = "${var.localPrefix}-PROJECT_subject" })
  )
}

resource "aws_cloudwatch_log_group" "lambda_subject_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.PROJECT_subject.function_name}"
  retention_in_days = 30
}


