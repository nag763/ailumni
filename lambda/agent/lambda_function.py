import boto3
import json
import os
import logging


from pydantic import BaseModel, Field
from strands import Agent


class AgentMessage(BaseModel):
    message: str = Field(..., max_length=300)


cors_allow_origin = os.getenv("CORS_ALLOW_ORIGIN", "*")


logger = logging.getLogger()
logger.setLevel("INFO")

aws_region = os.getenv("AWS_REGION", "eu-central-1")
vector_db_name = os.getenv("VECTOR_DB", "ailumni-vector-db")
vector_db_index = os.getenv("VECTOR_DB_INDEX", "ailumni-vector-index")
embedding_model = os.getenv("EMBEDDING_MODEL", "amazon.titan-embed-text-v2:0")
agent_model = os.getenv("AGENT_MODEL", "eu.amazon.nova-micro-v1:0")

s3vectors = boto3.client("s3vectors", region_name=aws_region)
bedrock = boto3.client("bedrock-runtime", region_name=aws_region)

agent = Agent(
    model=agent_model,
    system_prompt="""
    Your role is to assist users by providing helpful responses based on their input.
    You will receive a message from the user, and you should respond with a message that will be augmented from vectors stored in a vector database.
    The user input will be embedded when you will process it.
    Reply given the relevant context.
""",
)


def lambda_handler(event, context):
    http_method = event.get("httpMethod") or event.get("requestContext", {}).get(
        "http", {}
    ).get("method")
    
    user_sub = (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("jwt", {})
        .get("claims", {})
        .get("sub")
    )
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
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            }
        case "POST":
            logger.info("Handling POST request")
            try:
                agent_message = AgentMessage.model_validate_json(
                    event.get("body", "{}")
                )
            except ValueError as ve:
                logger.warning("Validation error while parsing body")
                return {"statusCode": 400, "body": str(ve)}

            bedrock_request = json.dumps({"inputText": agent_message.message})
            embedded_response = bedrock.invoke_model(
                modelId=embedding_model, body=bedrock_request
            )
            model_response = json.loads(embedded_response["body"].read())
            embedding = model_response["embedding"]
            query = s3vectors.query_vectors(
                vectorBucketName=vector_db_name,
                indexName=vector_db_index,
                queryVector={"float32": embedding},
                topK=3,
                filter={"user_sub": user_sub},
                returnDistance=True,
                returnMetadata=True,
            )
            vectors = query["vectors"]
            filtered_vectors = [
                vector for vector in vectors if vector.get("distance", 0) < 0.5
            ]
            
            if not filtered_vectors:
                logger.info("No relevant vectors found for the query")
                return {
                    "statusCode": 200,
                    "body": json.dumps({"message": "No relevant vectors found."}),
                }
            logger.info("Found %d relevant vectors", len(filtered_vectors))
            
            res = agent(json.dumps(filtered_vectors))

            return {
                "statusCode": 200,
                "body": json.dumps(
                    {
                        "message": str(res)
                    }
                ),
            }
        case _:
            logger.warning("Unhandled HTTP method: %s", http_method)
            return {
                "statusCode": 405,
                "body": json.dumps({"error": "Method Not Allowed"}),
            }
