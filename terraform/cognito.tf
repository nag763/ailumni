resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-user-pool"

  auto_verified_attributes = ["email"]

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_message        = "Your verification code is {####}"
    email_subject        = "Verify your email for Ailumni"
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_uppercase = true
  }

  tags = var.tags
}

resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.project_name}-user-pool-client"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ADMIN_NO_SRP_AUTH",
    "USER_PASSWORD_AUTH"
  ]

  generate_secret = false

}

resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = "${var.project_name}-identity-pool"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id     = aws_cognito_user_pool_client.main.id
    provider_name = "cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
  }

  tags = var.tags
}

resource "aws_iam_role" "cognito_authenticated_role" {
  name = "${var.project_name}-cognito-authenticated-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Condition = {
          "StringEquals" = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.main.id
          },
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_policy" "cognito_authenticated_policy" {
  name        = "${var.project_name}-cognito-authenticated-policy"
  description = "Policy for authenticated users of the Cognito identity pool."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "mobileanalytics:PutEvents",
          "cognito-sync:*"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "cognito_authenticated_policy" {
  role       = aws_iam_role.cognito_authenticated_role.name
  policy_arn = aws_iam_policy.cognito_authenticated_policy.arn
}

resource "aws_cognito_identity_pool_roles_attachment" "main" {
  identity_pool_id = aws_cognito_identity_pool.main.id

  roles = {
    "authenticated" = aws_iam_role.cognito_authenticated_role.arn
  }
}

output "identity_pool_id" {
  description = "The ID of the Cognito identity pool."
  value       = aws_cognito_identity_pool.main.id
}

output "user_pool_id" {
  description = "The ID of the Cognito user pool."
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_client_id" {
  description = "The ID of the Cognito user pool client."
  value       = aws_cognito_user_pool_client.main.id
}