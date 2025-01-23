from typing import List

import requests
from lib.llm.llm import LLM
from lib.infra.s3 import S3
from flask import abort
from newsplease import NewsPlease
import feedparser
from googlenewsdecoder import gnewsdecoder as decoder


class NewsService:
    def __init__(self):
        # self.s3 = S3()
        self.llm = LLM()

    def fetch_news(self, keywords: List[str]):

        news_list = []

        response = requests.get(f"https://gnews.io/api/v4/search?q={
                                keywords[0]}&lang=en&country=us&max=10&apikey=b1491ee33fbfab26780ecf1c3dbc5df7")
        print(response.json())
        news_link_list = [article["url"]
                          for article in response.json()["articles"]]

        for news in news_link_list:
            article = NewsPlease.from_url(news)
            try:
                data: dict = article.get_serializable_dict()
                news_list.append(data)
            except Exception as e:
                pass

        return news_list

    def make_newsletter(self, keywords: List[str], professionalism: int):
        news_list = self.fetch_news(keywords)

        result = []
        for news in news_list:
            res = self.llm.send_request(f"For a 1 to 10 scale of professionalism we have {professionalism}, please answer yes or no if this title ({
                                  news['title']}) fits the scale or not, according to the topic: {str(keywords)}")
            result.append((news, res))
        return result