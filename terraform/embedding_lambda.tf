module "embedding_lambda" {
  source = "./modules/lambda"

  function_name = "${var.project_name}-embedding"
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  filename      = "../lambda/embedding/embedding.zip"
  environment_variables = {
    DYNAMODB_TABLE = aws_dynamodb_table.main.name
  }
  tags = var.tags
}

resource "aws_iam_policy" "embedding_lambda_additional_policy" {
  name        = "${var.project_name}-embedding-lambda-additional-policy"
  description = "Additional policy for the embedding lambda function."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.user_content.arn}/*"
      },
      {
        Action = [
          "dynamodb:PutItem",
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.main.arn
      },
      {
        Action = [
          "bedrock:InvokeModel"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:bedrock:${var.aws_region}::foundation-model/amazon.titan-embed-text-v2:0"
      },
      {
        Action = [
          "s3vectors:PutVectors",
          "s3vectors:QueryVectors"
        ]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.vector_db.arn}/*"
      },
      {
        Action = [
          "dynamodb:UpdateItem"
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.main.arn
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "embedding_lambda_additional_policy_attachment" {
  role       = module.embedding_lambda.lambda_iam_role_name
  policy_arn = aws_iam_policy.embedding_lambda_additional_policy.arn
}

# S3 bucket notification
resource "aws_s3_bucket_notification" "user_content_notification" {
  bucket = aws_s3_bucket.user_content.id

  lambda_function {
    lambda_function_arn = module.embedding_lambda.lambda_function_arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.s3]
}

resource "aws_lambda_permission" "s3" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = module.embedding_lambda.lambda_function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.user_content.arn
}
