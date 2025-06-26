/**
 * Oblicza cenę i zysk dla generatora na podstawie jego poziomu.
 *
 * @param {number} level Poziom generatora (liczba całkowita większa od 0).
 * @returns {{price: number, profit: number}|null} Obiekt z ceną i zyskiem, lub null jeśli poziom jest nieprawidłowy.
 */
function calculateGeneratorStats(level) {
  // Sprawdzenie, czy podany poziom jest prawidłową liczbą
  if (typeof level !== 'number' || level < 1 || !Number.isInteger(level)) {
    console.error("Poziom musi być liczbą całkowitą większą od 0.");
    return null;
  }

  // --- Konfiguracja Balansu ---
  // Te wartości możesz dostosować, aby zmienić krzywą progresji.

  // Cena bazowa dla generatora na poziomie 1
  const BASE_PRICE = 100;
  // Mnożnik wzrostu ceny. Każdy kolejny poziom będzie droższy o ten mnożnik.
  const PRICE_MULTIPLIER = 2.4;

  // --- Obliczenia ---
  // Wzór na wzrost wykładniczy: wartość = baza * (mnożnik ^ (poziom - 1))
  // Używamy (poziom - 1), aby dla poziomu 1 mnożnik był podniesiony do potęgi 0 (co daje 1)
  // i w rezultacie otrzymujemy wartości bazowe.

  const price = BASE_PRICE * Math.pow(PRICE_MULTIPLIER, level - 1);

  // Zwracamy zaokrąglone wartości, aby uniknąć liczb po przecinku.
  return Math.round(price);
}

export default {
  "categories": [
    {
      "name": "§9Minerały",
      "icon": "textures/items/diamond",
      "items": [
        {
          "id": "minecraft:diamond",
          "priceBuy": 100,
          "priceSell": 70
        },
        {
          "id": "minecraft:iron_ingot",
          "priceBuy": 40,
          "priceSell": 20
        }
      ]
    },
    {
      "name": "§9Generator",
      "icon": "textures/items/diamond_pickaxe",
      "items": [
        {
          "id": "skygen:diamond_generator",
          "priceBuy": calculateGeneratorStats(1),
          "priceSell": calculateGeneratorStats(1) * 0.23,
        },
        {
          "id": "generator:iron_generator",
          "priceBuy": 400,
          "priceSell": 200,
          "level": 1,
          "stats": calculateGeneratorStats(1)
        }
      ]
    }
  ]
}
