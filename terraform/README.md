# Terraform AWS Next.js Deployment

This Terraform setup deploys a Next.js application to AWS using Fargate for serverless container execution.

## Architecture

*   **VPC**: A new VPC is created with public subnets.
*   **ECR**: An Elastic Container Registry is created to store your Docker images.
*   **ECS Fargate**: The Next.js application runs as a service on Fargate, which manages the underlying infrastructure.
*   **Application Load Balancer**: An ALB is set up to distribute traffic to the ECS service.
*   **IAM Roles**: Necessary IAM roles and policies are created for ECS tasks.

## Prerequisites

1.  [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli) installed.
2.  [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) installed and configured with your credentials.
3.  [Docker](https://docs.docker.com/get-docker/) installed.

## How to Deploy

1.  **Update Next.js config**: Make sure your `front/next.config.mjs` has the `output: 'standalone'` option. This is crucial for creating an optimized Docker image. I have already made this change for you.

2.  **Deploy with Terraform**:
    *   Navigate to the `terraform` directory.
    *   Initialize Terraform:
        ```sh
        terraform init
        ```
    *   Apply the Terraform plan to create the infrastructure, including the ECR repository:
        ```sh
        terraform apply
        ```

3.  **Build and Push the Docker Image**:
    *   After the `terraform apply` is complete, you will get the `ecr_repository_url` as an output. Use this URL to build and push your Docker image.
    *   Login to ECR:
        ```sh
        aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com
        ```
    *   Build the Docker image:
        ```sh
        docker build -t <ecr_repository_url>:latest ..
        ```
    *   Push the image to ECR:
        ```sh
        docker push <ecr_repository_url>:latest
        ```

4.  **Update the ECS Service**:
    *   Run `terraform apply` again. Terraform will detect the new image in ECR and update the ECS service to deploy it.

After the final apply is complete, the DNS of the load balancer will be printed as an output. You can access your application through that URL.
