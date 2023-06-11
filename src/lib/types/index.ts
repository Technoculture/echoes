export type ChatRole = "user" | "assistant" | "system" | "tester";

export type ChatEntry = {
  role: ChatRole;
  content: string;
};

export type ChatLog = {
  log: Array<ChatEntry>
};

export type SystemPersona = "scientist" | "regulator" | "student" | "IPR" | null;
