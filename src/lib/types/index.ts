import { z } from "zod";
//import { MessageType } from "langchain/schema";

export type ChatRole = "user" | "assistant" | "system" | "tester";

export type ChatEntry = {
  role: ChatRole;
  content: string;
};

export type ChatLog = {
  log: Array<ChatEntry>
};

export type SystemPersona = "scientist" | "regulator" | "student" | "IPR" | null;

export const QuerySchema = z.object({
  query: z.string().nonempty(),
  systemMessage: z.string()
});

