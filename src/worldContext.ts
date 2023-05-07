import { bot } from "./bot";
import canSeeEntity from "./canSeeEntity";

/**
 * return the names of any online players,
 * and if we can see them their location
 */
export const getWorldContext = () => {
  const players = Object.keys(bot.players)
    .filter((entity) => entity !== bot.username)
    .map((player) => ({
      name: player,
      coordinates: canSeeEntity(bot.players[player]?.entity)
        ? bot.players[player]?.entity?.position.clone().round()
        : undefined,
    }));
  const entities = Object.keys(bot.entities)
    .map((entity) => entity)
    .filter((entity) => bot.entities[entity]?.type !== "player")
    .filter((entity) => canSeeEntity(bot.entities[entity]))
    // get the type of entity
    .map((entity) => bot.entities[entity]?.mobType)
    .flatMap((entity) => (entity ? [entity] : []));

  const entityCounts: Record<string, number> = {};
  for (const entity of entities) {
    entityCounts[entity] = (entityCounts[entity] ?? 0) + 1;
  }

  const context = `
        # World Information
        Your coords: ${bot.entity.position.clone().round()}
        Players: ${players
          .map(
            (player) =>
              `${player.name}${
                player.coordinates ? ` visible at ${player.coordinates}` : " unknown location"
              }`
          )
          .join(", ")}
        Entities: ${Object.entries(entityCounts)
          .map(([entity, count]) => `${entity} x${count}`)
          .join(", ")}
    `;

  return context;
};
