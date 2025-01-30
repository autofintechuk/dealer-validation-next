"use server";

import { clearAuthCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function handleLogout() {
  await clearAuthCookie();
  redirect("/sign-in");
}

export async function getDealers(page = 1, pageSize = 100) {
  // Get the base URL based on environment
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.APP_URL || "http://localhost:3000";

  console.log(
    "[Server] Making request to:",
    `${baseUrl}/api/dealers?page=${page}&pageSize=${pageSize}`
  );

  const response = await fetch(
    `${baseUrl}/api/dealers?page=${page}&pageSize=${pageSize}`,
    {
      cache: "no-store",
      // Add headers for internal API calls
      headers: {
        "x-forwarded-proto": "https",
      },
    }
  );

  if (!response.ok) {
    console.error(
      "[Server] API request failed:",
      response.status,
      response.statusText
    );
    const errorData = await response.json();
    console.error("[Server] Error details:", errorData);
    throw new Error("Failed to fetch dealers");
  }

  const data = await response.json();
  return data;
}
