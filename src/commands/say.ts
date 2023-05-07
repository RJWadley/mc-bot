import { bot } from "../bot";

/**
 * send a text after pausing to simulate typing
 * @param text the text to say
 */
export const sayTextWithDelay = (text: string) => {
  const typingWPM = 60;
  const typingCPM = typingWPM * 5;
  const typingCPS = typingCPM / 60;
  const timeNeeded = text.length / typingCPS;

  // pause the bot for the time needed to type the text
  const currentGoal = bot.pathfinder.goal;
  bot.pathfinder.setGoal(null);
  console.log(`Pausing for ${timeNeeded} seconds`);
  // setTimeout(() => {
    bot.chat(text);
    bot.pathfinder.setGoal(currentGoal);
  // }, timeNeeded * 1000);
};
