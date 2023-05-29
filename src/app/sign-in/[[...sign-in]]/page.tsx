import { SignIn } from '@clerk/nextjs';

export default function Page () {
  return (
    <div className='grid h-screen place-items-center bg-gray-900'>
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}

