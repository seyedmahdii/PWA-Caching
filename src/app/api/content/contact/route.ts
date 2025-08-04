import { NextResponse } from "next/server";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const content = {
    email: "seyedmahdijalali2020@gmail.com",
    github: "https://github.com/seyedmahdii",
    twitter: "https://twitter.com/seyedmahdii_",
    linkedin: "https://www.linkedin.com/in/seyed-mahdi-jalali",
    youtube: "https://www.youtube.com/@SeyedTechStuff",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(content);
}
