# Generate and print an embedding with Amazon Titan Text Embeddings V2.
import boto3
import json
import os
import logging


from langchain_text_splitters import RecursiveCharacterTextSplitter

aws_region = os.getenv("AWS_REGION", "eu-central-1")
table_name = os.getenv("DYNAMODB_TABLE")
vector_db_name = os.getenv("VECTOR_DB", "ailumni-vector-db")
vector_db_index = os.getenv("VECTOR_DB_INDEX", "ailumni-vector-index")
chunk_size = int(os.getenv("CHUNK_SIZE", 300))

bedrock = boto3.client("bedrock-runtime", region_name=aws_region)
dynamodb = boto3.resource("dynamodb", region_name=aws_region)
s3vectors = boto3.client("s3vectors", region_name="eu-central-1")

splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=0)


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

    logger.info(f"Content of {key}: {content[:30]}")

    # Parse user_sub and item_id from the key
    try:
        user_sub, item_id, file_name = key.split("/", 2)
    except ValueError:
        logger.error(f"Invalid key format: {key}")
        return

    table = dynamodb.Table(table_name)

    try:
        texts = splitter.split_text(content)
        if not texts:
            logger.warning(f"No text found in the content of {key}. Skipping indexing.")
            # Delete the S3 object if no text is found
            s3.delete_object(Bucket=bucket, Key=key)
            # Update DynamoDB item to indicate no text found
            table.update_item(
                Key={"user_sub": user_sub, "item_id": item_id},
                UpdateExpression="SET #files.#file_name = :status",
                ExpressionAttributeNames={
                    "#files": "files",
                    "#file_name": file_name,
                },
                ExpressionAttributeValues={
                    ":status": {"indexed": False, "error": "No text found"}
                },
            )
            logger.info(
                f"Deleted S3 object {key} and updated DynamoDB due to no text found."
            )
            return

        vectors = []

        for i, text in enumerate(texts):
            logger.info(f"Processing text chunk: {text[:30]}...")
            body = json.dumps({"inputText": text})
            response = bedrock.invoke_model(
                modelId="amazon.titan-embed-text-v2:0",
                body=body,  # Titan embedding model
            )
            response_body = json.loads(response["body"].read())
            embedding = response_body["embedding"]
            vectors += {
                "key": key,
                "data": {"float32": embedding, "chunk_index": i},
                "metadata": {"key": key, "source": bucket, "user_sub": user_sub},
            }

        # Insert vector embedding
        s3vectors.put_vectors(
            vectorBucketName=vector_db_name, indexName=vector_db_index, vectors=vectors
        )

        logger.info(
            f"Indexed {len(vectors)} text chunks from {key} into vector database."
        )
        # Update DynamoDB item to indicate successful indexing
        table.update_item(
            Key={"user_sub": user_sub, "item_id": item_id},
            UpdateExpression="SET #files.#file_name = :status",
            ExpressionAttributeNames={
                "#files": "files",
                "#file_name": file_name,
            },
            ExpressionAttributeValues={":status": {"indexed": True}},
        )
        logger.info(f"Successfully indexed {key} and updated DynamoDB.")

    except Exception as e:
        logger.error(f"Error during indexing for {key}: {e}")
        # Update DynamoDB item to indicate failed indexing
        table.update_item(
            Key={"user_sub": user_sub, "item_id": item_id},
            UpdateExpression="SET #files.#file_name = :status",
            ExpressionAttributeNames={
                "#files": "files",
                "#file_name": file_name,
            },
            ExpressionAttributeValues={":status": {"indexed": False, "error": str(e)}},
        )
        raise e
