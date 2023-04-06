import { SignUp } from '@clerk/nextjs/app-beta';

export default function Page () {
  return (
    <div className='grid h-screen place-items-center'>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
}