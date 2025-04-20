import { forwardRef } from 'react';

interface CertificateData {
  user: {
    name: string;
  };
  course: {
    title: string;
  };
  issue_date: string;
  certificate_number: string;
  instructor: {
    name: string;
  };
}

interface DisplayCertificateProps {
  certificate: CertificateData;
  className?: string;
}

const DisplayCertificate = forwardRef<HTMLDivElement, DisplayCertificateProps>(
  ({ certificate, className = '' }, ref) => {
    return (
      <div ref={ref} className={`relative bg-white ${className}`}>
        <div className="text-center h-full flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="text-gray-400 text-base mb-4 tracking-widest">
              COURSEPALETTE
            </div>
            <div className="text-[32pt] font-bold text-[#0066FF] font-georgia tracking-wide mb-2">
              CERTIFICATE OF COMPLETION
            </div>
            <div className="mx-auto w-[120pt] h-[1pt] bg-[#0066FF] mb-10"></div>
          </div>

          {/* Content */}
          <div className="flex-grow flex flex-col justify-center space-y-6">
            <div className="text-gray-600 text-lg">This is to certify that</div>
            <div className="text-[32pt] font-georgia text-gray-900 font-semibold">
              {certificate.user.name}
            </div>
            <div className="text-gray-600 text-lg">
              has successfully completed the online course
            </div>

            <div className="text-[24pt] font-georgia text-gray-900 font-bold max-w-[80%] mx-auto mt-4">
              {certificate.course.title}
            </div>

            <div className="grid grid-cols-2 gap-16 max-w-[500pt] mx-auto mt-10">
              <div className="text-center">
                <div className="text-gray-600 font-bold mb-2">Issue Date</div>
                <div className="text-gray-900">
                  {new Date(certificate.issue_date).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 font-bold mb-2">
                  Certificate ID
                </div>
                <div className="text-gray-900 font-mono">
                  {certificate.certificate_number}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-10">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-[200pt] h-[1px] bg-gray-300"></div>
                <div className="pt-5 text-center">
                  <div className="text-gray-600 font-bold mb-2">
                    Course Instructor
                  </div>
                  <div className="text-gray-900">
                    {certificate.instructor.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DisplayCertificate.displayName = 'DisplayCertificate';

export default DisplayCertificate;
