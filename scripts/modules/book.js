import { world, system, } from "@minecraft/server";
import { config } from "../config";
import { getMenu } from "./warps";
import { ActionFormData } from "@minecraft/server-ui";
import { openShop } from "./shop";
import { createPlot,addToWhitelist, removeFromWhitelist } from "./plot";

function addPlayerMenu(player){
    let form = new ActionFormData();
    form.title("Dodaj gracza");
    form.body("Wybierz gracza, którego chcesz dodać do działki");
    let plot = world.getDynamicProperty(`plot_${player.id}`);
    let whitelist = {};
    if (plot) {
        plot = JSON.parse(plot);
        whitelist = plot.whitelist || {};
    }
    else {
        player.sendMessage("§9<SKYGEN 2> §gWygląda na to że nie masz działki.");
    }
    let players = world.getPlayers().filter(p => p.id !== player.id && !(p.id in whitelist));
    if (players.length === 0) {
        player.sendMessage("§9<SKYGEN 2> §gNie ma żadnych graczy do dodania.");
        return;
    }
    players.forEach((p) => {
       form.button(p.name);
    });
    form.show(player).then((result) => {
        if (result.canceled) {
            return;
        }
        else {
            const selectedPlayer = players[result.selection];
            if (selectedPlayer) {
                addToWhitelist(player, selectedPlayer);
            } else {
                console.warn("Nieznany gracz");
            }
        }
    });
}

function removePlayerMenu(player) {
    let form = new ActionFormData();
    form.title("Usuń gracza");
    form.body("Wybierz gracza, którego chcesz usunąć z działki");

    let plot = world.getDynamicProperty(`plot_${player.id}`);
    if (!plot) {
        player.sendMessage("§9<SKYGEN 2> §gWygląda na to że nie masz działki.");
        return;
    }
    plot = JSON.parse(plot);
    if (Object.keys(plot.whitelist).length === 0) {
        player.sendMessage("§9<SKYGEN 2> §gNikt nie jest dodany do twojej działki.");
        return;
    }
    for (const playerId in plot.whitelist) {
        form.button(plot.whitelist[playerId]);
    }
    form.show(player).then((result) => {
        if (result.canceled) {
            return;
        }
        else {
            const selectedPlayerId = Object.keys(plot.whitelist)[result.selection];
            if (selectedPlayerId) {
                removeFromWhitelist(player, selectedPlayerId);
            } else {
                console.warn("Nieznany gracz");
            }
        }
    });
}

function dzialki(player) {
    let dzialka = world.getDynamicProperty(`plot_${player.id}`);
    if (dzialka === undefined) {

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
                    score.setScore(identity, score.getScore(identity) - config.plotPrice);
                    const numb = createPlot(player);
                    player.sendMessage(`§9<SKYGEN 2> §aDziałka została zakupiona! ID działki: ${numb}`);
                }
                else{
                    player.sendMessage(`§9<SKYGEN 2> §gNie masz wystarczająco pieniędzy! Potrzebujesz ${config.plotPrice} monet.`);
                    return;
                }
            }
        });

    }
    else {
        dzialka = JSON.parse(dzialka);
        let form = new ActionFormData();
        form.title("Menu");
        form.body(`Menu działki ${dzialka.id}`);
        form.button(`Dodaj gracza`, "textures/ui/plus.png");
        form.button(`Usuń gracza`, "textures/ui/minus.png");

        form.show(player).then((result) => {
            if (result.canceled) {
                return;
            }
            else {
                switch (result.selection) {
                    case 0:
                        addPlayerMenu(player);
                        break;
                    case 1:
                        removePlayerMenu(player);
                        break;
                    default:
                        console.warn("Nieznany 57/", result.selection);
                }
            }
        });
    }
}

const customComponent = {
    onUse(event) {
        let form = new ActionFormData();
        form.title("Menu");
        form.body("Menu SKYGEN 2");
        form.button("Dzialki", "textures/items/map_locked.png");
        form.button("Warpy", "textures/items/ender_pearl.png");
        form.button("Sklep", "textures/items/emerald.png")

        form.show(event.source).then((result) => {
            if (result.canceled) {
                return
            } else {
                switch (result.selection){
                case 0:
                    dzialki(event.source);
                    break;
                case 1:
                    getMenu(event.source);
                    break;
                case 2:
                    openShop(event.source);
                    break;
                default:
                    console.warn("Nieznany 137/", result.selection);
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
            if (inventory.getItem(index).type.id == "skygen:book") {
                found = true;
                break;
            }
        }
    }

    if (!found) {
        player.dimension.runCommand(`give "${player.name}" skygen:book 1 0 {"keep_on_death": {},"item_lock": {"mode": "lock_in_inventory"}}`);
    }
})

