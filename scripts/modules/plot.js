import { world } from "@minecraft/server";

let globalFunc
globalFunc = world.afterEvents.playerSpawn.subscribe(({player}) => {
if (world.getDynamicProperty("lastPlotNumber") == undefined) {
    world.setDynamicProperty(`plot_${player.id}`, JSON.stringify(
        {
            id: 1,
            startPos: {
                x: 3,
                y: -60,
                z: 0
            },
            endPos:{
                x: 18,
                y: -45,
                z: 15
            },
            whitelist: {}
        }
    ));

    world.setDynamicProperty("lastPlotNumber", 1);
    world.setDynamicProperty("lastPlot", JSON.stringify({x: 3, y:-60, z:0}));
    world.afterEvents.playerSpawn.unsubscribe(globalFunc);
}
});

export function createPlot(player) {
    let lastPlot = world.getDynamicProperty("lastPlot");
    let lastPlotNumber = world.getDynamicProperty("lastPlotNumber")

    lastPlot = JSON.parse(lastPlot);

    let newPos;
    if (lastPlot.x > 0) {
        newPos = {x: -18, y: -60, z: lastPlot.z};
        world.getDimension("overworld").runCommand(`structure load plot ${newPos.x} -61 ${newPos.z} 180_degrees`);
        world.setDynamicProperty("lastPlot", JSON.stringify(newPos));
    }
    else {
        newPos = {x: 3, y: -60, z: lastPlot.z + 15};
        world.getDimension("overworld").runCommand(`structure load plot ${newPos.x} -61 ${newPos.z}`);
        world.setDynamicProperty("lastPlot", JSON.stringify(newPos));
    }

    world.setDynamicProperty("lastPlotNumber", lastPlotNumber + 1);
    world.setDynamicProperty(`plot_${player.id}`, JSON.stringify(
        {
            id: lastPlotNumber+1,
            startPos: newPos,
            endPos: {
                x: newPos.x + 15,
                y: newPos.y + 15,
                z: newPos.z + 15
            },
            whitelist: {}
        }
    ));
    return lastPlotNumber+1;
}

export function addToWhitelist(player, playerToAdd) {
    let plot = world.getDynamicProperty(`plot_${player.id}`);
    if (plot) {
        plot = JSON.parse(plot);
        if (plot.whitelist[playerToAdd.id]) {
            player.sendMessage(`§9<SKYGEN 2> §g${playerToAdd.name} jest już na whitelist.`);
            return;
        }
        plot.whitelist[playerToAdd.id] = playerToAdd.name;
        world.setDynamicProperty(`plot_${player.id}`, JSON.stringify(plot));

        const accesRaw = world.getDynamicProperty(`acces_${playerToAdd.id}`);
        let acces = accesRaw ? JSON.parse(accesRaw) : {};

        acces[plot.id] = {
            startPos: plot.startPos,
            endPos: plot.endPos
        };
        world.setDynamicProperty(`acces_${playerToAdd.id}`, JSON.stringify(acces));
        player.sendMessage(`§9<SKYGEN 2> §aDodano ${playerToAdd.name} do whitelisty.`);
    }
    else {
        player.sendMessage("§9<SKYGEN 2> §gWygląda na to że nie masz działki.");
    }
}

export function removeFromWhitelist(player, playerIdtoRemove) {            
    let plot = world.getDynamicProperty(`plot_${player.id}`);
    if (plot) {
        plot = JSON.parse(plot);
        const name = plot.whitelist[playerIdtoRemove];
        delete plot.whitelist[playerIdtoRemove];
        world.setDynamicProperty(`plot_${player.id}`, JSON.stringify(plot));

        const accesRaw = world.getDynamicProperty(`acces_${playerIdtoRemove}`);
        let acces = accesRaw ? JSON.parse(accesRaw) : {};
        delete acces[plot.id];
        world.setDynamicProperty(`acces_${playerIdtoRemove}`, JSON.stringify(acces));
        player.sendMessage(`§9<SKYGEN 2> §aUsunięto ${name} z whitelisty.`);
    }
    else {
        player.sendMessage("§9<SKYGEN 2> §gWygląda na to że nie masz działki.");
    }
}