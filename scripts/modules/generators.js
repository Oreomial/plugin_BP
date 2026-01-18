import { system } from "@minecraft/server";

const CustomComponent = {
    onTick(event) {
    console.warn("Custom component tick event triggered", event.block.typeId);
    }
}

system.beforeEvents.startup.subscribe(({blockComponentRegistry})=> {
    blockComponentRegistry.registerCustomComponent("skygen:generator",CustomComponent);
})
