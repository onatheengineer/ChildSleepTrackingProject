resource "aws_sqs_queue" "PROJECT_sqs_queue_nightsleepquality" {
  name                      = "${var.localPrefix}-PROJECT-sqs-queue-nightsleepquality"
  fifo_queue                = false
  delay_seconds             = 0
  // max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 0
  #  redrive_policy            = jsonencode({
  #    deadLetterTargetArn = aws_sqs_queue.q.arn
  #    maxReceiveCount     = 4
  #  })
  tags                      = merge(
    var.localTags,
    tomap({ "Name" = "${var.localPrefix}-PROJECT_sqs_queue_nightsleepquality" })
  )
}

resource "aws_sqs_queue" "PROJECT_sqs_queue_deadletter_nightsleepquality" {
  name                 = "${var.localPrefix}-PROJECT-sqs-queue-deadletter-nightsleepquality"
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = [aws_sqs_queue.PROJECT_sqs_queue_nightsleepquality.arn]
  })
  tags = merge(
    var.localTags,
    tomap({ "Name" = "${var.localPrefix}-PROJECT_sqs_queue_deadletter_nightsleepquality" })
  )
}

resource "aws_sqs_queue_redrive_policy" "q" {
  queue_url      = aws_sqs_queue.PROJECT_sqs_queue_nightsleepquality.id
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.PROJECT_sqs_queue_deadletter_nightsleepquality.arn
    maxReceiveCount     = 4
  })
}