import { world } from "@minecraft/server";
import { config } from "../config";

function endsWithAnyTag(typeId, tags) {
  for (let i = 0, len = tags.length; i < len; i++) {
    if (typeId.endsWith(tags[i])) return true;
  }
  return false;
}

function isInteractiveBlock(typeId) {
  return (
    config.interactiveBlocks.has(typeId) ||
    endsWithAnyTag(typeId, config.interactiveTags)
  );
}

function inArea(block, a, b) {
    a.x+=1;
    a.z+=1;
    b.x-=1;
    b.z-=1;
    const x = block.location.x;
    const y = block.location.y;
    const z = block.location.z;

    return (
    (x >= a.x ? x <= b.x : x >= b.x) &&
    (y >= a.y ? y <= b.y : y >= b.y) &&
    (z >= a.z ? z <= b.z : z >= b.z)
);}

function canAcces(player, block) {
    const accesRaw = world.getDynamicProperty(`acces_${player.id}`);
    if (!accesRaw) return false;

    const acces = JSON.parse(accesRaw);
    for (const plotId in acces) {
        const plot = acces[plotId];
        if (inArea(block, plot.startPos , plot.endPos)) {
            return true; // gracz ma dostęp w tej działce
        }
    }
    return false; // nie w żadnej działce
}


const cooldowns = new Map();

function cooldown(player) {
    const time = 1000;
    const playerId = player.id;
    const now = Date.now();

    if (!cooldowns.has(playerId) || now - cooldowns.get(playerId) > time) {
        cooldowns.set(playerId, now);
        return true;
    }
    return false;
}

world.beforeEvents.playerBreakBlock.subscribe((event) => {
    if (!canAcces(event.player, event.block) && event.player.getGameMode() !== "Creative") {
        event.cancel = true;
        if (cooldown(event.player)) {
            event.player.sendMessage("§9<SKYGEN 2> §gNie możesz tutaj niszczyć bloków!");
        }
        return;
    }
});

world.beforeEvents.playerPlaceBlock.subscribe((event) => {
    if (!canAcces(event.player, event.block) && event.player.getGameMode() !== "Creative") {
        event.cancel = true;
        event.player.sendMessage("§9<SKYGEN 2> §gNie możesz tutaj stawiać bloków!");

        return;
    }
});

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    const dimension = event.block.dimension;

    if (dimension.getBlock({x: event.block.x, y: -64, z: event.block.z}).typeId !== "skygen:allowi" &&
    !canAcces(event.player, event.block) 
    && event.player.getGameMode() !== "Creative" 
    && isInteractiveBlock(event.block.typeId)) {
        event.cancel = true;
        if (event.isFirstEvent) {
            event.player.sendMessage("§9<SKYGEN 2> §gNie możesz tutaj tego zrobić!");
        }
        return;
    }
});

world.afterEvents.playerSpawn.subscribe(({player}) => {
    const scoreboard = world.scoreboard;
    let objective = scoreboard.getObjective("money");

    if (!objective) {
        objective = scoreboard.addObjective("money", "Money");
    }

    if (!player.scoreboardIdentity || objective.getScore(player.scoreboardIdentity) == undefined) {
        player.dimension.runCommand(`scoreboard players add ${player.name} money 0`);
    }

    if (!world.getDynamicProperty(`acces_${player.id}`)) {
        world.setDynamicProperty(`acces_${player.id}`, JSON.stringify({}));
    }
})
