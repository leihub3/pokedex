import { Suspense } from "react";
import { getItemById } from "@/lib/api/items";
import { ItemDetail } from "@/components/pokemon/ItemDetail";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { notFound } from "next/navigation";

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getItemData(id: string) {
  try {
    const item = await getItemById(id);
    return item;
  } catch (error) {
    console.error("Error fetching item:", error);
    return null;
  }
}

export default async function ItemDetailPage({
  params,
}: ItemDetailPageProps) {
  const { id } = await params;
  const item = await getItemData(id);

  if (!item) {
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
          <ItemDetail item={item} />
        </Suspense>
      </div>
    </div>
  );
}

