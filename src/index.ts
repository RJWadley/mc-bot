import { goals } from "mineflayer-pathfinder";
import { bot } from "./bot";
import { startAI } from "./ai";

bot.once("spawn", () => {
  console.log("Bot has spawned!");
  startAI();
});
