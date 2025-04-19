import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Award, Download, Share2, ChevronLeft, Printer } from 'lucide-react';
import { certificateService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import WrapperLoading from '@/components/ui/wrapper-loading';

const CertificateDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['certificate', courseId],
    queryFn: async () => await certificateService.getCertificate(courseId),
  });

  const certificate = data?.certificate;

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

  const handlePrint = () => {
    window.print();
  };

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

                  {/* Certificate display */}
                  <div className="border-4 border-gray-300 p-8 mb-6 bg-white print:p-4 print:border-0">
                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-2">
                        COURSEPALETTE
                      </div>
                      <div className="text-3xl font-bold mb-1 text-course-blue">
                        CERTIFICATE OF COMPLETION
                      </div>
                      <div className="mx-auto w-32 h-1 bg-course-blue mb-8"></div>

                      <div className="mb-2 text-lg">
                        This is to certify that
                      </div>
                      <div className="text-3xl font-serif mb-2">
                        {certificate?.user.name}
                      </div>
                      <div className="mb-6 text-lg">
                        has successfully completed the online course
                      </div>

                      <div className="text-2xl font-bold mb-6">
                        {certificate?.course.title}
                      </div>

                      <div className="grid grid-cols-2 gap-8 text-center mb-8">
                        <div>
                          <div className="font-bold mb-1">Issue Date</div>
                          <div>
                            {new Date(
                              certificate?.issue_date
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold mb-1">Certificate ID</div>
                          <div>{certificate?.certificate_number}</div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="border-t-2 border-gray-300 pt-4 w-48">
                          <div className="font-bold">Course Instructor</div>
                          <div>{certificate?.instructor.name}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 print:hidden">
                    <Button className="flex-1 bg-course-blue">
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

              <div className="lg:w-1/3 print:hidden">
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
