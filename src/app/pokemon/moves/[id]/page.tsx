import { Suspense } from "react";
import { getMoveById } from "@/lib/api/moves";
import { MoveDetail } from "@/components/pokemon/MoveDetail";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { notFound } from "next/navigation";

interface MoveDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getMoveData(id: string) {
  try {
    const move = await getMoveById(id);
    return move;
  } catch (error) {
    console.error("Error fetching move:", error);
    return null;
  }
}

export default async function MoveDetailPage({
  params,
}: MoveDetailPageProps) {
  const { id } = await params;
  const move = await getMoveData(id);

  if (!move) {
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
          <MoveDetail move={move} />
        </Suspense>
      </div>
    </div>
  );
}

