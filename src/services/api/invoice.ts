import { get, post, put, API_BASE_URL, getAuthToken } from './apiClient';
import { PaginatedResponse } from '../pagination/PaginationService';

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  subtotal: string | number;
  tax: string | number;
  total: string | number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  created_at: string;
  paid_at?: string;
  items: Array<{
    course_id: string;
    title: string;
    price: string | number;
  }>;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  payments?: Array<{
    id: string;
    amount: string | number;
    payment_method: string;
    transaction_id: string;
    status: string;
    paid_at?: string;
  }>;
}

export interface InvoiceFilters {
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

export const invoiceApi = {
  // Student endpoints
  getInvoices: async (filters?: InvoiceFilters) => {
    const response = await get('/invoices', {
      params: filters as Record<string, string>,
    });
    return response as PaginatedResponse<Invoice>;
  },

  getInvoice: async (id: string) => {
    const response = await get(`/invoices/${id}`);
    return (response as { data: Invoice }).data;
  },

  printInvoice: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/print`, {
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${id}.pdf`);

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL
    window.URL.revokeObjectURL(url);
  },

  // Teacher endpoints
  getTeacherInvoices: async (filters?: InvoiceFilters) => {
    const response = await get('/teacher/invoices', {
      params: filters as Record<string, string>,
    });
    return response as PaginatedResponse<Invoice>;
  },

  // Admin endpoints
  getAdminInvoices: async (filters?: InvoiceFilters) => {
    const response = await get('/admin/invoices', {
      params: filters as Record<string, string>,
    });
    return response as PaginatedResponse<Invoice>;
  },

  exportInvoices: async (filters?: InvoiceFilters) => {
    const response = await get('/admin/invoices/export', {
      params: filters as Record<string, string>,
    });
    return response;
  },
};
