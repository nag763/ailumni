echo "Overriding github secrets"

NEXT_PUBLIC_CLIENT_ID=$(terraform -chdir=./terraform output -raw user_pool_client_id)
NEXT_PUBLIC_USER_POOL_ID=$(terraform -chdir=./terraform output -raw user_pool_id)
AWS_IAM_ROLE_ARN=$(terraform -chdir=./terraform output -raw github_actions_role_arn)
NEXT_PUBLIC_API_ENDPOINT=$(terraform -chdir=./terraform output -raw NEXT_PUBLIC_API_ENDPOINT)

gh secret set NEXT_PUBLIC_CLIENT_ID -b "$NEXT_PUBLIC_CLIENT_ID"
gh secret set NEXT_PUBLIC_USER_POOL_ID -b "$NEXT_PUBLIC_USER_POOL_ID" 
gh secret set AWS_IAM_ROLE_ARN -b "$AWS_IAM_ROLE_ARN"
gh secret set NEXT_PUBLIC_API_ENDPOINT -b "$NEXT_PUBLIC_API_ENDPOINT"

# Cleans the env variables
unset NEXT_PUBLIC_CLIENT_ID
unset NEXT_PUBLIC_USER_POOL_ID
unset AWS_IAM_ROLE_ARN
unset NEXT_PUBLIC_API_ENDPOINT

echo "Github secrets updated successfully"