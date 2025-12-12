import { Suspense } from "react";
import { getAbilityById } from "@/lib/api/abilities";
import { AbilityDetail } from "@/components/pokemon/AbilityDetail";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { notFound } from "next/navigation";

interface AbilityDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getAbilityData(id: string) {
  try {
    const ability = await getAbilityById(id);
    return ability;
  } catch (error) {
    console.error("Error fetching ability:", error);
    return null;
  }
}

export default async function AbilityDetailPage({
  params,
}: AbilityDetailPageProps) {
  const { id } = await params;
  const ability = await getAbilityData(id);

  if (!ability) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <LoaderSpinner size="lg" />
            </div>
          }
        >
          <AbilityDetail ability={ability} />
        </Suspense>
      </div>
    </div>
  );
}

