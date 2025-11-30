import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { SettingsSetup } from '@/components/setting/settings-setup';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

export const metadata = {
  title: 'Dashboard: Settings'
};

export default async function SettingsPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <SettingsSetup />
        </Suspense>
      </div>
    </PageContainer>
  );
}
