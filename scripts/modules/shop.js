// openShop.js
import { world, ItemStack, ItemType, ItemTypes, PotionEffectType, PotionLiquidType, PotionModifierType} from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import config from "./configShop.js";

const shopConfig = config?.default || config;

function openQuickSell(player) {
  const inventory = player.getComponent("inventory").container;
  const sellableItems = [];

  for (let i = 0; i < inventory.size; i++) {
    const slot = inventory.getItem(i);
    if (!slot) continue;

    const itemId = slot.typeId;
    console.warn(itemId)
      if (itemId === "minecraft:potion") {
        console.warn(slot.getComponent("minecraft:potion").potionEffectType.id);
      }
    for (const category of shopConfig.categories) {
      const match = category.items.find(it => it.id === itemId);
      if (match && !sellableItems.find(e => e.id === itemId)) {
        sellableItems.push(match);
      }
    }
  }

  if (sellableItems.length === 0) {
    player.sendMessage("§cNie masz żadnych przedmiotów, które można sprzedać.");
    openShop(player);
    return;
  }

  const form = new ActionFormData()
    .title("§lSprzedaż z ekwipunku")
    .body("§6Wybierz przedmiot do sprzedaży lub sprzedaj wszystko:");

  form.button("§l§cSprzedaj wszystko", "textures/ui/inventory_icon");

  for (const item of sellableItems) {
    const texture = item.icon || `textures/items/${item.id.split(":")[1]}.png`;
    form.button(getRawText(`<${item.id}>`), texture);
  }

  form.show(player).then((response) => {
    if (response.canceled) {
      openShop(player);
      return;
    }

    if (response.selection === 0) {
      sellAllItems(player, sellableItems);
      return;
    }

    const selectedItem = sellableItems[response.selection - 1]; // -1 bo pierwszy przycisk to "sprzedaj wszystko"
    showSummary(player, selectedItem, false, true, {}); // sprzedaż
  });
}
function sellAllItems(player, sellableItems) {
  const inventory = player.getComponent("inventory").container;
  const rankSell = getScore(player, "rankSell");
  let totalEarned = 0;
  let totalSold = 0;

  for (const item of sellableItems) {
    const priceSell = Math.floor(item.priceSell * (100 + rankSell) / 100);

    for (let i = 0; i < inventory.size; i++) {
      const slot = inventory.getItem(i);
      if (slot && slot.typeId === item.id) {
        const amount = slot.amount;
        totalEarned += amount * priceSell;
        totalSold += amount;
        inventory.setItem(i, undefined);
      }
    }
  }

  if (totalEarned > 0) {
    const currentMoney = getScore(player, "money");
    setScore(player, "money", currentMoney + totalEarned);
    player.sendMessage(`§aSprzedano ${totalSold} itemów za łącznie §a$${totalEarned}`);
  } else {
    player.sendMessage("§cNie udało się sprzedać żadnych itemów.");
  }

  openShop(player);
}


export function openShop(player) {
    new ActionFormData()
        .title(`§lSklep - Masz §2$${getScore(player, "money")}`)
        .body("Wybierz opcję:")
        .button("Sprzedaj", "textures/items/emerald")
        .button("Kup", "textures/items/gold_ingot.png")
        .button("Sprzedaj z ekwipunku", "textures/ui/inventory_icon")
        .show(player).then((response) => {
        if (response.canceled) return;
        if (response.selection === 2) {
            openQuickSell(player);
            return;
        }
        showCategories(player, response.selection == 1);
    });
}

function countAvailableSpaceForItem(inventory, itemStack) {
  const maxAmount = itemStack.maxAmount;
  let spaceLeft = 0;

  for (let i = 0; i < inventory.size; i++) {
    const slot = inventory.getItem(i);

    if (!slot) {
      // pusty slot - pełna pojemność
      spaceLeft += maxAmount;
      return maxAmount;
    } else if (slot.typeId === itemStack.typeId && slot.amount < maxAmount) {
      // częściowo zapełniony slot tego samego przedmiotu
      spaceLeft += (maxAmount - slot.amount);
    }

    // Zatrzymanie, jeśli już wystarczy miejsca
    if (spaceLeft >= maxAmount) {
      return maxAmount;
    }
  }

  // jeśli jest mniej miejsca niż itemStack.amount, zwróć tyle ile jest
  return spaceLeft;
}


function canFitAmount(inventory, itemStack) {
  const needed = itemStack.amount;
  let remaining = needed;

  for (let i = 0; i < inventory.size; i++) {
    const slot = inventory.getItem(i);

    if (!slot) {
      // pusty slot = pełna pojemność
      remaining -= itemStack.maxAmount;
    } else if (
      slot.typeId === itemStack.typeId &&
      slot.amount < slot.maxAmount
    ) {
      remaining -= slot.maxAmount - slot.amount;
    }

    if (remaining <= 0) return true;
  }

  return false;
}


