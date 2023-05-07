import dotenv from "dotenv";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { parsePrompt, pluginInstructions } from "./aiPlugins";
import { bot } from "./bot";

dotenv.config();

/**
 * set up our APIs
 */
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * returns the current time in the format of "hh:mm:ss"
 */
const getTime = (): string => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * dedents a string to save api usage
 */
const dedent = (str: string): string => {
  return str.replaceAll(/ *\n */g, "\n").trim();
};

interface ChatMessage {
  time: string;
  message: string;
}

const messageHistory: ChatMessage[] = [
  { time: getTime(), message: "You joined the game" },
];

const getPrompt = (): ChatCompletionRequestMessage[] => [
  {
    role: "system",
    content: "You are in a Minecraft world. You can do anything you want.",
  },
  ...messageHistory.map(
    (message) =>
      ({
        role: "user",
        content: `${message.time} ${message.message}`,
      } as const)
  ),
  {
    role: "system",
    content: dedent(pluginInstructions),
  },
  {
    role: "system",
    content: "Type a command: >",
  },
];

const getNextAction = async () => {
  const prompt = getPrompt();

  const response = await openai.createChatCompletion({
    messages: prompt,
    model: "gpt-3.5-turbo",
  });

  const text = response.data.choices[0]?.message?.content;

  if (!text) {
    console.error("No text returned from OpenAI");
  } else {
    console.log(`OpenAI: ${text}`);

    parsePrompt(text);
  }
};

bot.on("chat", (username, message) => {
  messageHistory.push({ time: getTime(), message: `${username}: ${message}` });

  if (username !== bot.username) getNextAction();
});

export const startAI = () => {
  getNextAction();
};
