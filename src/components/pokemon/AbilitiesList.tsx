import { Badge } from "@/components/ui/Badge";
import type { Pokemon } from "@/types/api";

interface AbilitiesListProps {
  pokemon: Pokemon;
}

export function AbilitiesList({ pokemon }: AbilitiesListProps) {
  const formatAbilityName = (name: string) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Abilities
      </h3>
      <div className="flex flex-wrap gap-2">
        {pokemon.abilities.map((ability, index) => (
          <div key={index} className="flex items-center gap-2">
            <Badge variant="default">
              {formatAbilityName(ability.ability.name)}
            </Badge>
            {ability.is_hidden && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                (Hidden)
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

