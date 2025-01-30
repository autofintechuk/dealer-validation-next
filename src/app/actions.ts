"use server";

import { clearAuthCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function handleLogout() {
  await clearAuthCookie();
  redirect("/sign-in");
}

export async function getDealers(page = 1, pageSize = 100) {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.APP_URL || "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/dealers?page=${page}&pageSize=${pageSize}`,
      {
        cache: "no-store",
        headers: {
          "x-forwarded-proto": "https",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Server Error] Failed to fetch dealers:", error);
    throw error;
  }
}
