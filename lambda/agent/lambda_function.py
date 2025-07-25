import json
import os
import logging


cors_allow_origin = os.getenv("CORS_ALLOW_ORIGIN", "*")


logger = logging.getLogger()
logger.setLevel("INFO")

def lambda_handler(event, context):
    logger.info("Received event: %s", json.dumps(event))
    http_method = event.get("httpMethod") or event.get("requestContext", {}).get(
        "http", {}
    ).get("method")
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
            return {
                "statusCode": 200,
                "body": json.dumps({
                    "message": "Hello from the agent lambda function!"
                })
            }
        case _:
            logger.warning("Unhandled HTTP method: %s", http_method)
            return {
                "statusCode": 405,
                "body": json.dumps({"error": "Method Not Allowed"})
            }