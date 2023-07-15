import { z } from "zod";
//import { MessageType } from "langchain/schema";

export type ChatRole = "user" | "assistant" | "system" | "tester";
// Basically ChatEntry is equivalent to Message from 'vercel-ai-sdk
export type ChatEntry = {
  id: string;
  role: ChatRole;
  content: string;
  name: string;
};

export type ChatLog = {
  log: Array<ChatEntry>;
};

export interface PostBody {
  user_id: string;
  messages: ChatEntry[];
}

export type SystemPersona =
  | "scientist"
  | "regulator"
  | "student"
  | "IPR"
  | null;

export const QuerySchema = z.object({
  query: z.string().nonempty(),
  systemMessage: z.string(),
});
