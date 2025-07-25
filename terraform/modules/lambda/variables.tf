variable "function_name" {
  description = "The name of the Lambda function."
  type        = string
}

variable "handler" {
  description = "The function entrypoint in your code."
  type        = string
}

variable "runtime" {
  description = "The runtime for the Lambda function."
  type        = string
}

variable "filename" {
  description = "The path to the function's deployment package within the local filesystem."
  type        = string
}

variable "environment_variables" {
  description = "A map of environment variables that are accessible from the Lambda function code."
  type        = map(string)
  default     = {}
}

variable "memory_size" {
  description = "The amount of memory in MB your Lambda function has access to."
  type        = number
  default     = 128
}

variable "timeout" {
  description = "The maximum amount of time (in seconds) that the Lambda function can run."
  type        = number
  default     = 30
}

variable "attach_to_vpc" {
  description = "Whether to attach the Lambda function to a VPC."
  type        = bool
  default     = false
}

variable "security_group_ids" {
  description = "A list of security group IDs when the Lambda function is in a VPC."
  type        = list(string)
  default     = []
}

variable "subnet_ids" {
  description = "A list of subnet IDs when the Lambda function is in a VPC."
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "A map of tags to assign to the Lambda function and IAM role."
  type        = map(string)
  default     = {}
}
