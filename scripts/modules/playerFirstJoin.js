import { world } from "@minecraft/server";

function inArea(block, a, b) {
    const x = block.location.x;
    const y = block.location.y;
    const z = block.location.z;

    return (
    (x >= a.x ? x <= b.x : x >= b.x) &&
    (y >= a.y ? y <= b.y : y >= b.y) &&
    (z >= a.z ? z <= b.z : z >= b.z)
);}

const cooldowns = new Map();

function cooldown(player) {
    const time = 1000;
    const playerId = player.id;
    const now = Date.now();

    if (!cooldowns.has(playerId) || now - cooldowns.get(playerId) > time) {
        cooldowns.set(playerId, now);
        return true;  // Możemy wysłać wiadomość
    }
    return false;  // Jeszcze na cooldownie, nie wysyłamy wiadomości
}

world.beforeEvents.playerBreakBlock.subscribe((event) => {
    if (!inPlot(event.player, event.block) && event.player.getGameMode() !== "Creative") {
        event.cancel = true;
        if (cooldown(event.player)) {
            event.player.sendMessage("§9<SKYGEN 2> §gNie możesz tutaj niszczyć bloków!");
        }
        return;
    }
});


world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    if (!inPlot(event.player, event.block) && event.player.getGameMode() !== "Creative") {
        event.cancel = true;
        if (cooldown(event.player)) {
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

    if (!world.getDynamicProperty(`acces_{player.id}`)) {
        world.setDynamicProperty(`acces_${player.id}`, JSON.stringify({
            
        }));
    }
})
