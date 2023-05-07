import { goals } from "mineflayer-pathfinder";
import { bot } from "./bot";
const { GoalNear, GoalNearXZ, GoalY } = goals;

/**
 * implementation of the goto command in mineflayer using mineflayer-pathfinder
 * @param to the location to go to in the format of "x y z" or "x z" or "y"
 * @param distance how close to get to the location
 */
export default async function goTo(
  to: string,
  distance: number = 10
): Promise<void> {
  // parse the location string into x, y, and z
  const args = to.split(" ");
  const [first, second, third] = args;

  let x: number | undefined;
  let y: number | undefined;
  let z: number | undefined;
  if (first && second && third) {
    console.log(`Going to ${first}, ${second}, ${third}`);
    x = parseFloat(first);
    y = parseFloat(second);
    z = parseFloat(third);
    bot.pathfinder.setGoal(new GoalNear(x, y, z, distance));
  } else if (first && second) {
    console.log(`Going to ${first}, ${second}`);
    x = parseFloat(first);
    z = parseFloat(second);
    bot.pathfinder.setGoal(new GoalNearXZ(x, z, distance));
  } else if (first) {
    console.log(`Going to Y level ${first}`);
    y = parseFloat(first);
    bot.pathfinder.setGoal(new GoalY(y));
  } else {
    console.error("Invalid coordinates, " + to);
  }
}
