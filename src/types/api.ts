import { z } from "zod";

// Zod schemas for API validation
export const PokemonTypeSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const PokemonTypeSlotSchema = z.object({
  slot: z.number(),
  type: PokemonTypeSchema,
});

export const PokemonStatSchema = z.object({
  base_stat: z.number(),
  effort: z.number(),
  stat: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
});

export const PokemonAbilitySchema = z.object({
  ability: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  is_hidden: z.boolean(),
  slot: z.number(),
});

export const PokemonMoveSchema = z.object({
  move: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  version_group_details: z.array(
    z.object({
      level_learned_at: z.number(),
      move_learn_method: z.object({
        name: z.string(),
        url: z.string().url(),
      }),
      version_group: z.object({
        name: z.string(),
        url: z.string().url(),
      }),
    })
  ),
});

export const PokemonSpritesSchema = z.object({
  front_default: z.string().nullable(),
  front_shiny: z.string().nullable(),
  other: z.object({
    "official-artwork": z.object({
      front_default: z.string().nullable(),
      front_shiny: z.string().nullable(),
    }),
  }),
});

export const PokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  base_experience: z.number().nullable(),
  height: z.number(),
  weight: z.number(),
  sprites: PokemonSpritesSchema,
  types: z.array(PokemonTypeSlotSchema),
  stats: z.array(PokemonStatSchema),
  abilities: z.array(PokemonAbilitySchema),
  moves: z.array(PokemonMoveSchema),
});

export const PokemonListItemSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const PokemonListResponseSchema = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
  results: z.array(PokemonListItemSchema),
});

export const PokemonTypeResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokemon: z.array(
    z.object({
      pokemon: PokemonListItemSchema,
      slot: z.number(),
    })
  ),
  damage_relations: z.object({
    double_damage_from: z.array(PokemonTypeSchema),
    double_damage_to: z.array(PokemonTypeSchema),
    half_damage_from: z.array(PokemonTypeSchema),
    half_damage_to: z.array(PokemonTypeSchema),
    no_damage_from: z.array(PokemonTypeSchema),
    no_damage_to: z.array(PokemonTypeSchema),
  }),
});

// Move schemas
export const MoveEffectEntrySchema = z.object({
  effect: z.string(),
  language: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  short_effect: z.string().optional(),
});

export const MoveSchema = z.object({
  id: z.number(),
  name: z.string(),
  accuracy: z.number().nullable(),
  effect_chance: z.number().nullable(),
  pp: z.number().nullable(),
  priority: z.number(),
  power: z.number().nullable(),
  damage_class: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  type: PokemonTypeSchema,
  effect_entries: z.array(MoveEffectEntrySchema),
  learned_by_pokemon: z.array(PokemonListItemSchema),
});

export const MoveListResponseSchema = PokemonListResponseSchema;

// Ability schemas
export const AbilityEffectEntrySchema = z.object({
  effect: z.string(),
  language: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  short_effect: z.string().optional(),
});

export const AbilitySchema = z.object({
  id: z.number(),
  name: z.string(),
  effect_entries: z.array(AbilityEffectEntrySchema),
  pokemon: z.array(
    z.object({
      pokemon: PokemonListItemSchema,
      is_hidden: z.boolean(),
      slot: z.number(),
    })
  ),
});

export const AbilityListResponseSchema = PokemonListResponseSchema;

// Item schemas
export const ItemSpritesSchema = z.object({
  default: z.string().url().nullable(),
});

export const ItemAttributeSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const ItemCategorySchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const ItemEffectEntrySchema = z.object({
  effect: z.string(),
  language: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  short_effect: z.string().optional(),
});

export const ItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  cost: z.number(),
  sprites: ItemSpritesSchema,
  category: ItemCategorySchema,
  attributes: z.array(ItemAttributeSchema),
  effect_entries: z.array(ItemEffectEntrySchema),
  held_by_pokemon: z.array(
    z.object({
      pokemon: PokemonListItemSchema,
      version_details: z.array(
        z.object({
          rarity: z.number(),
          version: z.object({
            name: z.string(),
            url: z.string().url(),
          }),
        })
      ),
    })
  ),
});

export const ItemListResponseSchema = PokemonListResponseSchema;

// Location schemas
export const RegionSchema = z.object({
  id: z.number(),
  name: z.string(),
  locations: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
    })
  ),
});

export const LocationAreaSchema = z.object({
  id: z.number(),
  name: z.string(),
  location: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  pokemon_encounters: z.array(
    z.object({
      pokemon: PokemonListItemSchema,
      version_details: z.array(
        z.object({
          version: z.object({
            name: z.string(),
            url: z.string().url(),
          }),
          max_chance: z.number(),
          encounter_details: z.array(
            z.object({
              min_level: z.number(),
              max_level: z.number(),
              condition_values: z.array(
                z.object({
                  name: z.string(),
                  url: z.string().url(),
                })
              ),
              chance: z.number(),
              method: z.object({
                name: z.string(),
                url: z.string().url(),
              }),
            })
          ),
        })
      ),
    })
  ),
});

export const LocationSchema = z.object({
  id: z.number(),
  name: z.string(),
  region: z
    .object({
      name: z.string(),
      url: z.string().url(),
    })
    .nullable(),
  areas: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
    })
  ),
});

export const LocationListResponseSchema = PokemonListResponseSchema;
export const RegionListResponseSchema = PokemonListResponseSchema;

