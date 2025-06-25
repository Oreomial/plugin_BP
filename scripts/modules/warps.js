import { ActionFormData } from "@minecraft/server-ui";
import { config } from "../config";
import { world } from "@minecraft/server";

export function getMenu(player) {

    let form = new ActionFormData();
    form.title("Menu");
    form.body("Warpy");
    form.button("Spawn", "textures/items/bed_red.png");
    form.button("Działki", "textures/items/compass_item.png");

    form.show(player).then((result) => {
        if (result.canceled) {
            return;
        } else {
            switch (result.selection) {
                case 0:
                    player.teleport(config.spawn,{"dimension": world.getDimension("overworld")});
                    break;
                case 1:
                    player.teleport(config.dzialki,{"dimension": world.getDimension("overworld")});
                    break;
                default:
                    console.warn("Nieznany 22/", result.selection);
            }
        }
    });

}