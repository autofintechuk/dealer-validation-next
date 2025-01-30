"use server";

import { clearAuthCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function handleLogout() {
  await clearAuthCookie();
  redirect("/sign-in");
}

export async function getDealers(page = 1, pageSize = 100) {
  // Get the base URL from environment variable or construct it
  const baseUrl = process.env.APP_URL || "http://localhost:3000";

  console.log(
    "[Server] Making request to:",
    `${baseUrl}/api/dealers?page=${page}&pageSize=${pageSize}`
  );

  const response = await fetch(
    `${baseUrl}/api/dealers?page=${page}&pageSize=${pageSize}`,
    {
      cache: "no-store",
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
