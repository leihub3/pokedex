"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getItemList, getItemById } from "@/lib/api/items";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import type { ItemListResponse, Item } from "@/types/api";

interface ItemsExplorerClientProps {
  initialData: ItemListResponse;
}

export function ItemsExplorerClient({
  initialData,
}: ItemsExplorerClientProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const itemDetails = await Promise.all(
          initialData.results.slice(0, 50).map(async (itemItem) => {
            const match = itemItem.url.match(/\/item\/(\d+)\//);
            if (match) {
              return getItemById(parseInt(match[1], 10));
            }
            return null;
          })
        );
        setItems(
          itemDetails.filter((item): item is Item => item !== null)
        );
      } catch (error) {
        console.error("Error fetching item details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [initialData]);

  const filteredItems = categoryFilter === "all"
    ? items
    : items.filter((item) => item.category.name === categoryFilter);

  const categories = Array.from(new Set(items.map((item) => item.category.name))).sort();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoaderSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            variants={staggerItem}
            whileHover={{ scale: 1.05, y: -4 }}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-800"
          >
            <Link href={`/pokemon/items/${item.id}`}>
              <div className="flex flex-col items-center space-y-2">
                {item.sprites.default && (
                  <div className="relative h-16 w-16">
                    <Image
                      src={item.sprites.default}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>
                )}
                <h3 className="text-center text-sm font-medium capitalize text-gray-900 dark:text-gray-100">
                  {item.name.replace(/-/g, " ")}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {item.cost} ₽
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

