module "agent_lambda" {
  source = "./modules/lambda"

  function_name = "${var.project_name}-agent"
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.13"
  filename      = "../lambda/agent/agent.zip"
  environment_variables = {
    CORS_ALLOW_ORIGIN = "*"
  }
  tags = var.tags
}

resource "aws_apigatewayv2_integration" "agent" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = module.agent_lambda.lambda_function_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "agent" {
  api_id             = aws_apigatewayv2_api.http_api.id
  route_key          = "POST /api/v1/agent"
  target             = "integrations/${aws_apigatewayv2_integration.agent.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_lambda_permission" "agent_api_gateway" {
  statement_id  = "AllowAPIGatewayInvokeAgent"
  action        = "lambda:InvokeFunction"
  function_name = module.agent_lambda.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

resource "aws_iam_policy" "agent_lambda_additional_policy" {
  name        = "${var.project_name}-agent-lambda-additional-policy"
  description = "Additional policy for the agent lambda function."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "bedrock:InvokeModel"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:bedrock:eu-central-1::foundation-model/*"
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "agent_lambda_additional_policy_attachment" {
  role       = module.agent_lambda.lambda_iam_role_name
  policy_arn = aws_iam_policy.agent_lambda_additional_policy.arn
}

