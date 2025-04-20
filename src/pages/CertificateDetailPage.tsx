import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Award, Download, Share2, ChevronLeft, Printer } from 'lucide-react';
import { certificateService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import WrapperLoading from '@/components/ui/wrapper-loading';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';
import DisplayCertificate from '@/components/certificate/DisplayCertificate';
import HideCertificate from '@/components/certificate/HideCertificate';

const CertificateDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const certificateRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['certificate', courseId],
    queryFn: async () => await certificateService.getCertificate(courseId),
  });

  const certificate = data?.certificate;

  const handleDownload = async () => {
    if (!certificateRef.current || !certificate) return;

    try {
      // Set specific dimensions for the certificate (A4 Landscape)
      const certificateWidth = 842; // A4 width in points (11.7 inches)
      const certificateHeight = 595; // A4 height in points (8.3 inches)

      // Create a temporary container for better rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      document.body.appendChild(tempContainer);

      // Clone the certificate for PDF generation
      const certificateClone = certificateRef.current.cloneNode(
        true
      ) as HTMLElement;
      certificateClone.style.width = `${certificateWidth}pt`;
      certificateClone.style.height = `${certificateHeight}pt`;
      certificateClone.style.backgroundColor = 'white';
      tempContainer.appendChild(certificateClone);

      const canvas = await html2canvas(certificateClone, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        onclone: (document, element) => {
          document.fonts.ready.then(() => {
            console.log('Fonts loaded');
          });
        },
      });

      // Clean up temporary container
      document.body.removeChild(tempContainer);

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });

      // Add the canvas as an image
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, certificateWidth, certificateHeight);

      // Download the PDF
      pdf.save(`${certificate.certificate_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!certificate && !isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Certificate Not Found</h1>
          <p className="mb-6">
            The certificate you are looking for does not exist.
          </p>
          <Button asChild>
            <Link to="/certificates">Back to Certificates</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <WrapperLoading isLoading={isLoading}>
        <div className="bg-gray-50 py-8 print:bg-white print:py-0">
          <div className="container mx-auto px-4">
            <div className="mb-6 print:hidden">
              <Link
                to={`/courses/${courseId}`}
                className="inline-flex items-center text-gray-600 hover:text-course-blue"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Course
              </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 print:block">
              <div className="lg:w-2/3 print:w-full">
                <Card className="p-6 mb-6 print:shadow-none print:border-0">
                  <div className="flex items-center justify-between mb-6 print:mb-2">
                    <h1 className="text-2xl font-bold">
                      {certificate?.course.title}
                    </h1>
                    <Award className="h-6 w-6 text-course-blue" />
                  </div>
                  <DisplayCertificate certificate={certificate} />
                  <div className="hidden">
                    <HideCertificate
                      certificate={certificate}
                      ref={certificateRef}
                    />
                  </div>
                  <div className="flex space-x-4 print:hidden mt-20">
                    <Button
                      className="flex-1 bg-course-blue"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="lg:w-1/3 ">
                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">
                    Certificate Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        Certificate Name
                      </div>
                      <div className="font-medium">
                        {certificate?.course.title}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Course</div>
                      <Link
                        to={`/courses/${certificate?.course.id}`}
                        className="font-medium hover:text-course-blue transition-colors"
                      >
                        {certificate?.course.title}
                      </Link>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        Issue Date
                      </div>
                      <div>
                        {new Date(certificate?.issue_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        Completion Date
                      </div>
                      <div>{certificate?.metadata.completion_date}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Grade</div>
                      <div>{certificate?.metadata.grade}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        Recipient
                      </div>
                      <div>{certificate?.user.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        Certificate ID
                      </div>
                      <div>{certificate?.certificate_number}</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">Verification</h2>
                  <p className="text-gray-600 mb-4">
                    This certificate can be verified by potential employers or
                    educational institutions using the Certificate ID.
                  </p>
                  <div className="p-3 bg-gray-100 rounded-md mb-4 font-mono text-sm">
                    {certificate?.certificate_number}
                  </div>
                  <Button variant="outline" className="w-full">
                    Verify Certificate
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <style>
          {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:block, .print\\:block *,
            .print\\:w-full, .print\\:w-full *,
            .print\\:shadow-none, .print\\:shadow-none *,
            .print\\:border-0, .print\\:border-0 *,
            .print\\:p-4, .print\\:p-4 *,
            .print\\:bg-white, .print\\:bg-white *,
            .print\\:py-0, .print\\:py-0 * {
              visibility: visible;
            }
            .print\\:hidden {
              display: none !important;
            }
            main {
              background: white;
              height: 100%;
              width: 100%;
              position: fixed;
              top: 0;
              left: 0;
              margin: 0;
              padding: 30px;
            }
          }
        `}
        </style>
      </WrapperLoading>
    </MainLayout>
  );
};

export default CertificateDetailPage;
