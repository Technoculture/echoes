import { SignIn } from '@clerk/nextjs/app-beta';

export default function Page () {
  return (
    <div className='grid h-screen place-items-center'>
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}