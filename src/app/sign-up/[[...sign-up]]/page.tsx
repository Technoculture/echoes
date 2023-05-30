import { SignUp } from '@clerk/nextjs';

const Page = async ({ searchParams }: { searchParams: { redirectUrl?: string } }) => {
  const { redirectUrl } = searchParams;

  return (
    <div className='grid h-screen place-items-center bg-gray-900'>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" redirectUrl={ redirectUrl || "/"} />
    </div>
  );
};

export default Page;
