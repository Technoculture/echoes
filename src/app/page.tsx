import Header from '@/components/header';
import { Button } from '@/components/button';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header>
        <Button className="mr-4 h-[32px]" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </Header>
      <div className="p-2 ml-2 mr-2">
        <p className="text-slate-300 text-sm">
          - Find the best research agents for your needs.
          - Objectives, Rage, Model Zoo, Tools, Discussion Threads and Conclusions.
          - Upload files, oragnize and share data folders (s3).
          - Research Notebooks
        </p>
      </div>
    </>
  );
}

