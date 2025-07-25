module "api_lambda" {
  source = "./modules/lambda"

  function_name = "${var.project_name}-api"
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  filename      = "../lambda/entries/entries.zip"
  environment_variables = {
    DYNAMODB_TABLE = aws_dynamodb_table.main.name
    S3_BUCKET_NAME = aws_s3_bucket.user_content.id
  }
  tags = var.tags
}

resource "aws_iam_policy" "api_lambda_additional_policy" {
  name        = "${var.project_name}-api-lambda-additional-policy"
  description = "Additional policy for the API lambda function."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.user_content.arn}/*"
      },
      {
        Action = [
          "s3:ListBucket"
        ]
        Effect   = "Allow"
        Resource = aws_s3_bucket.user_content.arn
      },
      {
        Action = [
          "dynamodb:Query",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:GetItem"
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.main.arn
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "api_lambda_additional_policy_attachment" {
  role       = module.api_lambda.lambda_iam_role_name
  policy_arn = aws_iam_policy.api_lambda_additional_policy.arn
}
