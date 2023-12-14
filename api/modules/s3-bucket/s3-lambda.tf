resource "aws_s3_bucket" "PROJECT-api-s3-lambda" {
  bucket = "${var.localPrefix}-s3-lambda"
}