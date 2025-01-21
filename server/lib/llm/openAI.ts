import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { Express } from "express";

class OpenAI {
  private static _llm: ChatOpenAI;
  private constructor() {}

  public static initApp(app: Express): void {
    this._llm = new ChatOpenAI({ model: "gpt-4o" });
  }

  public static async sendRequest(messages: string) {
    const res = await this._llm.invoke(messages);
    return res.content;
  }
}

export default OpenAI;
