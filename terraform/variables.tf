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
