import boto3
import json
import os
import logging

from pydantic import BaseModel, Field


class AgentMessage(BaseModel):
    message: str = Field(..., max_length=300)


cors_allow_origin = os.getenv("CORS_ALLOW_ORIGIN", "*")


logger = logging.getLogger()
logger.setLevel("INFO")

aws_region = os.getenv("AWS_REGION", "eu-central-1")
vector_db_name = os.getenv("VECTOR_DB", "ailumni-vector-db")
vector_db_index = os.getenv("VECTOR_DB_INDEX", "ailumni-vector-index")

s3vectors = boto3.client('s3vectors', region_name=aws_region)
bedrock = boto3.client("bedrock-runtime", region_name=aws_region)


def lambda_handler(event, context):
    logger.info("Received event: %s", json.dumps(event))
    http_method = event.get("httpMethod") or event.get("requestContext", {}).get(
        "http", {}
    ).get("method")
    user_sub = event.get("requestContext", {}).get("authorizer", {}).get("jwt", {}).get("claims", {}).get("sub")
    logger.info("User sub: %s", user_sub)
    logger.info("HTTP method: %s", http_method)

    match http_method:
        case "OPTIONS":
            logger.info("Handling OPTIONS request")
            return {
                "statusCode": 204,
                "headers": {
                    "Access-Control-Allow-Origin": cors_allow_origin,
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            }
        case "POST":
            logger.info("Handling POST request")
            try:
                agent_message = AgentMessage.model_validate_json(event.get("body", "{}"))
            except ValueError as ve:
                logger.warning("Validation error while parsing body")
                return {
                    "statusCode": 400,
                    "body": str(ve)
                }
                
            bedrock_request = json.dumps({"inputText": agent_message.message})
            embedded_response = bedrock.invoke_model(modelId="amazon.titan-embed-text-v2:0", body=bedrock_request)
            model_response = json.loads(embedded_response["body"].read())
            embedding = model_response["embedding"]
            query = s3vectors.query_vectors(vectorBucketName=vector_db_name,
                indexName=vector_db_index,
                queryVector={"float32":embedding},
                topK=3, 
                filter={
                    "user_sub": user_sub
                },
                returnDistance=True,
                returnMetadata=True
            )
            
            return {
                "statusCode": 200,
                "body": json.dumps({
                    "message": f"Hello from the agent lambda function! You said : {str(query)}"
                })
            }
        case _:
            logger.warning("Unhandled HTTP method: %s", http_method)
            return {
                "statusCode": 405,
                "body": json.dumps({"error": "Method Not Allowed"})
            }