# Generate and print an embedding with Amazon Titan Text Embeddings V2.
import boto3
import json
import sys
import os
import logging

aws_region = os.getenv("AWS_REGION", "eu-central-1")

bedrock = boto3.client("bedrock-runtime", region_name=aws_region)

s3vectors = boto3.client("s3vectors", region_name="eu-central-1")

def lambda_handler(event, context):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Extract bucket and object key from the S3 event
    record = event["Records"][0]
    bucket = record["s3"]["bucket"]["name"]
    key = record["s3"]["object"]["key"]

    logger.info(f"Received S3 event for bucket: {bucket}, key: {key}")

    # Get the object content from S3
    s3 = boto3.client("s3")
    response = s3.get_object(Bucket=bucket, Key=key)
    content = response["Body"].read().decode("utf-8")

    logger.info(f"Content of {key}: {content}")
    body = json.dumps({"inputText": content})
    # Call Bedrock's embedding API
    response = bedrock.invoke_model(
        modelId="amazon.titan-embed-text-v2:0", body=body  # Titan embedding model
    )
    # Parse response
    response_body = json.loads(response["body"].read())
    embedding = response_body["embedding"]

    # Create S3Vectors client

    # # Insert vector embedding
    s3vectors.put_vectors(
        vectorBucketName="ailumni-vector-db",
        indexName="ailumni-vector-index",
        vectors=[
            {
                "key": key,
                "data": {"float32": embedding},
                "metadata": {"id": key, "source_text": content},
            },
        ],
    )