import { system } from "@minecraft/server";

const CustomComponent = {
    onUseOn(event) {
    if (event.source.getGameMode() !== "Creative") {
        event.source.sendMessage("§9<SKYGEN 2> §gNie możesz używać tego przedmiotu w trybie gry innym niż kreatywny!");
        return;
    }
    event.block.dimension.setBlockType({x: event.block.location.x, y: -64, z: event.block.location.z}, "skygen:allowi");
}
}

system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("skygen:allowi", CustomComponent);
});