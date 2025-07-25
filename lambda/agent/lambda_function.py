import os

cors_allow_origin = os.getenv("CORS_ALLOW_ORIGIN", "*")

def lambda_handler(event, context):
    http_method = event.get("httpMethod", "GET")
    match http_method:
        case "OPTIONS":
            return {
                "statusCode": 204,
                "headers": {
                    "Access-Control-Allow-Origin": cors_allow_origin,
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            }
        case "POST":
            return {
                "statusCode": 200,
                "body": "Hello from the agent lambda function!"
            }