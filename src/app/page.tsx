import { buttonVariants } from "@/components/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-2 ml-2 mr-2">
      <p className="text-slate-300 text-sm">
        - Find the best research agents for your needs.
        - Objectives, Ragents, Model Zoo, Tools, Discussion Threads and Conclusions.
        - Upload files, oragnize and share data folders (s3).
        - Research Notebooks
      </p>
      <Link href="/chat" className={buttonVariants({ variant: "secondary" })}>Chat</Link>
    </div>
  );
}

