# Generate and print an embedding with Amazon Titan Text Embeddings V2.
import boto3
import json
import os
import logging

aws_region = os.getenv("AWS_REGION", "eu-central-1")

bedrock = boto3.client("bedrock-runtime", region_name=aws_region)

s3vectors = boto3.client("s3vectors", region_name="eu-central-1")

def fixed_size_chunking(text, max_tokens) -> list:
    words = text.split()
    chunks = []
    current_chunk = []
    current_tokens = 0

    for word in words:
        current_tokens += len(word.split())
        if current_tokens <= max_tokens:
            current_chunk.append(word)
        else:
            chunks.append(' '.join(current_chunk))
            current_chunk = [word]
            current_tokens = len(word.split())
    
    # Append the last chunk
    if current_chunk:
        chunks.append(' '.join(current_chunk))

    return chunks

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

    chunks = fixed_size_chunking(content, 1536) 
    vectors = []
    for i, chunk in enumerate(chunks):
        logger.info(f"Processing chunk: {chunk[:50]}...")  # Log the first 50 characters of the chunk
        body = json.dumps({"inputText": chunk})
        
        # Call Bedrock's embedding API
        response = bedrock.invoke_model(
            modelId="amazon.titan-embed-text-v2:0", body=body  # Titan embedding model
        )
        
        # Parse response
        response_body = json.loads(response["body"].read())
        embedding = response_body["embedding"]
        logger.info(f"Generated embedding for chunk: {embedding[:10]}...")
        vectors.append({
            "key": key,
            "data": {"float32": embedding},
            "metadata": {"id": f"key_{i}", "source": {"bucket": bucket, "key": key}, "source_text": chunk},
        })

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