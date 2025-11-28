
import PageContainer from '@/components/layout/page-container';

import React from 'react';

export default function HomeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-2 -m-4 items-center'>
      
        <main className='w-full max-w-none mx-auto' >{children}</main>
        {/* <Footer /> */}
      </div>
    </PageContainer>
  )
}
