import Header from '@/components/header';

export default function Home() {
  return (
    <>
      <Header />
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

