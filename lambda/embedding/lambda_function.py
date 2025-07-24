# Generate and print an embedding with Amazon Titan Text Embeddings V2.
import boto3
import json
import sys
import os
import logging

aws_region = os.getenv("AWS_REGION", "eu-central-1")

bedrock = boto3.client("bedrock-runtime", region_name=aws_region)

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
    # embeddings = []
    # # Generate vector embeddings for the input texts
    # for text in texts:
    #     body = json.dumps({"inputText": text})
    #     # Call Bedrock's embedding API
    #     response = bedrock.invoke_model(
    #         modelId="amazon.titan-embed-text-v2:0", body=body  # Titan embedding model
    #     )
    #     # Parse response
    #     response_body = json.loads(response["body"].read())
    #     embedding = response_body["embedding"]
    #     embeddings.append(embedding)

    # # Create S3Vectors client

    # # # Insert vector embedding
    # s3vectors.put_vectors(
    #     vectorBucketName="ailumni-vector-db",
    #     indexName="ailumni-vector-index",
    #     vectors=[
    #         {
    #             "key": "v1",
    #             "data": {"float32": embeddings[0]},
    #             "metadata": {"id": "key1", "source_text": texts[0], "genre": "scifi"},
    #         },
    #         {
    #             "key": "v2",
    #             "data": {"float32": embeddings[1]},
    #             "metadata": {"id": "key2", "source_text": texts[1], "genre": "scifi"},
    #         },
    #         {
    #             "key": "v3",
    #             "data": {"float32": embeddings[2]},
    #             "metadata": {"id": "key3", "source_text": texts[2], "genre": "family"},
    #         },
    #         {
    #             "key": "v4",
    #             "data": {"float32": embeddings[3]},
    #             "metadata": {"id": "key4", "source_text": texts[3], "genre": "crime"},
    #         },
    #     ],
    # )

    # Get the search query from CLI argument
    if len(sys.argv) < 2:
        print("Usage: python main.py <search_query>")
        sys.exit(1)
    input_text = sys.argv[1]

    # Create the JSON request for the model.
    request = json.dumps({"inputText": input_text})

    # Invoke the model with the request and the model ID, e.g., Titan Text Embeddings V2.
    response = bedrock.invoke_model(
        modelId="amazon.titan-embed-text-v2:0", body=request
    )

    # Decode the model's native response body.
    model_response = json.loads(response["body"].read())

    # Extract and print the generated embedding and the input text token count.
    embedding = model_response["embedding"]

    # Performa a similarity query. You can also optionally use a filter in your query
    query = s3vectors.query_vectors(
        vectorBucketName="ailumni-vector-db",
        indexName="ailumni-vector-index",
        queryVector={"float32": embedding},
        topK=3,
        returnDistance=True,
        returnMetadata=True,
    )
    results = query["vectors"]
    # Print the similarity query results in a formatted way
    for i, result in enumerate(results, 1):
        print(f"Result {i}:")
        print(f"  Key: {result.get('key')}")
        print(f"  Distance: {result.get('distance')}")
        print(f"  Metadata: {json.dumps(result.get('metadata'), indent=2)}")
        print()


if __name__ == "__main__":
    main()
