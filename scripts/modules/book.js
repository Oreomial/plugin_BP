import { world, system, } from "@minecraft/server";
import { config } from "../config";
import { ActionFormData } from "@minecraft/server-ui";
import { createPlot } from "./plot";

function dzialki(player) {
    if (player.getComponent("dzialka") == undefined) {

        let score = world.scoreboard.getObjective("money");
        let identity = player.scoreboardIdentity;

        let form = new ActionFormData();
        form.title("Menu");
        form.body("Nie posiadasz działki!");
        form.button(`Kup za ${config.plotPrice}`);

        form.show(player).then((result) => {
            if (result.canceled) {
                return;
            }
            else {
                if (score.getScore(identity) >= config.plotPrice) {
                    score.setScore(identity, score.getScore(identity) - config.plotPrice)
                    let numb = createPlot
                    console.warn(`kupiono nr. ${numb}`);
                }
                else{
                    console.warn("nie masz kasy")
                }
            }
        })

    }
}

const customComponent = {
    onUse(event) {
        let form = new ActionFormData();
        form.title("Menu");
        form.body("Menu SKYGEN 2");
        form.button("Dzialki");
        form.button("Warp");

        form.show(event.source).then((result) => {
            if (result.canceled) {
                return
            } else {
                switch (result.selection){
                case 0:
                    dzialki(event.source);
                    break;
                case 1:
                    break;
                default:
                    console.warn("Nieznany ", result.selection);
                }
            }
        });
    }
};



system.beforeEvents.startup.subscribe(({itemComponentRegistry})=> {
    itemComponentRegistry.registerCustomComponent("skygen:openmenu",customComponent);
})
world.afterEvents.playerSpawn.subscribe(({player}) => {
    let inventory = player.getComponent("inventory").container;
    let found = false;
    for (let index = 0; index < inventory.size; index++) {
        if (inventory.getItem(index)) {
            console.warn(inventory.getItem(index).type.id)
            if (inventory.getItem(index).type.id == "skygen:book") {
                found = true;
                break;
            }
        }
    }

    if (found) {
        console.warn("Item found");
        return;
    }
    else {
        player.dimension.runCommand(`give "${player.name}" skygen:book 1 0 {"keep_on_death": {},"item_lock": {"mode": "lock_in_inventory"}}`);
        console.warn("Gve");
    }
})

