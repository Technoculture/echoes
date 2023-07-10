import Header from '@/components/header';
import { Button } from '@/components/button';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header>
        <Button className="mr-4 h-[32px]" variant="secondary" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </Header>
      <div className="p-2 ml-2 mr-2">
        <div className="grid gri-cols-1 text-primary text-sm">
          <div> Find the best research agents for your needs. </div>
          <div> Objectives, Research agents, Model Zoo, Tools, Discussion Threads and Conclusions. </div>
          <div> Upload files, oragnize and share data folders (s3). </div>
          <div> Research Notebooks </div>
        </div>
      </div>
    </>
  );
}

