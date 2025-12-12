import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900 dark:text-gray-100">
          404
        </h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">
          Pokémon Not Found
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          The Pokémon you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <Link href="/">
          <Button variant="primary">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}

