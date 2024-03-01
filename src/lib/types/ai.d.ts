// import ai from "ai"
import { Message as Message2 } from "ai";
declare module "ai" {
  interface Message extends Message2 {
    audio?: string;
    subRole?: "patent-search" | "input-image";
  }
}
