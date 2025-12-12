import { z } from "zod";
import { fetchWithTimeout } from "./fetchWithTimeout";

/**
 * Shared fetchAPI function with timeout and retry logic
 * Used by all API modules
 */
export async function fetchAPI<T>(
  url: string,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const response = await fetchWithTimeout(
      url,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      },
      30000, // 30 second timeout
      2 // 2 retries
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      throw new Error("Invalid API response format");
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout: The API took too long to respond");
    }
    if (
      error instanceof Error &&
      (error.message.includes("timeout") ||
        (error as any)?.code === "UND_ERR_CONNECT_TIMEOUT")
    ) {
      throw new Error(
        "Connection timeout: Unable to reach the API. Please check your internet connection and try again."
      );
    }
    throw error;
  }
}

