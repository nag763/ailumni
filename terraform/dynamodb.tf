resource "aws_dynamodb_table" "main" {
  name           = "${var.project_name}-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_sub"

  attribute {
    name = "user_sub"
    type = "S"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-dynamodb-table"
    }
  )
}

output "dynamodb_table_name" {
  description = "The name of the DynamoDB table."
  value       = aws_dynamodb_table.main.name
}

output "dynamodb_table_arn" {
  description = "The ARN of the DynamoDB table."
  value       = aws_dynamodb_table.main.arn
}
