from typing import List

from lib.news.gnews import GNews
from lib.llm.llm import LLM
from lib.infra.s3 import S3
from flask import abort


class NewsService:
    def __init__(self):
        # self.s3 = S3()
        self.llm = LLM()
        self.gnews = GNews()

    def make_newsletter(self, lang: str, country: str, keywords: List[str], level: str):
        news_list = self.gnews.get_news(lang, country, " ".join(keywords))
        contents = []
        for news in news_list:
            contents.append({
                "title": news["title"],
                "content": news["maintext"],
                "url": news["url"]
            })

        preset = f"""
### Optimized Prompt for Newsletter Service  

You are a skilled columnist tasked with creating a newsletter based on the news article sources I will provide. The newsletter should follow these instructions:  

1. **Language and Tone**:  
   - Write the newsletter in `{lang}`.  
   - The tone should be friendly and conversational, like a respectful and knowledgeable friend.  

2. **Formatting**:  
   - Your response must be a visually appealing and professionally styled HTML document.  
   - Include appropriate sections, headings, and formatting for readability.  

3. **Newsletter Structure**:  
   - **Header**: Incorporate a clean, branded header for the service **"infoscribe"**, written in English.  
   - **Opening Paragraph**: Start with an engaging introduction that sets the tone for the newsletter and highlights its central theme.  
   - **Main Content**: Organize the given sources into their own sections. Sort them by date in ascending order and include meaningful subheadings.  
   - **Closing Paragraph**: End with a thoughtful conclusion that ties together the main idea and leaves the reader with a sense of value or action.  
   - **References**: Include a "References" section at the end listing all the provided URLs.  
   - **Footer**: Add a neatly designed footer referencing "infoscribe" with a tagline, contact details, or relevant call-to-action.  
   - **Length**: Each paragraphs should contain at least 200 words.

4. **Purpose and Audience**:  
   - Focus on the topic: `{keywords}`.  
   - Cater to an audience with a `{level}` understanding of the subject matter. Adjust language complexity and depth accordingly.  

5. **Unified Theme**:  
   - The newsletter should deliver one cohesive and meaningful idea, synthesizing information from the provided sources.  

6. **Input Format**:  
   - You will be given an array of sources in this format:  
     [
       ["title": "TITLE", "content": "CONTENT", "url": "URL", "date": "YYYY-MM-DD"]
     ]
Ensure the resulting HTML document maintains a polished, reader-friendly layout while being aligned with these instructions."""
        prompt = self.llm.generate_prompt(preset, contents)

        result = self.llm.send_request(prompt)

        return result
