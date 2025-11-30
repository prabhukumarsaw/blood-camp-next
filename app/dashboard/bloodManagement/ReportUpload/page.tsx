import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import ReportUpload from '@/components/donors/report-upload';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

export const metadata = {
  title: 'Dashboard: Report Upload'
};

export default async function Page() {
  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className="flex items-center justify-between">
          <Heading
            title="Upload Blood Reports"
            description="Upload blood test reports for donors. Supports single and bulk uploads with automatic donor matching."
          />
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <ReportUpload />
        </Suspense>
      </div>
    </PageContainer>
  );
}
