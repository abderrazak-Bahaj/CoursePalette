import { get, post } from './apiClient';

interface CertificateData {
  user_id?: string;
  title: string;
  description?: string;
  template?: File;
  issued_at?: string;
}

export const certificateService = {
  getCourseCertificates: (courseId: string) => {
    return get(`/courses/${courseId}/certificates`);
  },

  getCertificate: (courseId: string, certificateId: string) => {
    return get(`/courses/${courseId}/certificates/${certificateId}`);
  },

  createCertificate: (courseId: string, data: CertificateData) => {
    // Use FormData for file uploads
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });

    return post(`/courses/${courseId}/certificates`, formData);
  },

  generateCertificate: (courseId: string, certificateId: string) => {
    return post(`/courses/${courseId}/certificates/${certificateId}/generate`);
  },

  downloadCertificate: (courseId: string, certificateId: string) => {
    return get(`/courses/${courseId}/certificates/${certificateId}/download`);
  },
};
