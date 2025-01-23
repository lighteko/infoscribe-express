from flask.views import MethodView
from flask import request, abort
from src.news.service import NewsService
from src.make_output import make_output


class NewsController(MethodView):
    def __init__(self):
        self.service = NewsService()

    def get(self):
        response = self.service.make_newsletter(
            professionalism=3, keywords=["economy", "stock"])

        return response
