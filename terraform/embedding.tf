# IAM role and policy for the embedding lambda function
resource "aws_iam_role" "embedding_lambda_exec_role" {
  name = "${var.project_name}-embedding-lambda-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_policy" "embedding_lambda_exec_policy" {
  name        = "${var.project_name}-embedding-lambda-exec-policy"
  description = "Policy for the embedding lambda function."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject"
        ]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.user_content.arn}/*"
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
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
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

resource "aws_iam_role_policy_attachment" "embedding_lambda_exec_policy" {
  role       = aws_iam_role.embedding_lambda_exec_role.name
  policy_arn = aws_iam_policy.embedding_lambda_exec_policy.arn
}

# Lambda function
resource "aws_lambda_function" "embedding" {
  function_name    = "${var.project_name}-embedding"
  role             = aws_iam_role.embedding_lambda_exec_role.arn
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.13"
  filename         = "../lambda/embedding/embedding.zip"
  source_code_hash = filebase64sha256("../lambda/embedding/embedding.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.main.name
    }
  }

  tags = var.tags
}

# S3 bucket notification
resource "aws_s3_bucket_notification" "user_content_notification" {
  bucket = aws_s3_bucket.user_content.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.embedding.arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.s3]
}

resource "aws_lambda_permission" "s3" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.embedding.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.user_content.arn
}


resource "aws_iam_policy" "vector_db_policy" {
  name        = "${var.project_name}-vector-db-policy"
  description = "Policy for the vector database S3 bucket."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3vectors:PutVectors"
        ],
        Effect = "Allow"
        # This part is intentionally left generic as terraform does not support S3 Vectors ARN atm.
        Resource = "arn:aws:s3vectors:eu-central-1:*:bucket/ailumni*"
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_embedding_exec_policy" {
  role       = aws_iam_role.embedding_lambda_exec_role.name
  policy_arn = aws_iam_policy.vector_db_policy.arn
}


# S3 bucket for vector db
resource "aws_s3_bucket" "vector_db" {
  bucket = "${var.project_name}-vector-db"

  tags = var.tags
}
