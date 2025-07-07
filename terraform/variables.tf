variable "aws_region" {
  description = "The AWS region to deploy the resources in."
  type        = string
  default     = "eu-west-3"
}

variable "project_name" {
  description = "The name of the project."
  type        = string
  default     = "ailumni-front"
}

variable "image_tag" {
  description = "The tag of the Docker image in ECR."
  type        = string
  default     = "latest"
}

variable "container_port" {
  description = "The port the container listens on."
  type        = number
  default     = 3000
}

variable "github_repository" {
  description = "The GitHub repository (e.g., your-username/your-repo) to grant access to."
  type        = string
  default     = "nag763/ailumni"
}

variable "tags" {
  description = "A map of tags to assign to the resources."
  type        = map(string)
  default = {
    app = "ailumni"
  }
}

variable "lambda_zip_path" {
  description = "The path to the lambda zip file."
  type        = string
  default     = "../lambda/retrieve-user/retrieve-user.zip"
}