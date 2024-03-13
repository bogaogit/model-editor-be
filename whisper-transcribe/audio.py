import boto3
import os

AWS_ACCESS_KEY_ID = 'AKIAW3MEEZNLD5AIXLNP'
AWS_SECRET_ACCESS_KEY = '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'
bucket_name = "model-editor-data-bucket"
object_key = "screen-capture-bbdf63fd-29a9-4005-86c2-08984dda72b1.mp4"

s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=AWS_SECRET_ACCESS_KEY)

s3.download_file(bucket_name,object_key,'./' + object_key)

print(f"Successfully downloaded file: {object_key}")
