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

    const url = `${baseUrl}/api/dealers?page=${page}&pageSize=${pageSize}`;
    console.log("[Server] Requesting URL:", url);

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "x-forwarded-proto": "https",
        Accept: "application/json",
      },
    });

    const responseText = await response.text();
    console.log("[Server] Raw response:", responseText);

    if (!response.ok) {
      console.error("[Server Error] API response:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
      });

      if (response.status === 401) {
        throw new Error("Authentication failed - please check API credentials");
      }

      throw new Error(
        `API request failed with status ${
          response.status
        }: ${responseText.slice(0, 200)}`
      );
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("[Server Error] Failed to parse JSON response:", {
        error: parseError,
        responseText: responseText.slice(0, 200),
      });
      throw new Error("Failed to parse API response");
    }
  } catch (error) {
    console.error("[Server Error] Failed to fetch dealers:", error);
    throw error;
  }
}
