output "NEXT_PUBLIC_API_ENDPOINT" {
  description = "The endpoint of the HTTP API Gateway."
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}
