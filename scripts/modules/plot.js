import { world } from "@minecraft/server";

world.afterEvents.worldLoad.subscribe(() => {
if (world.getDynamicProperty("lastPlotNumber") == undefined) {
    world.setDynamicProperty(`plot_${world.getPlayers()[0].id}`, JSON.stringify(
        {
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
}
});

export function createPlot(player) {
    let lastPlot = world.getDynamicProperty("lastPlot");
    let lastPlotNumber = world.getDynamicProperty("lastPlotNumber")

    lastPlot = JSON.parse(lastPlot);

    if (lastPlot.x > 0) {
        let newPos = {x: -18, y: -60, z: lastPlot.z};
        world.getDimension("overworld").runCommand(`structure load plot ${newPos.x} -61 ${newPos.z} 180_degrees`);
        world.setDynamicProperty("lastPlot", JSON.stringify(newPos));
    }
    else {
        let newPos = {x: 3, y: -60, z: lastPlot.z + 15};
        world.getDimension("overworld").runCommand(`structure load plot ${newPos.x} -61 ${newPos.z}`);
        world.setDynamicProperty("lastPlot", JSON.stringify(newPos));
    }

    world.setDynamicProperty("lastPlotNumber", lastPlotNumber + 1);
    world.setDynamicProperty(`plot_${lastPlotNumber}`, JSON.stringify(
        {
            owner: player.id,
            startPos: newPos,
            endPos: {
                x: newPos.x + 15,
                y: newPos.y + 15,
                z: newPos.z + 15
            },
            whitelist: {}
        }
    ));
    return lastPlotNumber;
}

export function addToWhitelist(player) {
    let plot = world.getDynamicProperty(`plot_${player.id}`);
    if (plot) {
        plot = JSON.parse(plot);
        plot.whitelist[player.id] = true;
        world.setDynamicProperty(`plot_${player.id}`, JSON.stringify(plot));
    }
}