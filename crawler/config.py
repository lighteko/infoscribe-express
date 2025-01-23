import os
from os.path import join, dirname

from dotenv import load_dotenv
from flask import Flask

dotenv_path = join(dirname(__file__), 'env')
load_dotenv(dotenv_path)


class BaseConfig(object):

    def __init__(self, app: Flask):
        self.init_app(app)

    @classmethod
    def init_app(cls, app: Flask):
        app.config.from_object(cls)

    # LOGGER
    LOGGING_PATH = '../logs'

    # AWS
    AWS_REGION = os.environ.get('AWS_REGION', '')
    AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY', '')
    AWS_SECRET_KEY = os.environ.get('AWS_SECRET_KEY', '')
    AWS_BUCKET_NAME = os.environ.get('AWS_BUCKET_NAME', '')

    # LANGCHAIN
    LANGSMITH_TRACING = os.environ.get('LANGSMITH_TRACING', '')
    LANGSMITH_ENDPOINT = os.environ.get('LANGSMITH_ENDPOINT', '')
    LANGSMITH_API_KEY = os.environ.get('LANGSMITH_API_KEY', '')
    LANGSMITH_PROJECT = os.environ.get('LANGSMITH_PROJECT', '')
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
