import { z } from "zod";
//import { MessageType } from "langchain/schema";

export type ChatRole = "user" | "assistant" | "system" | "tester";

export type ChatEntry = {
  id: string
  role: ChatRole;
  content: string;
};

export type ChatLog = {
  log: Array<ChatEntry>
};

export interface  PostBody {
  user_id: string,
  messages: ChatEntry[]
}

export type SystemPersona = "scientist" | "regulator" | "student" | "IPR" | null;

export const QuerySchema = z.object({
  query: z.string().nonempty(),
  systemMessage: z.string()
});

