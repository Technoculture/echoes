import { env } from "@/app/env.mjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import * as z from "zod";

const bodyobj = z.object({
  text: z.string().min(1),
});

export async function POST(request: Request) {
  const body = bodyobj.parse(await request.json());

  const text = body.text;

  const Openai = new OpenAI({
    apiKey: env.OPEN_AI_API_KEY,
  });

  const mp3 = await Openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
}
