data "aws_iam_policy_document" "github_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:*"]
    }
  }
}

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_role" "github_actions" {
  name               = "${var.project_name}-github-actions-role"
  assume_role_policy = data.aws_iam_policy_document.github_assume_role.json

  tags = var.tags
}

resource "aws_iam_policy" "github_actions" {
  name        = "${var.project_name}-github-actions-policy"
  description = "Policy for GitHub Actions to deploy the application."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:GetRepositoryPolicy",
          "ecr:DescribeRepositories",
          "ecr:ListImages",
          "ecr:DescribeImages",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Effect   = "Allow"
        Resource = aws_ecr_repository.main.arn
      },
      {
        Action = [
          "ecs:DescribeServices",
          "ecs:UpdateService"
        ]
        Effect   = "Allow"
        Resource = aws_ecs_service.main.id
      },
      {
        Action = [
          "lambda:UpdateFunctionCode"
        ]
        Effect   = "Allow"
        Resource = module.api_lambda.lambda_function_arn
      },
      {
        Action = [
          "lambda:UpdateFunctionCode"
        ]
        Effect   = "Allow"
        Resource = module.embedding_lambda.lambda_function_arn
      },
      {
        Action = [
          "lambda:UpdateFunctionCode"
        ]
        Effect   = "Allow"
        Resource = module.agent_lambda.lambda_function_arn
      },

    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "github_actions" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.github_actions.arn
}

output "github_actions_role_arn" {
  description = "The ARN of the IAM role for GitHub Actions."
  value       = aws_iam_role.github_actions.arn
}
