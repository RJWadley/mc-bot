import dotenv from "dotenv";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { parsePrompt, pluginInstructions } from "./plugins";
import { bot } from "../bot";
import { getWorldContext } from "../worldContext";
import { getMessageHistory } from "./messageHistory";

dotenv.config();

/**
 * set up our APIs
 */
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * dedents a string to save api usage
 */
const dedent = (str: string): string => {
  return str.replaceAll(/ *\n */g, "\n").trim();
};

const getPrompt = (): ChatCompletionRequestMessage[] => {
  const systemText = `
  # Instructions
  You are a helpful minecraft bot.
  Use the functions defined in Available Functions to control the bot.
  Reply to the above chat messages, and if you want, run a command.
  # Response
  \`\`\`javascript
  `;

  const prompt: ChatCompletionRequestMessage[] = [
    {
      role: "user",
      content: dedent(getWorldContext()),
    },
    {
      role: "user",
      content: dedent(pluginInstructions),
    },
    {
      role: "user",
      content: dedent(getMessageHistory()),
    },
    {
      role: "user",
      content: dedent(systemText),
    },
  ];

  console.log(prompt.map((message) => message.content).join("\n"));

  return prompt;
};

let tries = 0;

const getNextAction = async () => {
  const prompt = getPrompt();

  const response = await openai.createChatCompletion({
    messages: prompt,
    model: "gpt-3.5-turbo",
  });

  const text = response.data.choices[0]?.message?.content.split("```")[0];

  if (!text) {
    console.error("No text returned from OpenAI");
  } else {
    console.log(`OpenAI: ${response.data.choices[0]?.message?.content}`);

    try {
      parsePrompt(text);
    } catch (error) {
      console.error(error);
      tries += 1;
      if (tries < 3) getNextAction();
    }
  }
};

bot.on("chat", (username, message) => {
  tries = 0;
  if (username !== bot.username) setTimeout(getNextAction);
});

let isLoggedIn = false;
bot.once("spawn", () => {
  isLoggedIn = true;
});

export const startAI = () => {
  setTimeout(() => {
    tries = 0;
    if (isLoggedIn) getNextAction();
    else bot.once("spawn", () => getNextAction());
  }, 1000);
};
