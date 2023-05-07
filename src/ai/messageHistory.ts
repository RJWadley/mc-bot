import { bot } from "../bot";

interface ChatMessage {
  time: string;
  user: string;
  message: string;
}

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

const messageHistory: ChatMessage[] = [
  { time: getTime(), user: "bot", message: "joined the game" },
];

export const getMessageHistory = (): string => {
  const history = messageHistory
    .map((message) => `[${message.time}] ${message.user}: ${message.message}`)
    .join("\n");

  return `
        # Message History
        ${history}
    `;
};

bot.on("chat", (username, message) => {
  messageHistory.push({
    time: getTime(),
    user: username === bot.username ? "bot" : username,
    message: message,
  });
  if (messageHistory.length > 20) messageHistory.shift();
});
