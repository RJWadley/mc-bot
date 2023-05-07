import { goals } from "mineflayer-pathfinder";
import { bot } from "./commands/bot";
import { startAI } from "./commands/ai";

bot.once("spawn", () => {
  console.log("Bot has spawned!");
  startAI();
});
