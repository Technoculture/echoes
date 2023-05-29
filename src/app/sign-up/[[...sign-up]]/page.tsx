import { SignUp } from '@clerk/nextjs';

export default function Page () {
  return (
    <div className='grid h-screen place-items-center bg-gray-900'>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
}
