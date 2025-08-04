import { NextResponse } from "next/server";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const content = {
    features: [
      "Service worker caching strategies",
      "Offline functionality",
      "Progressive Web App features",
      "App shell architecture pattern",
      "Dynamic content loading via API routes",
    ],
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(content);
}
