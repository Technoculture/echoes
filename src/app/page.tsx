import Image from 'next/image';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home () {
  return (
    <main>
      <p className="text-3xl font-bold underline">
        HI
      </p>
    </main >
  );
}
