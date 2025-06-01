import { post } from './apiClient';

interface PaymentData {
  course_ids: string[];
  payment_method?: string;
}

interface CapturePaymentData {
  order_id: string;
  invoice_id: string;
}

interface PaymentResponse {
  invoice?: {
    id: string;
    invoice_number: string;
    total: number;
    status: string;
  };
  order_id?: string;
  invoice_id?: string;
  approval_url?: string;
  message?: string;
}

export const paymentService = {
  processEnrollment: (data: PaymentData): Promise<PaymentResponse> => {
    return post('/payments/create-order', data);
  },

  capturePayment: (data: CapturePaymentData): Promise<PaymentResponse> => {
    return post('/payments/capture-order', data);
  },
};
