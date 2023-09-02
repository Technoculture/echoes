import { NextResponse } from "next/server";
import { env } from "@/app/env.mjs";

export async function POST(request: Request) {
  const formData = await request.formData();

  const audio = formData.get("file") as Blob;
  const f = new FormData();
  f.append("file", audio);
  f.append("model", "whisper-1");
  f.append("language", "en");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPEN_AI_API_KEY}`,
    },
    body: f,
  });

  const data = await res.json();

  return NextResponse.json({ text: data.text });
}
