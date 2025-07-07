function calculateGeneratorStats(level) {
  // --- Konfiguracja Balansu ---
  const BASE_PRICE = 100;
  const PRICE_MULTIPLIER = 2.4;
  const BASE_PROFIT = 10;
  const PROFIT_MULTIPLIER = 1.85;

  // --- Obliczenia ---
  const price = BASE_PRICE * Math.pow(PRICE_MULTIPLIER, level - 1);
  const profit = BASE_PROFIT * Math.pow(PROFIT_MULTIPLIER, level - 1);

  return {
    price: Math.round(price),
    profit: Math.round(profit)
  };
}

// Dane wejściowe dla generatorów
const generators_data = [
    {"level": 1, "block_id": "hay_block", "item_id": "wheat", "textures": {"up": "hay_block_top", "down": "hay_block_top", "side": "hay_block_side"}},
    {"level": 2, "block_id": "coal_block", "item_id": "coal", "textures": "coal_block"},
    {"level": 3, "block_id": "dried_kelp_block", "item_id": "dried_kelp", "textures": {"up": "dried_kelp_top", "down": "dried_kelp_top", "side": "dried_kelp_side_a"}},
    {"level": 4, "block_id": "brick_block", "item_id": "brick", "textures": "brick"},
    {"level": 5, "block_id": "honeycomb_block", "item_id": "honeycomb", "textures": "honeycomb"},
    {"level": 6, "block_id": "copper_block", "item_id": "copper_ingot", "textures": "copper_block"},
    {"level": 7, "block_id": "iron_block", "item_id": "iron_ingot", "textures": "iron_block"},
    {"level": 8, "block_id": "slime", "item_id": "slime_ball", "itemTxt": "textures/items/slimeball", "textures": "slime"},
    {"level": 9, "block_id": "redstone_block", "item_id": "redstone", "itemTxt": "textures/items/redstone_dust", "textures": "redstone_block"},
    {"level": 10, "block_id": "gold_block", "item_id": "gold_ingot", "textures": "gold_block"},
    {"level": 11, "block_id": "nether_wart_block", "item_id": "nether_wart", "textures": "nether_wart_block"},
    {"level": 12, "block_id": "nether_brick", "item_id": "nether_brick", "itemTxt": "textures/items/netherbrick", "textures": "nether_brick"},
    {"level": 13, "block_id": "glowstone", "item_id": "glowstone_dust", "textures": "glowstone"},
    {"level": 14, "block_id": "quartz_block", "item_id": "quartz", "textures": {"up": "quartz_block_top", "down": "quartz_block_bottom", "side": "quartz_block_side"}},
    {"level": 15, "block_id": "amethyst_block", "item_id": "amethyst_shard", "textures": "amethyst_block"},
    {"level": 16, "block_id": "emerald_block", "item_id": "emerald", "textures": "emerald_block"},
    {"level": 17, "block_id": "diamond_block", "item_id": "diamond", "textures": "diamond_block"},
    {"level": 18, "block_id": "prismarine_bricks", "item_id": "prismarine_shard", "textures": "prismarine_bricks"},
    {"level": 19, "block_id": "ancient_debris", "item_id": "netherite_scrap", "textures": {"up": "ancient_debris_top", "down": "ancient_debris_top", "side": "ancient_debris_side"}},
    {"level": 20, "block_id": "netherite_block", "item_id": "netherite_ingot", "textures": "netherite_block"},
];

