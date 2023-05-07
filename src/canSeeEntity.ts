import { bot } from "./commands/bot";

type Entity = typeof bot.entity;

import mcData from "minecraft-data";

const transparentBlocks = mcData(bot.version)
  .blocksArray.filter((e) => e.transparent || e.boundingBox === "empty")
  .map((e) => e.id);

const canSeeEntity = (entity: Entity, vectorLength = 5 / 16) => {
  const { height, position } = bot.entity;
  const entityPos = entity.position.offset(
    -entity.width / 2,
    0,
    -entity.width / 2
  );

  // bounding box verticies (8 verticies)
  const targetBoundingBoxVertices = [
    entityPos.offset(0, 0, 0),
    entityPos.offset(entity.width, 0, 0),
    entityPos.offset(0, 0, entity.width),
    entityPos.offset(entity.width, 0, entity.width),
    entityPos.offset(0, entity.height, 0),
    entityPos.offset(entity.width, entity.height, 0),
    entityPos.offset(0, entity.height, entity.width),
    entityPos.offset(entity.width, entity.height, entity.width),
  ];

  // Check the line of sight for every vertex
  const lineOfSight = targetBoundingBoxVertices.map((bbVertex) => {
    // cursor starts at bot's eyes
    const cursor = position.offset(0, height, 0);
    // a vector from a to b = b - a
    const step = bbVertex.minus(cursor).unit().scaled(vectorLength);
    // we shouldn't step farther than the distance to the entity, plus the longest line inside the bounding box
    const maxSteps = bbVertex.distanceTo(position) / vectorLength;

    // check for obstacles
    for (let i = 0; i < maxSteps; ++i) {
      cursor.add(step);
      const block = bot.blockAt(cursor);

      // block must be air/null or a transparent block
      if (block !== null && !transparentBlocks.includes(block.type)) {
        return false;
      }
    }

    return true;
  });

  // must have at least 1 vertex in line-of-sight
  return lineOfSight.some((e) => e);
};

export default canSeeEntity;
