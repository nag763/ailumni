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
  role       = module.embedding_lambda.lambda_iam_role_name
  policy_arn = aws_iam_policy.vector_db_policy.arn
}


# S3 bucket for vector db
resource "aws_s3_bucket" "vector_db" {
  bucket = "${var.project_name}-vector-db"


  force_destroy = true

  tags = var.tags
}
