resource "aws_dynamodb_table" "chunks" {
  name         = "${var.project_name}-chunks-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "item_id"
  range_key    = "chunk_key"

  attribute {
    name = "item_id"
    type = "S"
  }

  attribute {
    name = "chunk_key"
    type = "S"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-dynamodb-chunks-table"
    }
  )
}

output "chunks_dynamodb_table_name" {
  description = "The name of the DynamoDB table for chunks."
  value       = aws_dynamodb_table.chunks.name
}

output "chunks_dynamodb_table_arn" {
  description = "The ARN of the DynamoDB table for chunks."
  value       = aws_dynamodb_table.chunks.arn
}