// Evolution schemas
export const EvolutionTriggerSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const EvolutionDetailSchema = z.object({
  item: z
    .object({
      name: z.string(),
      url: z.string().url(),
    })
    .nullable(),
  trigger: EvolutionTriggerSchema,
  gender: z.number().nullable(),
  held_item: z
    .object({
      name: z.string(),
      url: z.string().url(),
    })
    .nullable(),
  known_move: z
    .object({
      name: z.string(),
      url: z.string().url(),
    })
    .nullable(),
  known_move_type: z
    .object({
      name: z.string(),
      url: z.string().url(),
    })
    .nullable(),
  location: z
    .object({
      name: z.string(),
      url: z.string().url(),
    })
    .nullable(),
  min_level: z.number().nullable(),
  min_happiness: z.number().nullable(),
  min_beauty: z.number().nullable(),
  min_affection: z.number().nullable(),
  needs_overworld_rain: z.boolean(),
  party_species: z
    .object({
      name: z.string(),
      url: z.string().url(),
    })
    .nullable(),
  party_type: z
    .object({
      name: z.string(),
      url: z.string().url(),
    })
    .nullable(),
  relative_physical_stats: z.number().nullable(),
  time_of_day: z.string(),
  trade_species: z
    .object({
      name: z.string(),
      url: z.string().url(),
    })
    .nullable(),
  turn_upside_down: z.boolean(),
});

export const ChainLinkSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    is_baby: z.boolean(),
    species: z.object({
      name: z.string(),
      url: z.string().url(),
    }),
    evolution_details: z.array(EvolutionDetailSchema),
    evolves_to: z.array(ChainLinkSchema),
  })
);

export const EvolutionChainSchema = z.object({
  id: z.number(),
  baby_trigger_item: z
    .object({
      name: z.string(),
      url: z.string().url(),
    })
    .nullable(),
  chain: ChainLinkSchema,
});

// Generation schemas
export const GenerationSchema = z.object({
  id: z.number(),
  name: z.string(),
  names: z.array(
    z.object({
      name: z.string(),
      language: z.object({
        name: z.string(),
        url: z.string().url(),
      }),
    })
  ),
  pokemon_species: z.array(PokemonListItemSchema),
  types: z.array(PokemonTypeSchema),
  main_region: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
});

export const GenerationListResponseSchema = PokemonListResponseSchema;

// Species schemas
export const FlavorTextEntrySchema = z.object({
  flavor_text: z.string(),
  language: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  version: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
});

export const GrowthRateSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const HabitatSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const ShapeSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const ColorSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const SpeciesSchema = z.object({
  id: z.number(),
  name: z.string(),
  base_happiness: z.number().nullable(),
  capture_rate: z.number(),
  color: ColorSchema,
  evolution_chain: z.object({
    url: z.string().url(),
  }),
  flavor_text_entries: z.array(FlavorTextEntrySchema),
  forms_switchable: z.boolean(),
  gender_rate: z.number(),
  generation: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  growth_rate: GrowthRateSchema,
  habitat: HabitatSchema.nullable(),
  has_gender_differences: z.boolean(),
  hatch_counter: z.number().nullable(),
  is_baby: z.boolean(),
  is_legendary: z.boolean(),
  is_mythical: z.boolean(),
  shape: ShapeSchema,
  varieties: z.array(
    z.object({
      is_default: z.boolean(),
      pokemon: PokemonListItemSchema,
    })
  ),
});

// Encounter schemas
export const EncounterMethodSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const EncounterConditionValueSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

export const EncounterVersionDetailsSchema = z.object({
  version: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  max_chance: z.number(),
  encounter_details: z.array(
    z.object({
      min_level: z.number(),
      max_level: z.number(),
      condition_values: z.array(EncounterConditionValueSchema),
      chance: z.number(),
      method: EncounterMethodSchema,
    })
  ),
});

export const PokemonEncounterSchema = z.object({
  location_area: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
  version_details: z.array(EncounterVersionDetailsSchema),
});

// Type exports derived from schemas
export type PokemonType = z.infer<typeof PokemonTypeSchema>;
export type PokemonTypeSlot = z.infer<typeof PokemonTypeSlotSchema>;
export type PokemonStat = z.infer<typeof PokemonStatSchema>;
export type PokemonAbility = z.infer<typeof PokemonAbilitySchema>;
export type PokemonMove = z.infer<typeof PokemonMoveSchema>;
export type PokemonSprites = z.infer<typeof PokemonSpritesSchema>;
export type Pokemon = z.infer<typeof PokemonSchema>;
export type PokemonListItem = z.infer<typeof PokemonListItemSchema>;
export type PokemonListResponse = z.infer<typeof PokemonListResponseSchema>;
export type PokemonTypeResponse = z.infer<typeof PokemonTypeResponseSchema>;
export type Move = z.infer<typeof MoveSchema>;
export type MoveListResponse = z.infer<typeof MoveListResponseSchema>;
export type Ability = z.infer<typeof AbilitySchema>;
export type AbilityListResponse = z.infer<typeof AbilityListResponseSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type ItemListResponse = z.infer<typeof ItemListResponseSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type LocationArea = z.infer<typeof LocationAreaSchema>;
export type Region = z.infer<typeof RegionSchema>;
export type LocationListResponse = z.infer<typeof LocationListResponseSchema>;
export type RegionListResponse = z.infer<typeof RegionListResponseSchema>;
export type EvolutionChain = z.infer<typeof EvolutionChainSchema>;
export type EvolutionDetail = z.infer<typeof EvolutionDetailSchema>;
export type Generation = z.infer<typeof GenerationSchema>;
export type GenerationListResponse = z.infer<typeof GenerationListResponseSchema>;
export type Species = z.infer<typeof SpeciesSchema>;
export type PokemonEncounter = z.infer<typeof PokemonEncounterSchema>;

