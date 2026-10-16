(() => {
  "use strict";

  const STORAGE_KEY = "adventurers-ledger.characters.v1";
  const ACTIVE_KEY = "adventurers-ledger.active-character.v1";
  const XP_THRESHOLDS = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
  const ABILITIES = [
    ["strength", "STR"], ["dexterity", "DEX"], ["constitution", "CON"],
    ["intelligence", "INT"], ["wisdom", "WIS"], ["charisma", "CHA"]
  ];
  const CLASSES = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];
  const BACKGROUNDS = ["Acolyte", "Charlatan", "Criminal", "Entertainer", "Folk Hero", "Guild Artisan", "Hermit", "Noble", "Outlander", "Sage", "Sailor", "Soldier", "Urchin", "Custom"];
  const ALIGNMENTS = ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil", "Unaligned"];
  const RACES = [
    { name: "Human", bonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 }, trait: "Versatile: +1 to all ability scores." },
    { name: "Variant Human", bonuses: {}, trait: "Variant heritage: +1 to two ability scores and one bonus feat." },
    { name: "High Elf", bonuses: { dexterity: 2, intelligence: 1 }, trait: "Darkvision, Fey Ancestry, and one wizard cantrip." },
    { name: "Wood Elf", bonuses: { dexterity: 2, wisdom: 1 }, trait: "Darkvision, Fey Ancestry, Fleet of Foot, and Mask of the Wild." },
    { name: "Dwarf", bonuses: { constitution: 2, wisdom: 1 }, trait: "Darkvision, Dwarven Resilience, and Stonecunning." },
    { name: "Hill Dwarf", bonuses: { constitution: 2, wisdom: 1 }, trait: "Darkvision, Dwarven Resilience, and Dwarven Toughness." },
    { name: "Lightfoot Halfling", bonuses: { dexterity: 2, charisma: 1 }, trait: "Lucky, Brave, Halfling Nimbleness, and Naturally Stealthy." },
    { name: "Stout Halfling", bonuses: { dexterity: 2, constitution: 1 }, trait: "Lucky, Brave, Halfling Nimbleness, and Stout Resilience." },
    { name: "Dragonborn", bonuses: { strength: 2, charisma: 1 }, trait: "Draconic ancestry, Breath Weapon, and damage resistance." },
    { name: "Forest Gnome", bonuses: { intelligence: 2, dexterity: 1 }, trait: "Darkvision, Gnome Cunning, and Speak with Small Beasts." },
    { name: "Half-Elf", bonuses: { charisma: 2 }, trait: "Darkvision, Fey Ancestry, and two flexible +1 ability bonuses." },
    { name: "Half-Orc", bonuses: { strength: 2, constitution: 1 }, trait: "Darkvision, Relentless Endurance, and Savage Attacks." },
    { name: "Tiefling", bonuses: { charisma: 2, intelligence: 1 }, trait: "Darkvision, Hellish Resistance, and Infernal Legacy." }
  ];
  const CLASS_BUILDS = {
    Barbarian: { hitDie: 12, priorities: ["strength", "constitution", "dexterity", "wisdom", "charisma", "intelligence"], saves: "Strength, Constitution", armor: "Unarmored Defense (10 + DEX + CON)", skills: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"], features: "Rage (2 uses); Unarmored Defense" },
    Bard: { hitDie: 8, priorities: ["charisma", "dexterity", "constitution", "wisdom", "intelligence", "strength"], saves: "Dexterity, Charisma", armor: "Leather armor (AC 11 + DEX)", skills: ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"], features: "Spellcasting; Bardic Inspiration (d6, 1 use)" },
    Cleric: { hitDie: 8, priorities: ["wisdom", "constitution", "strength", "charisma", "dexterity", "intelligence"], saves: "Wisdom, Charisma", armor: "Scale mail and shield (AC 16 + DEX, max 2)", skills: ["History", "Insight", "Medicine", "Persuasion", "Religion"], features: "Spellcasting; Divine Domain; domain feature" },
    Druid: { hitDie: 8, priorities: ["wisdom", "constitution", "dexterity", "intelligence", "charisma", "strength"], saves: "Intelligence, Wisdom", armor: "Leather armor and wooden shield (AC 11 + DEX + 2)", skills: ["Animal Handling", "Arcana", "Insight", "Medicine", "Nature", "Perception", "Religion", "Survival"], features: "Druidic; Spellcasting" },
    Fighter: { hitDie: 10, priorities: ["strength", "constitution", "dexterity", "wisdom", "charisma", "intelligence"], saves: "Strength, Constitution", armor: "Chain mail and shield (AC 18)", skills: ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"], features: "Fighting Style; Second Wind (1 use)" },
    Monk: { hitDie: 8, priorities: ["dexterity", "wisdom", "constitution", "strength", "intelligence", "charisma"], saves: "Strength, Dexterity", armor: "Unarmored Defense (10 + DEX + WIS)", skills: ["Acrobatics", "Athletics", "History", "Insight", "Religion", "Stealth"], features: "Unarmored Defense; Martial Arts (d4)" },
    Paladin: { hitDie: 10, priorities: ["strength", "charisma", "constitution", "wisdom", "dexterity", "intelligence"], saves: "Wisdom, Charisma", armor: "Chain mail and shield (AC 18)", skills: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"], features: "Divine Sense (5 uses); Lay on Hands (5 HP)" },
    Ranger: { hitDie: 10, priorities: ["dexterity", "wisdom", "constitution", "strength", "intelligence", "charisma"], saves: "Strength, Dexterity", armor: "Leather armor (AC 11 + DEX)", skills: ["Animal Handling", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"], features: "Favored Enemy; Natural Explorer" },
    Rogue: { hitDie: 8, priorities: ["dexterity", "constitution", "intelligence", "wisdom", "charisma", "strength"], saves: "Dexterity, Intelligence", armor: "Leather armor (AC 11 + DEX)", skills: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"], features: "Expertise; Sneak Attack (1d6); Thieves' Cant" },
    Sorcerer: { hitDie: 6, priorities: ["charisma", "constitution", "dexterity", "wisdom", "intelligence", "strength"], saves: "Constitution, Charisma", armor: "Unarmored (AC 10 + DEX)", skills: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"], features: "Spellcasting; Sorcerous Origin; origin feature" },
    Warlock: { hitDie: 8, priorities: ["charisma", "constitution", "dexterity", "wisdom", "intelligence", "strength"], saves: "Wisdom, Charisma", armor: "Leather armor (AC 11 + DEX)", skills: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"], features: "Otherworldly Patron; Pact Magic; patron feature" },
    Wizard: { hitDie: 6, priorities: ["intelligence", "constitution", "dexterity", "wisdom", "charisma", "strength"], saves: "Intelligence, Wisdom", armor: "Unarmored (AC 10 + DEX)", skills: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"], features: "Spellcasting; Arcane Recovery" }
  };
  const SKILLS = [
    ["Acrobatics", "dexterity"], ["Animal Handling", "wisdom"], ["Arcana", "intelligence"],
    ["Athletics", "strength"], ["Deception", "charisma"], ["History", "intelligence"],
    ["Insight", "wisdom"], ["Intimidation", "charisma"], ["Investigation", "intelligence"],
    ["Medicine", "wisdom"], ["Nature", "intelligence"], ["Perception", "wisdom"],
    ["Performance", "charisma"], ["Persuasion", "charisma"], ["Religion", "intelligence"],
    ["Sleight of Hand", "dexterity"], ["Stealth", "dexterity"], ["Survival", "wisdom"]
  ];
  const WEAPON_DAMAGE = {
    "greataxe": ["1d12", "strength"], "handaxe": ["1d6", "strength"], "javelin": ["1d6", "strength"],
    "longsword": ["1d8", "strength"], "shortsword": ["1d6", "finesse"], "rapier": ["1d8", "finesse"],
    "scimitar": ["1d6", "finesse"], "dagger": ["1d4", "finesse"], "quarterstaff": ["1d6", "strength"],
    "mace": ["1d6", "strength"], "spear": ["1d6", "strength"], "maul": ["2d6", "strength"],
    "greatsword": ["2d6", "strength"], "battleaxe": ["1d8", "strength"], "warhammer": ["1d8", "strength"],
    "shortbow": ["1d6", "dexterity"], "longbow": ["1d8", "dexterity"], "light crossbow": ["1d8", "dexterity"],
    "heavy crossbow": ["1d10", "dexterity"], "dart": ["1d4", "finesse"], "unarmed strike": ["1", "strength"]
  };
  const SPELLCASTING_ABILITIES = {
    Bard: "charisma", Cleric: "wisdom", Druid: "wisdom", Paladin: "charisma",
    Ranger: "wisdom", Sorcerer: "charisma", Warlock: "charisma", Wizard: "intelligence"
  };
  const ASI_LEVELS = {
    Barbarian: [4, 8, 12, 16, 19],
    Bard: [4, 8, 12, 16, 19],
    Cleric: [4, 8, 12, 16, 19],
    Druid: [4, 8, 12, 16, 19],
    Fighter: [4, 6, 8, 12, 14, 16, 19],
    Monk: [4, 8, 12, 16, 19],
    Paladin: [4, 8, 12, 16, 19],
    Ranger: [4, 8, 12, 16, 19],
    Rogue: [4, 8, 10, 12, 16, 19],
    Sorcerer: [4, 8, 12, 16, 19],
    Warlock: [4, 8, 12, 16, 19],
    Wizard: [4, 8, 12, 16, 19]
  };
  const BACKGROUND_BUILDS = {
    Acolyte: { feature: "Shelter of the Faithful", skills: ["Insight", "Religion"], gear: ["Holy symbol", "Prayer book", "Incense"] },
    Charlatan: { feature: "False Identity", skills: ["Deception", "Sleight of Hand"], gear: ["Disguise kit", "Forgery kit"] },
    Criminal: { feature: "Criminal Contact", skills: ["Deception", "Stealth"], gear: ["Thieves' tools", "Dark clothes"] },
    Entertainer: { feature: "By Popular Demand", skills: ["Acrobatics", "Performance"], gear: ["Musical instrument", "Costume"] },
    "Folk Hero": { feature: "Rustic Hospitality", skills: ["Animal Handling", "Survival"], gear: ["Artisan's tools", "Shovel"] },
    "Guild Artisan": { feature: "Guild Membership", skills: ["Insight", "Persuasion"], gear: ["Artisan's tools", "Guild letter"] },
    Hermit: { feature: "Discovery", skills: ["Medicine", "Religion"], gear: ["Herbalism kit", "Scroll case"] },
    Noble: { feature: "Position of Privilege", skills: ["History", "Persuasion"], gear: ["Fine clothes", "Signet ring"] },
    Outlander: { feature: "Wanderer", skills: ["Athletics", "Survival"], gear: ["Hunting trap", "Staff"] },
    Sage: { feature: "Researcher", skills: ["Arcana", "History"], gear: ["Ink and quill", "Small knife"] },
    Sailor: { feature: "Ship's Passage", skills: ["Athletics", "Perception"], gear: ["Navigator's tools", "Rope"] },
    Soldier: { feature: "Military Rank", skills: ["Athletics", "Intimidation"], gear: ["Gaming set", "Military insignia"] },
    Urchin: { feature: "City Secrets", skills: ["Sleight of Hand", "Stealth"], gear: ["Disguise kit", "Small pet"] },
    Custom: { feature: "A story yet to be written", skills: [], gear: [] }
  };
  const SUBCLASSES = {
    Cleric: ["Life Domain", "Light Domain", "Knowledge Domain", "Nature Domain", "Tempest Domain", "Trickery Domain", "War Domain"],
    Sorcerer: ["Draconic Bloodline", "Wild Magic"],
    Warlock: ["The Archfey", "The Fiend", "The Great Old One"]
  };
  const HUMAN_FEATS = ["Alert", "Athlete", "Actor", "Charger", "Crossbow Expert", "Defensive Duelist", "Dual Wielder", "Dungeon Delver", "Durable", "Grappler", "Great Weapon Master", "Healer", "Inspiring Leader", "Keen Mind", "Linguist", "Lucky", "Mage Slayer", "Magic Initiate", "Martial Adept", "Mobile", "Mounted Combatant", "Observant", "Polearm Master", "Resilient", "Ritual Caster", "Savage Attacker", "Sentinel", "Sharpshooter", "Shield Master", "Skilled", "Skulker", "Spell Sniper", "Tavern Brawler", "Tough", "War Caster"];
  const FIRST_NAMES = ["Aelar", "Bryn", "Dara", "Eira", "Fen", "Galen", "Hana", "Ivo", "Jora", "Kael", "Lira", "Mira", "Neris", "Orin", "Perrin", "Quinn", "Runa", "Soren", "Tamsin", "Vale", "Wren", "Yara", "Zev"];
  const LAST_NAMES = ["Ashford", "Brightwood", "Dawnstrider", "Emberfall", "Frostvale", "Greenbriar", "Hollowmere", "Ironwood", "Moonwhisper", "Oakenshield", "Ravencrest", "Silverleaf", "Stormborn", "Thornwood", "Windwalker"];
  const CLASS_GEAR = {
    Cleric: [["Mace", 1, 4, true], ["Scale mail", 1, 45, true], ["Shield", 1, 6, true], ["Priest's pack", 1, 24, false]],
    Druid: [["Wooden shield", 1, 10, true], ["Scimitar", 1, 3, true], ["Leather armor", 1, 10, true], ["Explorer's pack", 1, 59, false]],
    Fighter: [["Longsword", 1, 3, true], ["Shield", 1, 6, true], ["Chain mail", 1, 55, true], ["Explorer's pack", 1, 59, false]],
    Paladin: [["Longsword", 1, 3, true], ["Shield", 1, 6, true], ["Chain mail", 1, 55, true], ["Priest's pack", 1, 24, false]]
  };
  const STARTING_GEAR = {
    Barbarian: [["Greataxe", 1, 7, true], ["Handaxes", 2, 2, true], ["Explorer's pack", 1, 59, false], ["Javelins", 4, 8, false]],
    Bard: [["Rapier", 1, 2, true], ["Lute", 1, 2, false], ["Leather armor", 1, 10, true], ["Diplomat's pack", 1, 46, false]],
    Cleric: [["Mace", 1, 4, true], ["Scale mail", 1, 45, true], ["Shield", 1, 6, true], ["Priest's pack", 1, 24, false]],
    Druid: [["Wooden shield", 1, 10, true], ["Scimitar", 1, 3, true], ["Leather armor", 1, 10, true], ["Explorer's pack", 1, 59, false]],
    Fighter: [["Longsword", 1, 3, true], ["Shield", 1, 6, true], ["Chain mail", 1, 55, true], ["Explorer's pack", 1, 59, false]],
    Monk: [["Shortsword", 1, 2, true], ["Dart", 10, 0.25, true], ["Explorer's pack", 1, 59, false]],
    Paladin: [["Longsword", 1, 3, true], ["Shield", 1, 6, true], ["Chain mail", 1, 55, true], ["Priest's pack", 1, 24, false]],
    Ranger: [["Longbow", 1, 2, true], ["Arrows", 20, 0.05, false], ["Leather armor", 1, 10, true], ["Explorer's pack", 1, 59, false]],
    Rogue: [["Rapier", 1, 2, true], ["Shortbow", 1, 2, true], ["Arrows", 20, 0.05, false], ["Burglar's pack", 1, 47, false], ["Leather armor", 1, 10, true]],
    Sorcerer: [["Light crossbow", 1, 5, true], ["Bolts", 20, 0.075, false], ["Component pouch", 1, 2, false], ["Explorer's pack", 1, 59, false]],
    Warlock: [["Light crossbow", 1, 5, true], ["Bolts", 20, 0.075, false], ["Component pouch", 1, 2, false], ["Scholar's pack", 1, 10, false]],
    Wizard: [["Quarterstaff", 1, 4, true], ["Spellbook", 1, 3, false], ["Component pouch", 1, 2, false], ["Scholar's pack", 1, 10, false]]
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let toastTimer;

  function starterInventory(className) {
    return (STARTING_GEAR[className] || STARTING_GEAR.Fighter)
      .map(([item, quantity, weight, equipped]) => ({ id: uid(), item, quantity, weight, equipped }));
  }

  function hasUntouchedStarterGear(character) {
    const expected = STARTING_GEAR[character.className] || STARTING_GEAR.Fighter;
    return character.inventory.length === expected.length && character.inventory.every((item, index) => {
      const [name, quantity, weight, equipped] = expected[index];
      return item.item === name && item.quantity === quantity && item.weight === weight && item.equipped === equipped;
    });
  }

  function makeCharacter(name = "New Adventurer", className = "Fighter") {
    return {
      id: uid(), name, className, subclass: "", level: 1, race: "", background: "Custom", alignment: "Unaligned",
      xp: 0, maxHp: 10, currentHp: 10, ac: 10, speed: 30, gold: 0, feats: "", proficiencies: "", features: "", notes: "",
      abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      asiChoicesUsed: [], asiProgress: {},
      inventory: starterInventory(className)
    };
  }

  function pick(values) {
    return values[Math.floor(Math.random() * values.length)];
  }

  function rollAbilityScore() {
    const dice = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 6)).sort((a, b) => a - b);
    return dice[1] + dice[2] + dice[3];
  }

  function chooseDistinct(values, count) {
    const remaining = [...values];
    const chosen = [];
    while (chosen.length < count && remaining.length) {
      chosen.push(remaining.splice(Math.floor(Math.random() * remaining.length), 1)[0]);
    }
    return chosen;
  }

  function makeGachaCharacter() {
    const className = pick(CLASSES);
    const build = CLASS_BUILDS[className];
    const background = pick(BACKGROUNDS.filter((entry) => entry !== "Custom"));
    const race = pick(RACES);
    const character = makeCharacter(`${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`, className);

    const rolledScores = Array.from({ length: ABILITIES.length }, rollAbilityScore).sort((a, b) => b - a);
    character.abilities = {};
    build.priorities.forEach((ability, index) => {
      character.abilities[ability] = rolledScores[index];
    });

    const racialBonuses = { ...race.bonuses };
    if (race.name === "Variant Human") {
      chooseDistinct(build.priorities, 2).forEach((ability) => { racialBonuses[ability] = 1; });
      character.feats = pick(HUMAN_FEATS);
    } else if (race.name === "Half-Elf") {
      chooseDistinct(build.priorities.filter((ability) => ability !== "charisma"), 2)
        .forEach((ability) => { racialBonuses[ability] = 1; });
    }
    for (const [ability, bonus] of Object.entries(racialBonuses)) {
      character.abilities[ability] = Math.min(20, character.abilities[ability] + bonus);
    }

    character.race = race.name;
    character.background = background;
    character.alignment = pick(ALIGNMENTS.filter((entry) => entry !== "Unaligned"));
    const backgroundBuild = BACKGROUND_BUILDS[background];
    const skillCount = className === "Bard" ? 3 : 2;
    const classSkills = chooseDistinct(build.skills, skillCount);
    const domain = SUBCLASSES[className] ? pick(SUBCLASSES[className]) : "";
    character.subclass = domain;

    let features = [build.features, race.trait, `Background feature: ${backgroundBuild.feature}`];
    if (className === "Fighter") features.push(`Fighting Style: ${pick(["Archery", "Defense", "Dueling", "Great Weapon Fighting", "Protection", "Two-Weapon Fighting"])}`);
    if (className === "Paladin") features.push(`Fighting Style: ${pick(["Defense", "Dueling", "Great Weapon Fighting", "Protection"])}`);
    if (className === "Ranger") features.push(`Fighting Style: ${pick(["Archery", "Defense", "Dueling", "Two-Weapon Fighting"])}`);
    if (race.name === "Variant Human") features.push(`Bonus feat: ${character.feats}`);
    character.features = features.join("\n");
    character.proficiencies = `Saving throws: ${build.saves}\nSkills: ${[...classSkills, ...backgroundBuild.skills].join(", ")}\nWeapons/armor: ${className} starting proficiencies`;
    character.notes = pick([
      "A half-finished map points toward a place no one remembers.",
      "Someone from your past has started asking for you by name.",
      "You owe a debt that cannot be repaid with gold.",
      "A strange mark appeared overnight and matches an old prophecy.",
      "You promised to bring someone home, no matter the cost.",
      "You carry a sealed letter you have never dared to open."
    ]);

    const constitutionModifier = abilityModifier(character.abilities.constitution);
    character.maxHp = Math.max(1, build.hitDie + constitutionModifier + (race.name === "Hill Dwarf" ? 1 : 0));
    character.currentHp = character.maxHp;
    const dexterityModifier = abilityModifier(character.abilities.dexterity);
    if (className === "Barbarian") character.ac = 10 + dexterityModifier + constitutionModifier;
    else if (className === "Monk") character.ac = 10 + dexterityModifier + abilityModifier(character.abilities.wisdom);
    else if (className === "Cleric") character.ac = 14 + Math.min(2, dexterityModifier) + 2;
    else if (["Fighter", "Paladin"].includes(className)) character.ac = 18;
    else if (className === "Druid") character.ac = 13 + dexterityModifier;
    else if (["Bard", "Ranger", "Rogue", "Warlock"].includes(className)) character.ac = 11 + dexterityModifier;
    else character.ac = 10 + dexterityModifier;

    const classGear = CLASS_GEAR[className] || STARTING_GEAR[className] || STARTING_GEAR.Fighter;
    character.inventory = starterInventory(className);
    if (CLASS_GEAR[className]) {
      character.inventory = classGear.map(([item, quantity, weight, equipped]) => ({ id: uid(), item, quantity, weight, equipped }));
    }
    for (const item of backgroundBuild.gear) {
      character.inventory.push({ id: uid(), item, quantity: 1, weight: 1, equipped: false });
    }
    character.gold = 5 + Math.floor(Math.random() * 16);
    syncDerivedStats(character);
    return character;
  }

  function normalizeCharacter(value) {
    if (!value || typeof value !== "object" || typeof value.name !== "string") return null;
    const defaults = makeCharacter(value.name, CLASSES.includes(value.className) ? value.className : "Fighter");
    const numeric = (candidate, fallback, min, max = Number.MAX_SAFE_INTEGER) => {
      const number = Number(candidate);
      return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.trunc(number))) : fallback;
    };
    const abilities = {};
    for (const [key] of ABILITIES) abilities[key] = numeric(value.abilities?.[key], 10, 1, 30);
    const inventory = Array.isArray(value.inventory) ? value.inventory.filter((item) => item && typeof item.item === "string").map((item) => ({
      id: typeof item.id === "string" ? item.id : uid(),
      item: item.item.slice(0, 80),
      quantity: numeric(item.quantity, 1, 1, 99999),
      weight: Math.max(0, Number.isFinite(Number(item.weight)) ? Number(item.weight) : 0),
      equipped: Boolean(item.equipped)
    })) : defaults.inventory;
    const normalized = { ...defaults, ...value, id: typeof value.id === "string" ? value.id : uid(), abilities, inventory };
    normalized.className = CLASSES.includes(normalized.className) ? normalized.className : "Fighter";
    normalized.level = numeric(normalized.level, 1, 1, 20);
    normalized.xp = numeric(normalized.xp, 0, 0);
    normalized.maxHp = numeric(normalized.maxHp, 1, 1);
    normalized.currentHp = numeric(normalized.currentHp, 0, 0, normalized.maxHp);
    normalized.ac = numeric(normalized.ac, 10, 0);
    normalized.speed = numeric(normalized.speed, 30, 0);
    normalized.gold = numeric(normalized.gold, 0, 0);
    const validAsiLevels = new Set(ASI_LEVELS[normalized.className] || ASI_LEVELS.Fighter);
    normalized.asiChoicesUsed = [...new Set(
      (Array.isArray(value.asiChoicesUsed) ? value.asiChoicesUsed : [])
        .map((level) => numeric(level, 0, 1, 20))
        .filter((level) => validAsiLevels.has(level))
    )];
    normalized.asiProgress = {};
    const rawAsiProgress = value.asiProgress && typeof value.asiProgress === "object" && !Array.isArray(value.asiProgress)
      ? value.asiProgress
      : {};
    for (const [rawLevel, progress] of Object.entries(rawAsiProgress)) {
      const level = numeric(rawLevel, 0, 1, 20);
      if (!validAsiLevels.has(level) || normalized.asiChoicesUsed.includes(level) || !progress || typeof progress !== "object") continue;
      const mode = ["single", "split"].includes(progress.mode) ? progress.mode : "";
      const rawAllocations = progress.allocations && typeof progress.allocations === "object" && !Array.isArray(progress.allocations)
        ? progress.allocations
        : {};
      const allocations = {};
      for (const [ability, points] of Object.entries(rawAllocations)) {
        if (!ABILITIES.some(([key]) => key === ability) || (mode === "single" && Number(points) !== 2) || (mode === "split" && Number(points) !== 1)) continue;
        allocations[ability] = Number(points);
        if (mode === "single") break;
      }
      const total = Object.values(allocations).reduce((sum, points) => sum + points, 0);
      if (total >= 2) normalized.asiChoicesUsed.push(level);
      else if (mode) normalized.asiProgress[level] = { mode, allocations };
    }
    for (const key of ["name", "subclass", "race", "background", "alignment", "feats", "proficiencies", "features", "notes"]) {
      if (typeof normalized[key] !== "string") normalized[key] = defaults[key];
    }
    return normalized;
  }

  function loadCharacters() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(saved)) throw new Error("Saved character data must be a list.");
      const result = saved.map(normalizeCharacter).filter(Boolean);
      return result.length ? result : [makeCharacter("Aelar Thornwood", "Fighter")];
    } catch (error) {
      console.error("Could not load saved characters:", error);
      showToast("Saved characters could not be loaded. A new character was created.");
      return [makeCharacter("Aelar Thornwood", "Fighter")];
    }
  }

  let characters = loadCharacters();
  characters.forEach(syncDerivedStats);
  let activeId = localStorage.getItem(ACTIVE_KEY);
  if (!characters.some((character) => character.id === activeId)) activeId = characters[0].id;
  let activeView = "overview";
  let active = () => characters.find((character) => character.id === activeId);

  function saveCharacters() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
      localStorage.setItem(ACTIVE_KEY, activeId);
      $("#save-status").textContent = "All changes saved in this browser.";
    } catch (error) {
      console.error("Could not save characters:", error);
      $("#save-status").textContent = "Unable to save. Your browser storage may be full.";
      showToast("Could not save changes to this browser.");
    }
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function abilityModifier(score) {
    return Math.floor((score - 10) / 2);
  }

  function signed(value) {
    return value >= 0 ? `+${value}` : String(value);
  }

  function proficiencyBonus(level) {
    return Math.floor((level - 1) / 4) + 2;
  }

  function skillProficiencies(character) {
    const line = String(character.proficiencies || "").split(/\r?\n/).find((entry) => /^skills:/i.test(entry));
    return new Set((line ? line.slice(line.indexOf(":") + 1) : "").split(",").map((skill) => skill.trim().toLowerCase()).filter(Boolean));
  }

  function savingThrowProficiencies(character) {
    const line = String(character.proficiencies || "").split(/\r?\n/).find((entry) => /^saving throws:/i.test(entry));
    const saves = line ? line.slice(line.indexOf(":") + 1) : (CLASS_BUILDS[character.className] || CLASS_BUILDS.Fighter).saves;
    return new Set(saves.split(",").map((ability) => ability.trim().toLowerCase()));
  }

  function calculatedMaxHp(character) {
    const hitDie = (CLASS_BUILDS[character.className] || CLASS_BUILDS.Fighter).hitDie;
    const constitution = abilityModifier(character.abilities.constitution);
    const hillDwarfBonus = character.race === "Hill Dwarf" ? 1 : 0;
    const toughBonus = /\btough\b/i.test(character.feats) ? 2 : 0;
    const level = Math.max(1, character.level);
    const firstLevel = Math.max(1, hitDie + constitution);
    const laterLevels = Math.max(1, Math.floor(hitDie / 2) + 1 + constitution);
    return firstLevel + (level - 1) * (laterLevels + hillDwarfBonus + toughBonus) + hillDwarfBonus + toughBonus;
  }

  function calculatedArmorClass(character) {
    const dexterity = abilityModifier(character.abilities.dexterity);
    const equipped = character.inventory.filter((item) => item.equipped).map((item) => item.item.toLowerCase());
    const armor = equipped.find((item) => /chain mail|splint armor|plate armor|scale mail|breastplate|half plate|hide armor|studded leather|leather armor|padded armor/.test(item));
    const shield = equipped.some((item) => item.includes("shield")) ? 2 : 0;
    if (armor?.includes("chain mail")) return 16 + shield;
    if (armor?.includes("splint armor")) return 17 + shield;
    if (armor?.includes("plate armor")) return 18 + shield;
    if (armor?.includes("scale mail") || armor?.includes("breastplate")) return 14 + Math.min(2, dexterity) + shield;
    if (armor?.includes("half plate")) return 15 + Math.min(2, dexterity) + shield;
    if (armor?.includes("hide armor")) return 12 + Math.min(2, dexterity) + shield;
    if (armor?.includes("studded leather")) return 12 + dexterity + shield;
    if (armor?.includes("leather armor")) return 11 + dexterity + shield;
    if (armor?.includes("padded armor")) return 11 + dexterity + shield;
    if (character.className === "Barbarian") return 10 + dexterity + abilityModifier(character.abilities.constitution) + shield;
    if (character.className === "Monk") return 10 + dexterity + abilityModifier(character.abilities.wisdom);
    return 10 + dexterity + shield;
  }

  function syncDerivedStats(character) {
    const previousMax = Math.max(1, Number(character.maxHp) || 1);
    const previousCurrent = Math.max(0, Number(character.currentHp) || 0);
    const missingHp = Math.max(0, previousMax - previousCurrent);
    character.maxHp = calculatedMaxHp(character);
    character.currentHp = Math.max(0, character.maxHp - missingHp);
    character.ac = calculatedArmorClass(character);
  }

  function derivedCombat(character) {
    const proficiency = proficiencyBonus(character.level);
    const dexterity = abilityModifier(character.abilities.dexterity);
    const saveProficiencies = savingThrowProficiencies(character);
    const skillsProficient = skillProficiencies(character);
    const attacks = character.inventory
      .filter((item) => item.equipped)
      .map((item) => {
        const key = item.item.toLowerCase().replace(/s$/, "");
        const definition = WEAPON_DAMAGE[key];
        if (!definition) return null;
        const [damage, ability] = definition;
        const attackAbility = ability === "finesse"
          ? (character.abilities.dexterity > character.abilities.strength ? "dexterity" : "strength")
          : ability;
        const modifier = abilityModifier(character.abilities[attackAbility]);
        return {
          name: item.item,
          toHit: proficiency + modifier,
          damage: `${damage}${modifier >= 0 ? "+" : ""}${modifier}`,
          ability: attackAbility
        };
      })
      .filter(Boolean);
    if (!attacks.length) {
      const modifier = abilityModifier(character.abilities.strength);
      attacks.push({ name: "Unarmed strike", toHit: proficiency + modifier, damage: `1${modifier >= 0 ? "+" : ""}${modifier}`, ability: "strength" });
    }
    const spellAbility = SPELLCASTING_ABILITIES[character.className]
      && (!["Paladin", "Ranger"].includes(character.className) || character.level >= 2)
      ? SPELLCASTING_ABILITIES[character.className]
      : null;
    const saves = ABILITIES.map(([ability, shortName]) => ({
      ability: shortName,
      bonus: abilityModifier(character.abilities[ability]) + (saveProficiencies.has(ability) ? proficiency : 0),
      proficient: saveProficiencies.has(ability)
    }));
    const skills = SKILLS.map(([name, ability]) => ({
      name,
      ability,
      bonus: abilityModifier(character.abilities[ability]) + (skillsProficient.has(name.toLowerCase()) ? proficiency : 0),
      proficient: skillsProficient.has(name.toLowerCase())
    }));
    return {
      proficiency,
      attacks,
      saves,
      skills,
      perception: 10 + abilityModifier(character.abilities.wisdom) + (skillsProficient.has("perception") ? proficiency : 0),
      spellcasting: spellAbility ? {
        ability: spellAbility,
        attack: proficiency + abilityModifier(character.abilities[spellAbility]),
        dc: 8 + proficiency + abilityModifier(character.abilities[spellAbility])
      } : null
    };
  }

  function levelFromXp(xp) {
    let level = 1;
    for (let index = 1; index < XP_THRESHOLDS.length; index += 1) {
      if (xp < XP_THRESHOLDS[index]) break;
      level = index + 1;
    }
    return level;
  }

  function renderCharacterList() {
    $("#character-list").innerHTML = characters.map((character) => `
      <div class="character-entry-wrap">
        <button class="character-entry ${character.id === activeId ? "selected" : ""}" data-character="${escapeHtml(character.id)}">
          <span class="character-avatar">${escapeHtml(character.name.trim().charAt(0).toUpperCase() || "?")}</span>
          <span class="character-entry-text"><strong>${escapeHtml(character.name)}</strong><small>Lvl ${character.level} ${escapeHtml(character.className)}</small></span>
        </button>
        <button class="character-delete" data-delete-character="${escapeHtml(character.id)}" aria-label="Hapus ${escapeHtml(character.name)}" title="Hapus karakter" ${characters.length === 1 ? "disabled" : ""}>×</button>
      </div>`).join("");
  }

  function renderAbilities() {
    const character = active();
    renderAbilityCards();
    $("#ability-inputs").innerHTML = ABILITIES.map(([key, shortName]) => {
      const score = Number(character.abilities[key]) || 10;
      return `<div class="ability-input"><label for="ability-${key}">${shortName}</label><input id="ability-${key}" data-ability="${key}" type="number" min="1" max="30" value="${score}" aria-label="${shortName} score"><small>Modifier ${signed(abilityModifier(score))}</small></div>`;
    }).join("");
  }

  function renderAbilityCards() {
    const character = active();
    $("#ability-cards").innerHTML = ABILITIES.map(([key, shortName]) => {
      const score = Number(character.abilities[key]) || 10;
      return `<div class="ability-card"><span>${shortName}</span><strong>${score}</strong><small>${signed(abilityModifier(score))}</small></div>`;
    }).join("");
  }

  function asiMilestones(character) {
    return ASI_LEVELS[character.className] || ASI_LEVELS.Fighter;
  }

  function renderAsiProgress() {
    const character = active();
    const milestones = asiMilestones(character);
    const used = new Set(character.asiChoicesUsed);
    const available = milestones.filter((level) => level <= character.level && !used.has(level));
    const container = $("#asi-content");
    if (!available.length) {
      const nextMilestone = milestones.find((level) => level > character.level);
      if (!nextMilestone) {
        container.innerHTML = '<p class="asi-status">Semua peningkatan ability score sampai level ini sudah digunakan.</p>';
        return;
      }
      const hitDie = (CLASS_BUILDS[character.className] || CLASS_BUILDS.Fighter).hitDie;
      const averageHitDie = Math.floor(hitDie / 2) + 1;
      const constitutionBonus = abilityModifier(character.abilities.constitution);
      const hpGain = Math.max(1, averageHitDie + constitutionBonus);
      container.innerHTML = `<div class="next-level-card"><div><strong>Level berikutnya: ${character.level + 1}</strong><span>HP maksimum bertambah sekitar +${hpGain} (rata-rata d${hitDie} ${signed(constitutionBonus)} CON).</span></div><div><strong>ASI berikutnya: level ${nextMilestone}</strong><span>Saat level ${nextMilestone}, dapat 2 poin: +2 ke satu ability atau +1 ke dua ability berbeda.</span></div></div>`;
      return;
    }
    container.innerHTML = available.map((level) => {
      const progress = character.asiProgress[level] && typeof character.asiProgress[level] === "object"
        ? character.asiProgress[level]
        : { mode: "", allocations: {} };
      const allocations = progress.allocations && typeof progress.allocations === "object" ? progress.allocations : {};
      const totalAllocated = Object.values(allocations).reduce((sum, points) => sum + Math.max(0, Number(points) || 0), 0);
      const mode = ["single", "split"].includes(progress.mode) ? progress.mode : "";
      const remaining = Math.max(0, 2 - totalAllocated);
      const choices = ABILITIES.map(([ability, abbreviation]) => {
        const score = Number(character.abilities[ability]) || 10;
        const points = Number(allocations[ability]) || 0;
        const alreadyUsed = mode === "split" && points > 0;
        const increment = mode === "single" ? 2 : 1;
        const disabled = !mode || remaining === 0 || score + increment > 20 || alreadyUsed;
        return `<button class="asi-choice" data-asi-level="${level}" data-asi-ability="${ability}" ${disabled ? "disabled" : ""}><span>${abbreviation}</span><strong>${score}</strong><small>${points ? `+${points} allocated` : mode ? `+${increment}` : "Choose mode first"}</small></button>`;
      }).join("");
      return `<div class="asi-award" data-asi-award="${level}">
        <div class="asi-award-heading"><strong>Level ${level} improvement</strong><span>${remaining ? `${remaining} point${remaining === 1 ? "" : "s"} left` : "Complete"}</span></div>
        <div class="asi-modes"><button class="asi-mode ${mode === "single" ? "selected" : ""}" data-asi-mode="single" data-asi-level="${level}" ${totalAllocated ? "disabled" : ""}>+2 to one stat</button><button class="asi-mode ${mode === "split" ? "selected" : ""}" data-asi-mode="split" data-asi-level="${level}" ${totalAllocated ? "disabled" : ""}>+1 to two stats</button></div>
        <div class="asi-choices">${choices}</div>
        ${totalAllocated && remaining > 0 ? `<button class="asi-reset" data-asi-reset="${level}">Undo point allocation</button>` : ""}
        ${remaining === 0 ? '<p class="asi-complete">Poin selesai dialokasikan dan tersimpan.</p>' : ""}
      </div>`;
    }).join("");
  }

  function renderDerivedFields() {
    const character = active();
    $$("[data-derived]").forEach((field) => {
      field.value = character[field.dataset.derived];
    });
  }

  function renderDerivedOverview() {
    const character = active();
    const combat = derivedCombat(character);
    $("#overview-attacks").innerHTML = combat.attacks.map((attack) => `
      <div class="attack-card"><span class="attack-name">${escapeHtml(attack.name)}</span><span>TO HIT <strong>${signed(attack.toHit)}</strong></span><span>DAMAGE <strong>${escapeHtml(attack.damage)}</strong></span></div>`).join("");
    const spellcasting = $("#overview-spellcasting");
    if (combat.spellcasting) {
      spellcasting.hidden = false;
      spellcasting.innerHTML = `<span>SPELL SAVE DC <strong>${combat.spellcasting.dc}</strong></span><span>SPELL ATTACK <strong>${signed(combat.spellcasting.attack)}</strong></span><span>ABILITY <strong>${combat.spellcasting.ability.toUpperCase()}</strong></span>`;
    } else {
      spellcasting.hidden = true;
      spellcasting.replaceChildren();
    }
    $("#overview-saves").textContent = combat.saves.map((save) => `${save.ability} ${signed(save.bonus)}${save.proficient ? " ✓" : ""}`).join(" · ");
    $("#overview-perception").textContent = combat.perception;
    const carriedWeight = character.inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);
    $("#overview-carry").textContent = `${Number(carriedWeight.toFixed(1))} / ${character.abilities.strength * 15} lb.`;
    $("#overview-skills").innerHTML = combat.skills.map((skill) =>
      `<div class="skill-row ${skill.proficient ? "proficient" : ""}"><span>${escapeHtml(skill.name)}${skill.proficient ? " · P" : ""}</span><strong>${signed(skill.bonus)}</strong></div>`
    ).join("");
    renderDerivedFields();
  }

  function renderOverview() {
    const character = active();
    const nextThreshold = character.level >= 20 ? XP_THRESHOLDS[19] : XP_THRESHOLDS[character.level];
    const currentThreshold = XP_THRESHOLDS[character.level - 1];
    const progress = character.level >= 20 ? 100 : Math.min(100, Math.max(0, ((character.xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100));
    $("#hero-class-tag").textContent = character.className.toUpperCase();
    $("#hero-level").textContent = character.level;
    $("#hero-name").textContent = character.name || "Unnamed Adventurer";
    $("#hero-description").innerHTML = [character.race, character.background, character.alignment].filter(Boolean).map(escapeHtml).join(" <span>·</span> ") || "Make this character your own";
    $("#hero-initial").textContent = character.name.trim().charAt(0).toUpperCase() || "?";
    $("#hero-hp").textContent = character.currentHp;
    $("#hero-max-hp").textContent = character.maxHp;
    $("#hp-progress").style.width = `${Math.min(100, character.maxHp ? (character.currentHp / character.maxHp) * 100 : 0)}%`;
    $("#hero-ac").textContent = character.ac;
    $("#hero-initiative").textContent = signed(abilityModifier(character.abilities.dexterity));
    $("#hero-proficiency").textContent = signed(proficiencyBonus(character.level));
    $("#next-level-label").textContent = character.level >= 20 ? "Maximum level" : `Level ${character.level + 1}`;
    $("#xp-summary").textContent = character.level >= 20 ? `${character.xp.toLocaleString()} XP · Level cap` : `${character.xp.toLocaleString()} / ${nextThreshold.toLocaleString()} XP`;
    $("#xp-progress").style.width = `${progress}%`;
    $("#xp-hint").textContent = character.level >= 20 ? "You've reached the level cap." : `${Math.max(0, nextThreshold - character.xp).toLocaleString()} XP to your next level`;
    $("#xp-input").value = character.xp;
    const snapshot = character.inventory.slice(0, 4);
    $("#inventory-snapshot").innerHTML = snapshot.length ? snapshot.map((item) => `<div class="snapshot-row"><span class="item-glyph">◇</span><strong>${escapeHtml(item.item)}</strong><small>× ${item.quantity}</small></div>`).join("") : '<div class="empty-mini">No gear yet. Add items to your inventory.</div>';
    renderAbilityCards();
    renderDerivedOverview();
    renderAsiProgress();
  }

  function fillSelect(select, values, currentValue) {
    select.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
    if (!values.includes(currentValue)) {
      const option = document.createElement("option");
      option.value = currentValue;
      option.textContent = currentValue;
      select.append(option);
    }
    select.value = currentValue;
  }

  function renderForm() {
    const character = active();
    $("#character-form").reset();
    $$("[data-field]").forEach((field) => {
      const value = character[field.dataset.field];
      if (field.dataset.field === "className") fillSelect(field, CLASSES, value);
      else if (field.dataset.field === "background") fillSelect(field, BACKGROUNDS, value);
      else if (field.dataset.field === "alignment") fillSelect(field, ALIGNMENTS, value);
      else field.value = value ?? "";
    });
    renderAbilities();
    renderDerivedFields();
  }

  function renderInventory() {
    const character = active();
    $("#inventory-title").textContent = `${character.name || "Adventurer"}'s gear`;
    $("#gold-input").value = character.gold;
    const body = $("#inventory-rows");
    $("#empty-inventory").hidden = character.inventory.length > 0;
    body.innerHTML = character.inventory.map((item) => `<tr data-item="${escapeHtml(item.id)}">
      <td><span class="inventory-item-name"><span class="item-glyph">◇</span>${escapeHtml(item.item)}</span></td>
      <td><input data-item-field="quantity" type="number" min="1" step="1" value="${item.quantity}" aria-label="${escapeHtml(item.item)} quantity"></td>
      <td><input data-item-field="weight" type="number" min="0" step="0.1" value="${item.weight}" aria-label="${escapeHtml(item.item)} weight in pounds"></td>
      <td><span class="status-pill ${item.equipped ? "equipped" : ""}">${item.equipped ? "Equipped" : "Carried"}</span></td>
      <td><div class="row-actions"><button class="row-button" data-action="toggle" title="${item.equipped ? "Mark as carried" : "Mark as equipped"}" aria-label="${item.equipped ? "Mark as carried" : "Mark as equipped"}">${item.equipped ? "✓" : "↗"}</button><button class="row-button delete" data-action="delete" title="Remove item" aria-label="Remove ${escapeHtml(item.item)}">×</button></div></td>
    </tr>`).join("");
    const itemCount = character.inventory.reduce((sum, item) => sum + item.quantity, 0);
    const weight = character.inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);
    $("#item-count").textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
    $("#total-weight").textContent = `${Number(weight.toFixed(1))} lb.`;
  }

  function renderAll() {
    renderCharacterList();
    renderOverview();
    renderDerivedFields();
    renderForm();
    renderInventory();
  }

  function switchView(name) {
    activeView = name;
    $$(".view").forEach((view) => view.classList.toggle("active", view.id === `${name}-view`));
    $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === name));
    const viewLabel = { overview: "CHARACTER OVERVIEW", sheet: "CHARACTER SHEET", inventory: "INVENTORY" };
    $("#breadcrumb-view").textContent = viewLabel[name];
  }

  function updateField(field) {
    const character = active();
    const key = field.dataset.field;
    const oldClass = character.className;
    const oldMaxHp = character.maxHp;
    const updateStarterGear = key === "className" && field.value !== oldClass && hasUntouchedStarterGear(character);
    if (key === "level" || key === "xp" || key === "maxHp" || key === "currentHp" || key === "ac" || key === "speed") {
      if (field.value === "") return;
      character[key] = Number(field.value);
      if (key === "level") {
        character.level = Math.min(20, Math.max(1, Math.trunc(character.level)));
        character.xp = Math.max(character.xp, XP_THRESHOLDS[character.level - 1]);
        $("[data-field=xp]").value = character.xp;
      }
      if (key === "xp" || key === "ac" || key === "speed") character[key] = Math.max(0, Math.trunc(character[key]));
      if (key === "xp") {
        character.level = levelFromXp(character.xp);
        $("[data-field=level]").value = character.level;
      }
      if (key === "maxHp") character.maxHp = Math.max(1, Math.trunc(character.maxHp));
      if (key === "currentHp") character.currentHp = Math.min(character.maxHp, Math.max(0, Math.trunc(character.currentHp)));
      if (key === "maxHp" && character.currentHp > character.maxHp) character.currentHp = character.maxHp;
      field.value = character[key];
    } else {
      character[key] = field.value.trim();
    }
    if (updateStarterGear) character.inventory = starterInventory(character.className);
    if (key === "className" && character.className !== oldClass) {
      const saveLine = `Saving throws: ${(CLASS_BUILDS[character.className] || CLASS_BUILDS.Fighter).saves}`;
      const lines = String(character.proficiencies || "").split(/\r?\n/).filter((line) => !/^saving throws:/i.test(line));
      lines.unshift(saveLine);
      character.proficiencies = lines.join("\n");
    }
    if (key !== "currentHp") syncDerivedStats(character);
    else character.currentHp = Math.min(character.maxHp, Math.max(0, Math.trunc(Number(field.value) || 0)));
    if (key !== "currentHp" && oldMaxHp !== character.maxHp) {
      const hpInput = $("[data-field=currentHp]");
      if (hpInput) hpInput.value = character.currentHp;
    }
    saveCharacters();
    renderCharacterList();
    renderOverview();
    if (updateStarterGear) renderInventory();
    if (key === "name") $("#inventory-title").textContent = `${character.name || "Adventurer"}'s gear`;
  }

  function createCharacter() {
    const number = characters.length + 1;
    const character = makeCharacter(`New Adventurer ${number}`);
    characters.push(character);
    activeId = character.id;
    saveCharacters();
    renderAll();
    switchView("sheet");
    $("[data-field=name]").focus();
    showToast("New character created.");
  }

  function gachaCharacter() {
    const character = makeGachaCharacter();
    characters.push(character);
    activeId = character.id;
    saveCharacters();
    renderAll();
    switchView("overview");
    showToast(`${character.name} siap berpetualang!`);
  }

  function exportCharacter() {
    const character = active();
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${character.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "character"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importCharacter(file) {
    try {
      const parsed = JSON.parse(await file.text());
      const imported = normalizeCharacter(parsed);
      if (!imported) throw new Error("The JSON file doesn't contain a character.");
      imported.id = uid();
      characters.push(imported);
      activeId = imported.id;
      saveCharacters();
      renderAll();
      showToast("Character imported successfully.");
    } catch (error) {
      console.error("Could not import character:", error);
      showToast("Could not import this file. Choose a valid character JSON export.");
    }
  }

  function addInventoryItem(event) {
    event.preventDefault();
    const character = active();
    const item = $("#item-name").value.trim();
    if (!item) return;
    character.inventory.push({
      id: uid(), item, quantity: Math.max(1, Number($("#item-quantity").value) || 1),
      weight: Math.max(0, Number($("#item-weight").value) || 0), equipped: $("#item-equipped").checked
    });
    syncDerivedStats(character);
    saveCharacters();
    renderInventory();
    renderOverview();
    $("#item-dialog").close();
    $("#item-form").reset();
    $("#item-quantity").value = 1;
    $("#item-weight").value = 0;
    showToast("Item added to inventory.");
  }

  $("#character-list").addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-character]");
    if (deleteButton) {
      const character = characters.find((entry) => entry.id === deleteButton.dataset.deleteCharacter);
      if (!character || characters.length === 1 || !window.confirm(`Hapus karakter "${character.name}"?`)) return;
      characters = characters.filter((entry) => entry.id !== character.id);
      if (activeId === character.id) activeId = characters[0].id;
      saveCharacters();
      renderAll();
      showToast("Character deleted.");
      return;
    }
    const button = event.target.closest("[data-character]");
    if (!button) return;
    activeId = button.dataset.character;
    saveCharacters();
    renderAll();
  });

  $$(".nav-item").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  $$("[data-go]").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.go)));
  $("#add-character").addEventListener("click", createCharacter);
  $("#gacha-character").addEventListener("click", gachaCharacter);
  $("#character-form").addEventListener("input", (event) => {
    if (event.target.matches("[data-field]")) updateField(event.target);
  });
  $("#character-form").addEventListener("change", (event) => {
    if (event.target.matches("[data-field]")) updateField(event.target);
  });
  $("#ability-inputs").addEventListener("input", (event) => {
    const input = event.target.closest("[data-ability]");
    if (!input || input.value === "") return;
    const score = Math.min(30, Math.max(1, Math.trunc(Number(input.value) || 1)));
    active().abilities[input.dataset.ability] = score;
    input.value = score;
    input.nextElementSibling.textContent = `Modifier ${signed(abilityModifier(score))}`;
    syncDerivedStats(active());
    saveCharacters();
    renderOverview();
    renderInventory();
    const currentHpInput = $("[data-field=currentHp]");
    if (currentHpInput) currentHpInput.value = active().currentHp;
  });
  $("#asi-content").addEventListener("click", (event) => {
    const modeButton = event.target.closest("[data-asi-mode]");
    if (modeButton) {
      const level = Number(modeButton.dataset.asiLevel);
      const current = active().asiProgress[level];
      if (current && Object.values(current.allocations || {}).some((points) => Number(points) > 0)) return;
      active().asiProgress[level] = { mode: modeButton.dataset.asiMode, allocations: {} };
      saveCharacters();
      renderAsiProgress();
      return;
    }

    const resetButton = event.target.closest("[data-asi-reset]");
    if (resetButton) {
      const level = Number(resetButton.dataset.asiReset);
      const character = active();
      const progress = character.asiProgress[level];
      if (!progress) return;
      for (const [ability, points] of Object.entries(progress.allocations || {})) {
        if (Object.hasOwn(character.abilities, ability)) {
          character.abilities[ability] = Math.max(1, character.abilities[ability] - Number(points || 0));
        }
      }
      delete character.asiProgress[level];
      syncDerivedStats(character);
      saveCharacters();
      renderAll();
      return;
    }

    const choice = event.target.closest("[data-asi-ability]");
    if (!choice || choice.disabled) return;
    const character = active();
    const level = Number(choice.dataset.asiLevel);
    const ability = choice.dataset.asiAbility;
    const award = character.asiProgress[level];
    if (!award || !["single", "split"].includes(award.mode)) return;
    const points = award.mode === "single" ? 2 : 1;
    if (character.abilities[ability] + points > 20) return;
    character.abilities[ability] += points;
    award.allocations[ability] = points;
    const allocated = Object.values(award.allocations).reduce((sum, value) => sum + Number(value), 0);
    if (allocated === 2) {
      character.asiChoicesUsed.push(level);
      delete character.asiProgress[level];
    }
    syncDerivedStats(character);
    saveCharacters();
    renderAll();
  });
  $("#save-xp").addEventListener("click", () => {
    active().xp = Math.max(0, Math.trunc(Number($("#xp-input").value) || 0));
    active().level = levelFromXp(active().xp);
    syncDerivedStats(active());
    saveCharacters();
    renderOverview();
    renderCharacterList();
  });
  $("#xp-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") $("#save-xp").click();
  });
  $("#add-item").addEventListener("click", () => {
    $("#item-form").reset();
    $("#item-quantity").value = 1;
    $("#item-weight").value = 0;
    $("#item-dialog").showModal();
    $("#item-name").focus();
  });
  $("#item-form").addEventListener("submit", addInventoryItem);
  $("#close-dialog").addEventListener("click", () => $("#item-dialog").close());
  $("#cancel-item").addEventListener("click", () => $("#item-dialog").close());
  $("#inventory-rows").addEventListener("input", (event) => {
    const input = event.target.closest("[data-item-field]");
    if (!input) return;
    const row = input.closest("[data-item]");
    const item = active().inventory.find((entry) => entry.id === row.dataset.item);
    if (!item || input.value === "") return;
    item[input.dataset.itemField] = input.dataset.itemField === "quantity"
      ? Math.max(1, Math.trunc(Number(input.value) || 1))
      : Math.max(0, Number(input.value) || 0);
    saveCharacters();
    const count = active().inventory.reduce((sum, entry) => sum + entry.quantity, 0);
    const weight = active().inventory.reduce((sum, entry) => sum + entry.weight * entry.quantity, 0);
    $("#item-count").textContent = `${count} ${count === 1 ? "item" : "items"}`;
    $("#total-weight").textContent = `${Number(weight.toFixed(1))} lb.`;
    renderOverview();
  });
  $("#inventory-rows").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const row = button.closest("[data-item]");
    const character = active();
    const index = character.inventory.findIndex((item) => item.id === row.dataset.item);
    if (index < 0) return;
    if (button.dataset.action === "delete") character.inventory.splice(index, 1);
    else character.inventory[index].equipped = !character.inventory[index].equipped;
    syncDerivedStats(character);
    saveCharacters();
    renderInventory();
    renderOverview();
  });
  $("#gold-input").addEventListener("input", (event) => {
    if (event.target.value === "") return;
    active().gold = Math.max(0, Math.trunc(Number(event.target.value) || 0));
    saveCharacters();
  });
  $("#export-button").addEventListener("click", exportCharacter);
  $("#import-file").addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) importCharacter(file);
    event.target.value = "";
  });
  $("#print-sheet").addEventListener("click", () => {
    switchView("sheet");
    window.print();
  });

  renderAll();
  switchView("overview");
})();
