output "lambda_function_arn" {
  description = "The ARN of the Lambda function."
  value       = aws_lambda_function.this.arn
}

output "lambda_function_invoke_arn" {
  description = "The ARN to be used for invoking the Lambda function."
  value       = aws_lambda_function.this.invoke_arn
}

output "lambda_iam_role_arn" {
  description = "The ARN of the IAM role used by the Lambda function."
  value       = aws_iam_role.lambda_exec.arn
}