export default {
  "categories": [
    {
      "name": "Minerały",
      "icon": "textures/items/diamond",
      "items": [
        { "id": "minecraft:diamond", "priceBuy": 100, "priceSell": 70 },
        { "id": "minecraft:iron_ingot", "priceBuy": 40, "priceSell": 20 }
      ]
    },
    {
      "name": "Generatory",
      "icon": "textures/items/diamond_pickaxe",
      "prefix": "§gGenerator - §r",
      "items": generators_data.map(gen => {
        const stats = calculateGeneratorStats(gen.level);
        return {
          "id": `skygen:${gen.block_id}`,
          "langId": `${gen.langId || gen.block_id}`,
          "icon": `textures/blocks/skygen_${typeof gen.textures === 'string' ? gen.textures : (gen.textures.side || gen.textures.up)}`,
          "priceBuy": stats.price,
          "priceSell": Math.round(stats.price * 0.23)
        };
      })
    },
    {
      "name": "Produkty z Generatorów",
      "icon": "textures/items/emerald",
      "items": generators_data.map(gen => {
        const stats = calculateGeneratorStats(gen.level);
        return {
          "id": `minecraft:${gen.item_id}`,
          "priceSell": stats.profit,
          "icon": gen.itemTxt,
          "priceBuy": Math.round(stats.profit * 1.3)
        };
      })
    },
    {
      "name": "Zbroja",
      "icon": "textures/items/diamond_chestplate",
      "items": [
        { "id": "minecraft:netherite_helmet", "priceBuy": 10000, "priceSell": 7000 },
        { "id": "minecraft:netherite_chestplate", "priceBuy": 16000, "priceSell": 11200 },
        { "id": "minecraft:netherite_leggings", "priceBuy": 14000, "priceSell": 9800 },
        { "id": "minecraft:netherite_boots", "priceBuy": 8000, "priceSell": 5600 },
        { "id": "minecraft:diamond_helmet", "priceBuy": 2500, "priceSell": 1750 },
        { "id": "minecraft:diamond_chestplate", "priceBuy": 4000, "priceSell": 2800 },
        { "id": "minecraft:diamond_leggings", "priceBuy": 3500, "priceSell": 2450 },
        { "id": "minecraft:diamond_boots", "priceBuy": 2000, "priceSell": 1400 },
        { "id": "minecraft:golden_helmet", "icon": "textures/items/gold_helmet", "priceBuy": 375, "priceSell": 225 },
        { "id": "minecraft:golden_chestplate", "icon": "textures/items/gold_chestplate", "priceBuy": 600, "priceSell": 360 },
        { "id": "minecraft:golden_leggings", "icon": "textures/items/gold_leggings", "priceBuy": 525, "priceSell": 315 },
        { "id": "minecraft:golden_boots", "icon": "textures/items/gold_boots", "priceBuy": 300, "priceSell": 180 },
        { "id": "minecraft:iron_helmet", "priceBuy": 250, "priceSell": 150 },
        { "id": "minecraft:iron_chestplate", "priceBuy": 400, "priceSell": 240 },
        { "id": "minecraft:iron_leggings", "priceBuy": 350, "priceSell": 210 },
        { "id": "minecraft:iron_boots", "priceBuy": 200, "priceSell": 120 }
      ]
    },
    {
      "name": "Narzędzia i Broń",
      "icon": "textures/items/diamond_sword",
      "items": [
        { "id": "minecraft:netherite_sword", "priceBuy": 12000, "priceSell": 8400 },
        { "id": "minecraft:netherite_pickaxe", "priceBuy": 12000, "priceSell": 8400 },
        { "id": "minecraft:netherite_axe", "priceBuy": 10000, "priceSell": 7000 },
        { "id": "minecraft:netherite_shovel", "priceBuy": 6000, "priceSell": 4200 },
        { "id": "minecraft:netherite_hoe", "priceBuy": 4000, "priceSell": 2800 },
        { "id": "minecraft:diamond_sword", "priceBuy": 3000, "priceSell": 2100 },
        { "id": "minecraft:diamond_pickaxe", "priceBuy": 3000, "priceSell": 2100 },
        { "id": "minecraft:diamond_axe", "priceBuy": 2500, "priceSell": 1750 },
        { "id": "minecraft:diamond_shovel", "priceBuy": 1500, "priceSell": 1050 },
        { "id": "minecraft:diamond_hoe", "priceBuy": 1000, "priceSell": 700 },
        { "id": "minecraft:golden_sword", "icon": "textures/items/gold_sword", "priceBuy": 450, "priceSell": 270 },
        { "id": "minecraft:golden_pickaxe", "icon": "textures/items/gold_pickaxe", "priceBuy": 450, "priceSell": 270 },
        { "id": "minecraft:golden_axe", "icon": "textures/items/gold_axe", "priceBuy": 375, "priceSell": 225 },
        { "id": "minecraft:golden_shovel", "icon": "textures/items/gold_shovel", "priceBuy": 225, "priceSell": 135 },
        { "id": "minecraft:golden_hoe", "icon": "textures/items/gold_hoe", "priceBuy": 150, "priceSell": 90 },
        { "id": "minecraft:iron_sword", "priceBuy": 300, "priceSell": 180 },
        { "id": "minecraft:iron_pickaxe", "priceBuy": 300, "priceSell": 180 },
        { "id": "minecraft:iron_axe", "priceBuy": 250, "priceSell": 150 },
        { "id": "minecraft:iron_shovel", "priceBuy": 150, "priceSell": 90 },
        { "id": "minecraft:iron_hoe", "priceBuy": 100, "priceSell": 60 }
      ]
    },
    {
      "name": "Enchanty",
      "icon": "textures/items/book_enchanted",
      "items": [
        { "id": "minecraft:enchanted_book", "langId": "enchantment.mending", "priceBuy": 20000, "priceSell": 5000, "enchantments": [{ "id": "mending", "level": 1 }] },
        { "id": "minecraft:enchanted_book", "langId": "enchantment.lootBonusDigger,3", "priceBuy": 18000, "priceSell": 4500, "enchantments": [{ "id": "fortune", "level": 3 }] },
        { "id": "minecraft:enchanted_book", "langId": "enchantment.protect.all,4", "priceBuy": 10000, "priceSell": 2500, "enchantments": [{ "id": "protection", "level": 4 }] },
        { "id": "minecraft:enchanted_book", "langId": "enchantment.damage.all,5", "priceBuy": 12000, "priceSell": 3000, "enchantments": [{ "id": "sharpness", "level": 5 }] },
        { "id": "minecraft:enchanted_book", "langId": "enchantment.lootBonus,3", "priceBuy": 12000, "priceSell": 3000, "enchantments": [{ "id": "looting", "level": 3 }] },
        { "id": "minecraft:enchanted_book", "langId": "enchantment.digging,5", "priceBuy": 9000, "priceSell": 2200, "enchantments": [{ "id": "efficiency", "level": 5 }] },
        { "id": "minecraft:enchanted_book", "langId": "enchantment.durability,3", "priceBuy": 8000, "priceSell": 2000, "enchantments": [{ "id": "unbreaking", "level": 3 }] },
        { "id": "minecraft:enchanted_book", "langId": "enchantment.untouching", "priceBuy": 7500, "priceSell": 1800, "enchantments": [{ "id": "silk_touch", "level": 1 }] }
      ]
    },
    {
      "name": "Potki",
      "icon": "textures/items/potion_bottle_drinkable",
      "items": [
        { "id": "minecraft:potion", "langId": "potion.damageBoost.name", "priceBuy": 1200, "priceSell": 400, "potionData": { "effect": "strength", "modifier": "strong" } },
        { "id": "minecraft:potion", "langId": "potion.moveSpeed.name", "priceBuy": 800, "priceSell": 250, "potionData": { "effect": "speed", "modifier": "strong" } },
        { "id": "minecraft:potion", "langId": "potion.fireResistance.name", "priceBuy": 600, "priceSell": 200, "potionData": { "effect": "fire_resistance", "modifier": "long" } },
        { "id": "minecraft:splash_potion", "langId": "potion.heal.name", "priceBuy": 750, "priceSell": 250, "potionData": { "effect": "healing", "modifier": "strong", "liquid": "splash" } },
        { "id": "minecraft:splash_potion", "langId": "potion.harm.name", "priceBuy": 850, "priceSell": 280, "potionData": { "effect": "harming", "modifier": "strong", "liquid": "splash" } }
      ]
    }
  ]
}
