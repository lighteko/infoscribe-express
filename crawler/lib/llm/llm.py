import os
from flask import Flask
import openai
from langchain.callbacks import get_openai_callback
from langchain_community.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage


class LLM:
    API_KEY: str
    def __init__(self):
        self.llm = ChatOpenAI(api_key=self.API_KEY)

    @classmethod
    def init_app(cls, app: Flask):
        cls.API_KEY = app.config["OPENAI_API_KEY"]

    def send_request(self, messages):
        with get_openai_callback():
            res = self.llm.invoke(messages)
            return res.content
