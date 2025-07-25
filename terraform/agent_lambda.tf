# IAM role and policy for the agent lambda function
resource "aws_iam_role" "agent_lambda_exec_role" {
  name = "${var.project_name}-agent-lambda-exec-role"

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

resource "aws_iam_policy" "agent_lambda_exec_policy" {
  name        = "${var.project_name}-agent-lambda-exec-policy"
  description = "Policy for the agent lambda function."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
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
          "bedrock:InvokeModel"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:bedrock:eu-central-1::foundation-model/*"
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "agent_lambda_exec_policy" {
  role       = aws_iam_role.agent_lambda_exec_role.name
  policy_arn = aws_iam_policy.agent_lambda_exec_policy.arn
}

# Agent Lambda function
resource "aws_lambda_function" "agent" {
  function_name    = "${var.project_name}-agent"
  role             = aws_iam_role.agent_lambda_exec_role.arn
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.13"
  filename         = "../lambda/agent/agent.zip"
  source_code_hash = filebase64sha256("../lambda/agent/agent.zip")

  environment {
    variables = {
      CORS_ALLOW_ORIGIN = "*"
    }
  }

  tags = var.tags
}

resource "aws_apigatewayv2_integration" "agent" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.agent.invoke_arn
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
  function_name = aws_lambda_function.agent.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}
