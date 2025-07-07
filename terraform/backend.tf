# IAM role and policy for the lambda function
resource "aws_iam_role" "lambda_exec_role" {
  name = "${var.project_name}-lambda-exec-role"

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

resource "aws_iam_policy" "lambda_exec_policy" {
  name        = "${var.project_name}-lambda-exec-policy"
  description = "Policy for the retrieve-user lambda function."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:Query",
          "dynamodb:PutItem"
        ]
        Effect   = "Allow"
        Resource = aws_dynamodb_table.main.arn
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_exec_policy" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_exec_policy.arn
}

# Lambda function
resource "aws_lambda_function" "retrieve_user" {
  function_name = "${var.project_name}-retrieve-user"
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  filename      = "../lambda/retrieve-user/retrieve-user.zip"
  source_code_hash = filebase64sha256("../lambda/retrieve-user/retrieve-user.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.main.name
    }
  }

  tags = var.tags
}

resource "aws_lambda_function" "create_entry" {
  function_name = "${var.project_name}-create-entry"
  role          = aws_iam_role.lambda_exec_role.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  filename      = "../lambda/create-entry/create-entry.zip"
  source_code_hash = filebase64sha256("../lambda/create-entry/create-entry.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.main.name
    }
  }

  tags = var.tags
}

# API Gateway
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project_name}-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["*"]
  }
  
  tags = var.tags
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true

  tags = var.tags
}

resource "aws_apigatewayv2_integration" "retrieve_user" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.retrieve_user.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "create_entry" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.create_entry.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_user" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /api/v1/user/entries"
  target    = "integrations/${aws_apigatewayv2_integration.retrieve_user.id}"
  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "create_entry" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /api/v1/user/entries"
  target    = "integrations/${aws_apigatewayv2_integration.create_entry.id}"
  authorization_type = "JWT"
  authorizer_id = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.http_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-authorizer"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.main.id]
    issuer   = "https://${aws_cognito_user_pool.main.endpoint}"
  }
}

resource "aws_lambda_permission" "api_gateway_retrieve_user" {
  statement_id  = "AllowAPIGatewayInvokeRetrieveUser"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.retrieve_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_gateway_create_entry" {
  statement_id  = "AllowAPIGatewayInvokeCreateEntry"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_entry.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}


