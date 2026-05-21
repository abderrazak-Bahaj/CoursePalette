import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceTable, Invoice } from '@/components/invoices/InvoiceTable';
import { invoiceApi } from '@/services/api/invoice';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ds/primitives/Card';
import { Button } from '@/components/ds/primitives/Button';
import { Badge } from '@/components/ds/primitives/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Loader2 } from 'lucide-react';
import { PaginationMeta } from '@/services/pagination/PaginationService';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components';
import { useSEO } from '@/hooks/useSEO';

const TeacherInvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const { toast } = useToast();

  useSEO({
    title: 'Invoices',
    description:
      'View and manage your teaching invoices and revenue on Skillorai.',
    noIndex: true,
  });

  const { data, isLoading, error } = useQuery<Invoice[]>({
    queryKey: [
      'teacherInvoices',
      selectedStatus,
      dateRange,
      meta.current_page,
      meta.per_page,
    ],
    queryFn: async () => {
      const filters: any = {
        page: meta.current_page,
        per_page: meta.per_page,
      };

      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }

      if (dateRange?.from) {
        filters.from = dateRange.from.toISOString();
      }

      if (dateRange?.to) {
        filters.to = dateRange.to.toISOString();
      }

      const response = await invoiceApi.getTeacherInvoices(filters);
      setMeta(response.meta);
      return response.invoices;
    },
  });

  const calculateRevenue = () => {
    if (!data) return 0;
    return data.reduce((total, invoice) => {
      if (invoice.status === 'PAID') {
        const amount =
          typeof invoice.total === 'string'
            ? parseFloat(invoice.total)
            : invoice.total;
        return total + amount;
      }
      return total;
    }, 0);
  };

  const handleViewDetails = (invoiceId: string) => {
    navigate(`/teacher/invoices/${invoiceId}`);
  };

  const handlePrint = async (invoiceId: string) => {
    try {
      await invoiceApi.printInvoice(invoiceId);
    } catch (error) {
      console.error('Error printing invoice:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setMeta((prev) => ({ ...prev, current_page: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setMeta((prev) => ({ ...prev, per_page: pageSize, current_page: 1 }));
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-neutral-50 mb-4">
            Invoices
          </h1>

          {/* Revenue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#1e293b] p-6 rounded-lg border border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-400">
                Total Revenue
              </h3>
              <p className="font-serif text-3xl font-bold text-amber-400">
                ${calculateRevenue().toFixed(2)}
              </p>
            </div>
            <div className="bg-[#1e293b] p-6 rounded-lg border border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-400">
                Total Invoices
              </h3>
              <p className="font-serif text-3xl font-bold text-violet-400">
                {meta.total}
              </p>
            </div>
            <div className="bg-[#1e293b] p-6 rounded-lg border border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-400">
                Paid Invoices
              </h3>
              <p className="font-serif text-3xl font-bold text-violet-400">
                {data?.filter((inv) => inv.status === 'PAID').length || 0}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-64">
              <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Invoice Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">Failed to load invoices</p>
            </div>
          ) : !data?.length ? (
            <div className="text-center py-8">
              <p className="text-neutral-400">No invoices found</p>
            </div>
          ) : (
            <InvoiceTable
              invoices={data}
              meta={meta}
              onViewDetails={handleViewDetails}
              onPrint={handlePrint}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeacherInvoicesPage;
