import { useParams } from 'react-router-dom';
import { certificateService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useRef } from 'react';

const DownloadableCertificate = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const certificateRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['certificate', courseId],
    queryFn: async () => await certificateService.getCertificate(courseId),
  });

  const certificate = data?.certificate;

  useEffect(() => {
    const generatePDF = async () => {
      if (!certificateRef.current || !certificate) return;

      try {
        // Set specific dimensions for the certificate (A4 Landscape)
        const certificateWidth = 842; // A4 width in points (11.7 inches)
        const certificateHeight = 595; // A4 height in points (8.3 inches)

        const canvas = await html2canvas(certificateRef.current, {
          scale: 3, // Higher scale for better quality
          width: certificateWidth,
          height: certificateHeight,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          onclone: (document, element) => {
            // Ensure fonts are loaded
            document.fonts.ready.then(() => {
              console.log('Fonts loaded');
            });
          },
        });

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

        // Close the tab after a short delay to ensure download starts
        setTimeout(() => {
          window.close();
        }, 1000);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    };

    generatePDF();
  }, [certificate]);

  if (!certificate) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-white">
      <div
        ref={certificateRef}
        className="w-[842pt] h-[595pt] mx-auto bg-white"
        style={{
          position: 'relative',
          padding: '40pt',
          boxSizing: 'border-box',
          border: '2px solid #e5e7eb',
          margin: '20px auto',
        }}
      >
        <div className="text-center h-full flex flex-col justify-between">
          <div>
            <div className="text-gray-400 text-base mb-4">COURSEPALETTE</div>
            <div
              className="text-4xl font-bold mb-2 text-course-blue"
              style={{
                fontFamily: 'Georgia, serif',
                color: '#2563eb',
                letterSpacing: '0.05em',
              }}
            >
              CERTIFICATE OF COMPLETION
            </div>
            <div className="mx-auto w-32 h-0.5 bg-course-blue mb-12"></div>
          </div>

          <div
            className="flex-grow flex flex-col justify-center"
            style={{ margin: '40pt 0' }}
          >
            <div className="text-lg mb-4" style={{ color: '#4b5563' }}>
              This is to certify that
            </div>
            <div
              className="text-4xl mb-4"
              style={{
                fontFamily: 'Georgia, serif',
                color: '#1f2937',
                fontWeight: 600,
                marginBottom: '20pt',
              }}
            >
              {certificate.user.name}
            </div>
            <div className="text-lg mb-8" style={{ color: '#4b5563' }}>
              has successfully completed the online course
            </div>

            <div
              className="text-2xl font-bold mb-12"
              style={{
                color: '#1f2937',
                fontFamily: 'Georgia, serif',
                maxWidth: '80%',
                margin: '0 auto 40pt',
              }}
            >
              {certificate.course.title}
            </div>

            <div
              className="grid grid-cols-2 gap-16 text-center mb-12 max-w-2xl mx-auto"
              style={{ marginBottom: '40pt' }}
            >
              <div>
                <div className="font-bold mb-2" style={{ color: '#4b5563' }}>
                  Issue Date
                </div>
                <div style={{ color: '#1f2937' }}>
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
              <div>
                <div className="font-bold mb-2" style={{ color: '#4b5563' }}>
                  Certificate ID
                </div>
                <div style={{ color: '#1f2937', fontFamily: 'monospace' }}>
                  {certificate.certificate_number}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-center">
              <div
                style={{
                  borderTop: '2px solid #e5e7eb',
                  paddingTop: '20pt',
                  width: '200pt',
                  textAlign: 'center',
                }}
              >
                <div className="font-bold mb-2" style={{ color: '#4b5563' }}>
                  Course Instructor
                </div>
                <div style={{ color: '#1f2937' }}>
                  {certificate.instructor.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadableCertificate;
