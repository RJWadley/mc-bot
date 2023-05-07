import mineflayer from "mineflayer";
import { pathfinder, Movements, goals } from "mineflayer-pathfinder";
import { plugin as pvp } from "mineflayer-pvp";

export const bot = mineflayer.createBot({
  host: "localhost", // minecraft server ip
  username: "Test", // minecraft username
  auth: "offline", // for offline mode servers, you can set this to 'offline'
  port: 54306, // only set if you need a port that isn't 25565
  // version: false,             // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
  // password: '12345678'        // set if you want to use password-based auth (may be unreliable)
});

bot.loadPlugin(pathfinder);

bot.once("spawn", () => {
  const defaultMove = new Movements(bot);
  defaultMove.allowSprinting = false;
  bot.pathfinder.setMovements(defaultMove);
});

bot.loadPlugin(pvp);

bot.on("chat", (username, message) => {
  if (message === "fight me") {
    const player = bot.players[username];

    if (!player) {
      bot.chat("I can't see you.");
      return;
    }

    bot.pvp.attack(player.entity);
  }

  if (message === "stop") {
    bot.pvp.stop();
  }
});
