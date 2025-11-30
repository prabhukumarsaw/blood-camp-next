import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import DonorTable from '@/components/doners/donor-table';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { Suspense } from 'react';
import SearchReports from '@/components/doners/Reports';

export const metadata = {
  title: 'Dashboard: Reports Management'
};


export default async function Page() {


  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className="flex items-center justify-between">
          <Heading
            title="Reports Management"
            description="Manage blood test reports and send to donors"
          />
          {/* <Link
            href="/dashboard/doner-list/new"
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <IconPlus className="mr-2 h-4 w-4" /> New Donor
          </Link> */}
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <SearchReports  />
        </Suspense>
      </div>
    </PageContainer>
  );
}