function getScore(player, objective) {
  try {
    return world.scoreboard.getObjective(objective).getScore(player.scoreboardIdentity);
  } catch {
    return 0;
  }
}

function setScore(player, objective, value) {
    const obj = world.scoreboard.getObjective(objective);
    obj.setScore(player.scoreboardIdentity, value);
}

function showCategories(player, buy) {
  const form = new ActionFormData()
    .title(`§lSklep - Masz §2$${getScore(player, "money")}`)
    .body("Wybierz kategorię:");

  for (const category of shopConfig.categories) {
    const texture = category.icon || "textures/items/diamond.png";
    form.button(`${category.name}`, texture);
  }

  form.show(player).then((response) => {
    if (response.canceled) {
        openShop(player);
        return;
    }
    const category = shopConfig.categories[response.selection];
    showItems(player, category, buy);
  });
}

function showItems(player, category, buy) {
  const rankBuy = getScore(player, "rankBuy");
  const rankSell = getScore(player, "rankSell");

  const form = new ActionFormData()
    .title(`${category.name} - Masz §2$${getScore(player, "money")}`)
    .body("Wybierz item:");

  for (const item of category.items) {
    const texture = item.icon || `textures/items/${item.id.split(":")[1]}.png`;
    const priceBuy = Math.ceil(item.priceBuy * (100 - rankBuy) / 100);
    const priceSell = Math.floor(item.priceSell * (100 + rankSell) / 100);
    if (buy) {
        form.button(getRawText(`§2$${priceBuy}§r - ${category.prefix || ""}<${item.langId || item.id}>`), texture);
    }
    else {
        form.button(getRawText(`§4$${priceSell}§r - ${category.prefix || ""}<${item.langId || item.id}>`), texture);
    }
    
  }

  form.show(player).then((response) => {
    if (response.canceled) {
        showCategories(player, buy);
        return;
    }
    const item = category.items[response.selection];
    showSummary(player, item, buy, category);
  });
}

