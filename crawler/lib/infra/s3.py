import boto3
import os
from flask import Flask


class S3:
    AWS_REGION = ''
    AWS_ACCESS_KEY = ''
    AWS_SECRET_KEY = ''
    AWS_BUCKET_NAME = ''

    def __init__(self):
        self.resource = boto3.resource('s3',
                                       region_name=S3.AWS_REGION,
                                       aws_access_key_id=S3.AWS_ACCESS_KEY,
                                       aws_secret_access_key=S3.AWS_SECRET_KEY
                                       )

        self.client = self.resource.meta.client
        self.bucket = S3.AWS_BUCKET_NAME

    @classmethod
    def init_app(cls, app: Flask):
        cls.AWS_REGION = app.config['AWS_REGION']
        cls.AWS_ACCESS_KEY = app.config['AWS_ACCESS_KEY']
        cls.AWS_SECRET_KEY = app.config['AWS_SECRET_KEY']
        cls.AWS_BUCKET_NAME = app.config['AWS_BUCKET_NAME']

    def upload_file(self, file_local_path, file_s3_path, bucket=None):
        if bucket is None:
            bucket = self.bucket
        if file_s3_path is None:
            file_s3_path = os.path.basename(file_local_path)
            # Upload the file
        self.client.upload_file(file_local_path, bucket, file_s3_path)
        bucket_location = self.client.get_bucket_location(Bucket=bucket)
        object_url = "https://s3-{0}.amazonaws.com/{1}/{2}".format(
            bucket_location['LocationConstraint'], bucket, file_s3_path)
        return object_url

    def upload_file_object(self, file_obj, file_s3_path, bucket=None):
        if bucket is None:
            bucket = self.bucket
        if file_s3_path is None:
            file_s3_path = file_obj.filename
        self.client.upload_fileobj(file_obj, bucket, file_s3_path)
        bucket_location = self.client.get_bucket_location(Bucket=bucket)
        object_url = "https://s3-{0}.amazonaws.com/{1}/{2}".format(
            bucket_location['LocationConstraint'], bucket, file_s3_path)
        return object_url

    def copy_s3_file(self, source_bucket, source_key, destination_bucket, destination_key):
        try:
            copy_source = {
                'Bucket': source_bucket,
                'Key': source_key
            }
            self.client.copy(copy_source, destination_bucket, destination_key)

            s3_url = f"https://{destination_bucket}.s3.amazonaws.com/{destination_key}"
            return s3_url

        except Exception as e:
            print(f"An error occurred: {e}")
