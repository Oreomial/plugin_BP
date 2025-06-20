import { world } from "@minecraft/server";

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const player = event.player;
    const block = event.block;

    if (!world.getDynamicProperty(`plot_${player.id}`)) {
        event.cancel = true;
        player.sendMessage("Nie możesz niszczyć tu bloków!");
        return;
    }

    const plot = JSON.parse(world.getDynamicProperty(`plot_${player.id}`));

    if (block.position.x < plot.startPos.x || block.position.x > plot.endPos.x ||
        block.position.y < plot.startPos.y || block.position.y > plot.endPos.y ||
        block.position.z < plot.startPos.z || block.position.z > plot.endPos.z) {
        event.cancel = true;
        player.sendMessage("Nie możesz niszczyć tu bloków!");
    }
});

world.afterEvents.playerSpawn.subscribe(({player}) => {
    const scoreboard = world.scoreboard;

    let objective = scoreboard.getObjective("money");

    if (!objective) {
        objective = scoreboard.addObjective("money", "Money");
    }
    
    if (!scoreboard.getObjective("register")) {
        player.dimension.runCommand("scoreboard objectives add register");
    }

    let identity = player.scoreboardIdentity;   

    if (!identity) {
        player.dimension.runCommand(`scoreboard players add ${player.name} register 0`);
        identity = player.scoreboardIdentity;
    }
    const currentScore = objective.getScore(identity);

    if (currentScore === undefined) {
        objective.setScore(identity, 0);
    }
})
