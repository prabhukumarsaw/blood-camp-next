import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import { NotificationSetup } from '@/components/donors/notification-setup';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

export const metadata = {
  title: 'Dashboard: Notification Management'
};

export default async function Page() {
  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-4'>
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <NotificationSetup />
        </Suspense>
      </div>
    </PageContainer>
  );
}
