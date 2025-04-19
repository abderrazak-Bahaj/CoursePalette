import { get } from './apiClient';

export const certificateService = {
  getCertificates: () => {
    return get(`/certificates`);
  },
  getCertificate: (courseId: string) => {
    return get(`/courses/${courseId}/certificate`);
  },
  checkCertificateByNumber: (certificateNumber: string) => {
    return get(`/certificates/check?certificate_number=${certificateNumber}`);
  },
};
