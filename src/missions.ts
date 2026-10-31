export type Mode =
  | "flight"
  | "explore"
  | "rescue"
  | "addition"
  | "count"
  | "pattern"
  | "sequence"
  | "sort"
  | "workshop";
export const worlds = [
  {
    name: "Earth & Moon",
    icon: "🌍",
    color: "#80cfdf",
    ground: "#b7b9ca",
    description: "Your first giant leap.",
    fact: "The Moon reflects sunlight. It does not make its own light.",
    story:
      "Captain Nihara, the Moon’s lighthouse has gone quiet! Pip the little robot needs a brave pilot to gather starlight and guide the lost explorers home.",
  },
  {
    name: "Mars Adventure",
    icon: "🔴",
    color: "#f39c83",
    ground: "#c47d62",
    description: "Little friends. Big discoveries.",
    fact: "Mars looks red because its rocks contain rusty iron.",
    story:
      "A friendly Martian named Momo has lost the crystals for her spaceship. Follow the red planet’s sparkling trails and help her friends get ready to fly.",
  },
  {
    name: "Jupiter Zone",
    icon: "🪐",
    color: "#dfb79a",
    ground: "#b598c7",
    description: "A playground above the clouds.",
    fact: "Jupiter is a gas giant. Our imaginary station floats above its clouds; we cannot walk on a solid surface there.",
    story:
      "The cloud station is drifting! Its cheerful robots need a clever captain to spot patterns, count supplies, and steer through the glowing cloud rings.",
  },
  {
    name: "Saturn Adventure",
    icon: "💫",
    color: "#e4c87d",
    ground: "#b0a2c6",
    description: "Follow the rings of wonder.",
    fact: "Saturn’s rings are made mostly of pieces of ice, with some rock and dust.",
    story:
      "Saturn’s ring keepers are preparing a parade of lights. Help put their supplies in order, remember the secret signals, and find every missing lantern.",
  },
  {
    name: "Magical Galaxy",
    icon: "🌈",
    color: "#c3a0f2",
    ground: "#a387c3",
    description: "Imagination has no limits.",
    fact: "This magical galaxy and its creatures are make-believe. Real galaxies contain stars, gas, dust, and planets.",
    story:
      "The Star Gardener has invited Captain Nihara to a make-believe galaxy! Bring your kindness, memory, and counting skills to help a whole universe bloom.",
  },
];
const modes: Mode[] = [
  "flight",
  "explore",
  "count",
  "rescue",
  "pattern",
  "flight",
  "sort",
  "sequence",
  "workshop",
  "explore",
];
const names = [
  [
    "First launch",
    "Moonwalk magic",
    "Count the moon rocks",
    "A friend among the craters",
    "Starlight patterns",
    "Through the moon rings",
    "Pack the moon buggy",
    "Robot signals",
    "My first rocket",
    "Light the lunar beacon",
  ],
  [
    "Red planet runway",
    "Crystal canyon",
    "Momo’s crystal count",
    "Martian rescue",
    "Rainbow rock patterns",
    "Meteor meadow",
    "Sort the space gems",
    "The secret message",
    "A rocket for Momo",
    "The crystal lighthouse",
  ],
  [
    "Cloud nine pilot",
    "Sky station stroll",
    "Count the cloud pods",
    "Cloud creature rescue",
    "Cloud ribbon patterns",
    "Jupiter ring run",
    "Sort the storm supplies",
    "Lightning signals",
    "Cloud cruiser workshop",
    "Save the floating station",
  ],
  [
    "Ice ring express",
    "The ring keeper’s path",
    "Count the lanterns",
    "A little lost ring keeper",
    "The lantern pattern",
    "Saturn slalom",
    "Pack the parade",
    "Parade light signals",
    "A parade rocket",
    "The ring of a thousand wishes",
  ],
  [
    "Rainbow runway",
    "Stardust meadow",
    "Count the dream seeds",
    "Star creature rescue",
    "The garden’s secret pattern",
    "The great galaxy flight",
    "Sort the star seeds",
    "The final signal",
    "Captain’s special rocket",
    "Let the universe bloom",
  ],
];
export interface Mission {
  id: number;
  world: number;
  title: string;
  mode: Mode;
  difficulty: number;
  target: number;
  reward: number;
  objective: string;
  learning: string;
  instructions: string;
}
const objectives: Record<Mode, string> = {
  flight: "Fly through glowing rings and gather stars.",
  explore: "Walk to each glowing crystal and help your alien friend.",
  rescue: "Match the symbol to send each friendly alien home.",
  count:
    "Count the little treasures. Tap the matching number. We never go above nine.",
  addition:
    "Help Momo with snack time! Move the berries from both bowls into the tray. How many berries altogether?",
  pattern: "Look for the repeating pattern. What comes next?",
  sequence: "Watch the lights. Then repeat their order.",
  sort: "Place the space rocks in order, smallest to biggest.",
  workshop: "Build a rocket with the requested colour and shape.",
};
const learning: Record<Mode, string> = {
  flight: "Hand-eye coordination",
  explore: "Spatial navigation",
  rescue: "Shape recognition",
  count: "Counting 1–9",
  addition: "Addition with totals below 10",
  pattern: "Pattern recognition",
  sequence: "Working memory",
  sort: "Size comparison and ordering",
  workshop: "Following instructions and creativity",
};
const originalMissions: Mission[] = names.flatMap((list, world) =>
  list.map((title, i) => {
    const mode = modes[i];
    return {
      id: world * 10 + i + 1,
      world,
      title,
      mode,
      difficulty: world + 1,
      target:
        mode === "flight" ? 4 + world : mode === "explore" ? 3 + world : 3,
      reward: 3,
      objective: objectives[mode],
      learning: learning[mode],
      instructions: objectives[mode],
    };
  }),
);
export const missions: Mission[] = [
  ...originalMissions,
  ...worlds.map((_, world) => ({
    id: 51 + world,
    world,
    title: [
      "Feed Momo on the Moon",
      "Momo’s berry picnic",
      "Cloud picnic for Momo",
      "Momo’s ring-side treats",
      "The magical berry picnic",
    ][world],
    mode: "addition" as const,
    difficulty: world + 1,
    target: 3,
    reward: 3,
    objective: objectives.addition,
    learning: learning.addition,
    instructions: objectives.addition,
  })),
];
export function worldUnlocked(world: number, done: number[]) {
  return (
    world === 0 ||
    Array.from({ length: 10 }, (_, i) => (world - 1) * 10 + i + 1).every((id) =>
      done.includes(id),
    )
  );
}
export const symbols = ["⭐", "🌙", "☀️", "💎"];
export function additionFor(m: Mission, round: number, variation = 0) {
  const seed = m.id * 7 + round * 11 + variation * 13;
  const maximum = Math.min(9, 5 + m.world);
  const total = 2 + (seed % (maximum - 1));
  const left = 1 + ((seed * 3 + round) % (total - 1)),
    right = total - left;
  const options = [
    total,
    total - 1,
    total + 1,
    total + 2,
    ...Array.from({ length: 9 }, (_, i) => i + 1),
  ];
  const choices = [...new Set(options.filter((v) => v >= 1 && v <= 9))].slice(
    0,
    4,
  );
  const shift = seed % choices.length;
  return {
    left,
    right,
    total,
    choices: [...choices.slice(shift), ...choices.slice(0, shift)].map(String),
  };
}
export function questionFor(m: Mission, round: number, variation = 0) {
  if (m.mode === "addition") {
    const a = additionFor(m, round, variation);
    return {
      prompt: "Momo’s berry picnic",
      visual: `${a.left} + ${a.right} = ?`,
      answer: String(a.total),
      choices: a.choices,
    };
  }
  if (m.mode === "count") {
    const count =
      1 +
      ((m.world * 3 + round * 2 + m.id + variation) % Math.min(9, 5 + m.world));
    const choices = [
      count,
      count - 1,
      count + 1,
      ...Array.from({ length: 9 }, (_, i) => i + 1),
    ].filter((v) => v >= 1 && v <= 9);
    return {
      prompt: "How many treasures?",
      visual: Array(count).fill("💎").join(" "),
      answer: String(count),
      choices: [...new Set(choices)]
        .slice(0, 4)
        .map(String)
        .sort((a, b) => Number(a) - Number(b)),
    };
  }
  if (m.mode === "rescue") {
    const answer = symbols[(m.world + round) % 4];
    return {
      prompt: "Find my matching symbol!",
      visual: "👽 " + answer,
      answer,
      choices: symbols,
    };
  }
  const unit = m.world % 2 === 0 ? ["⭐", "🌙"] : ["💎", "☀️", "🌙"];
  const sequence = Array.from(
    { length: 5 },
    (_, i) => unit[(i + round) % unit.length],
  );
  return {
    prompt: "What comes next?",
    visual: sequence.join(" ") + "  ?",
    answer: unit[(5 + round) % unit.length],
    choices: symbols,
  };
}
