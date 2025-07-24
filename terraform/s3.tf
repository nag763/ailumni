resource "aws_s3_bucket" "user_content" {
  bucket = var.s3_bucket_name

  tags = var.tags
}

resource "aws_s3_bucket_cors_configuration" "user_content_cors" {
  bucket = aws_s3_bucket.user_content.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"] # You might want to restrict this to your frontend URL in production
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

output "user_content_s3_bucket_name" {
  description = "The name of the S3 bucket for user content."
  value       = aws_s3_bucket.user_content.id
}