function showSummary(player, item, buy, category, quickSell) {
  const rankBuy = getScore(player, "rankBuy");
  const rankSell = getScore(player, "rankSell");

  const priceBuy = Math.ceil(item.priceBuy * (100 - rankBuy) / 100);
  const priceSell = Math.floor(item.priceSell * (100 + rankSell) / 100);

  const inventory = player.getComponent("inventory").container;
  let countInInventory = 0;
  for (let i = 0; i < inventory.size; i++) {
    const slot = inventory.getItem(i);
    if (slot && slot.typeId === item.id) {
      countInInventory += slot.amount;
    }
  }

  const money = getScore(player, "money");
ItemStack
    const tmpItem = new item.potion
        ? ItemStack.createPotion(item.potion)
        : new ItemStack(item.id, amount);
    const maxStack = tmpItem.maxAmount;

  const maxBuyAmount = Math.min(
    Math.floor(money / priceBuy),
    item.maxAmount || maxStack,
    countAvailableSpaceForItem(inventory, tmpItem)
  );
  const maxSellAmount = countInInventory;

  if (countAvailableSpaceForItem(inventory, tmpItem) <= 0 && buy) {
    player.sendMessage("§cNie masz wystarczająco miejsca w ekwipunku!");
    return;
  }

  if (buy) {
        if (money < priceBuy) {
            player.sendMessage("§cNie masz wystarczająco pieniędzy!");
            showItems(player, shopConfig.categories.find(cat => cat.items.includes(item)), buy);
            return;
        }
    }
    else {
        if (countInInventory === 0) {
            player.sendMessage("§cNie masz tego itemu w ekipunku!");
            showItems(player, shopConfig.categories.find(cat => cat.items.includes(item)), buy);
            return;
        }
    }
  const form = new ModalFormData()
    .title(`§lPodsumowanie - Masz §2$${getScore(player, "money")}`)
    .header(getRawText(`${buy ? "§aKupujesz§r" : "§4Sprzedajesz§r"} ${category.prefix || ""}<${item.langId || item.id}>`))
    .divider();
    if (buy) {
        form.label(getRawText(`Jeden ${category.prefix || ""}<${item.langId || item.id}> kosztuje §a$${priceBuy}.`));
    }
    else {
        form.label(getRawText(`${countInInventory}x <${item.langId || item.id}> sprzedasz za §a$${priceSell*countInInventory}.`));
    }
  const maxAmount = buy ? maxBuyAmount : maxSellAmount ;
  let deafultValue = 1;
    if (!buy) {
        deafultValue = Math.max(1, countInInventory);
    }
  form.slider("Ilość", 1, Math.max(1, maxAmount), { "defaultValue": deafultValue });
  form.submitButton("Potwierdź")
  form.show(player).then((response) => {
    if (response.canceled) {
        if (quickSell) {
            openQuickSell(player);
        } else {    
            showItems(player, shopConfig.categories.find(cat => cat.items.includes(item)), buy);
        }
        return;
    }

    const isSell = !buy;
    const amount = response.formValues[3];
    if (amount <= 0) {
        player.sendMessage("§cNieprawidłowa ilość!");
         showSummary(player, item, buy, category);
    return;
    }


    const finalPrice = isSell ? priceSell * amount : priceBuy * amount;
    if (isSell) {
      let leftToRemove = amount;
      let removed = 0;
      for (let i = 0; i < inventory.size; i++) {
        const slot = inventory.getItem(i);
        if (slot && slot.typeId === item.id) {
          const removeCount = Math.min(leftToRemove, slot.amount);
          if (slot.amount === removeCount) { 
            inventory.setItem(i, undefined);
          }
          else {
            slot.amount -= removeCount;
            inventory.setItem(i, slot);
          }
          removed += removeCount;
          leftToRemove -= removeCount;
          if (leftToRemove <= 0) break;
        }
      }
        if (removed === 0) {
            player.sendMessage("§cNie masz żadnych itemów do sprzedaży!");
            showItems(player, shopConfig.categories.find(cat => cat.items.includes(item)), buy);
            return;
        }
        if (removed < amount) {
        player.sendMessage(getRawText(`§cNie masz tyle itemów do sprzedaży! Sprzedano tylko ${removed}x <${item.id}>.`));
        }
        else {
            player.sendMessage(getRawText(`§4Sprzedano §f${removed}x <${item.langId || item.id}> za §a$${finalPrice}`));
        }
      setScore(player, "money", money + finalPrice);
    } else {
      if (money < finalPrice) {
        player.sendMessage("§cNie masz wystarczająco pieniędzy!");
        showItems(player, shopConfig.categories.find(cat => cat.items.includes(item)), buy);
        return;
      }
      
      const stack = item.potion
        ? ItemStack.createPotion(item.potion)
        : new ItemStack(item.id, amount);

      if (!canFitAmount(inventory, stack)) {
         player.sendMessage("§cNie masz wystarczająco miejsca w ekwipunku!");
         return;
      }

      setScore(player, "money", money - finalPrice);
      inventory.addItem(stack);
      player.sendMessage(getRawText(`§aKupiono §f${amount}x <${item.langId || item.id}> za §a$${finalPrice}`));
    }    
  });
}


/**
 * Zamienia string z <minecraft:diamond> na rawtext z tłumaczeniem itemu.
 * Przykład: getRawText("Kupiłeś <minecraft:diamond> za 20$")
 */

function getTranslatedName(itemId) {
    return "deprecated: Use getRawText instead -kot";
}
function getRawText(template) {
    const rawtext = [];
    // Regexp: znajdź <...>
    const regex = /(<([^>]+)>|\/<|\/>)/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(template)) !== null) {
        // Obsługa /< i /> jako dosłownych znaków
        if (match[0] === "/<") {
            if (match.index > lastIndex) {
                rawtext.push({ text: template.slice(lastIndex, match.index) });
            }
            rawtext.push({ text: "<" });
            lastIndex = regex.lastIndex;
            continue;
        }
        if (match[0] === "/>") {
            if (match.index > lastIndex) {
                rawtext.push({ text: template.slice(lastIndex, match.index) });
            }
            rawtext.push({ text: ">" });
            lastIndex = regex.lastIndex;
            continue;
        }
        // Dodaj tekst przed <>
        if (match.index > lastIndex) {
            rawtext.push({ text: template.slice(lastIndex, match.index) });
        }
        // Dodaj tłumaczenie itemu
        const id = match[2];
        if (id) {
            try {
                const type = ItemTypes.get(id);
                const item = new ItemStack(type);
                if (item.localizationKey) {
                    rawtext.push({ translate: item.localizationKey });
                } else {
                    rawtext.push({ text: id.replace("minecraft:", "").replace(/_/g, " ") });
                }
            } catch {
                rawtext.push({ translate: id });
                console.warn("catch!")
            }
        }
        lastIndex = regex.lastIndex;
    }
    // Dodaj tekst po ostatnim <>
    if (lastIndex < template.length) {
        rawtext.push({ text: template.slice(lastIndex) });
    }
    if (rawtext.length === 0) {
        rawtext.push({ text: "noData" });
    }
    return { rawtext };
}