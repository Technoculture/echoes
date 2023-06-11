import { CreateOrganization } from '@clerk/nextjs';

export default function Page () {
  return (
    <div className='grid h-screen place-items-center'>
      <CreateOrganization path="/create-org" routing="path" />
    </div>
  );
}

