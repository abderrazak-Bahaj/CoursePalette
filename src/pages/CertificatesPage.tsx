
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockCertificates } from "@/data/mockData";
import { Award, Download, Share2 } from "lucide-react";

const CertificatesPage = () => {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <div className="rounded-full bg-course-blue bg-opacity-10 p-3 mr-4">
              <Award className="h-8 w-8 text-course-blue" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">My Certificates</h1>
              <p className="text-gray-600">
                View and share your earned certificates
              </p>
            </div>
          </div>
          
          {mockCertificates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Award className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Certificates Yet</h2>
              <p className="text-gray-500 mb-6">
                Complete a course to earn your first certificate
              </p>
              <Button asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCertificates.map((certificate) => (
                <CertificateCard key={certificate.id} certificate={certificate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

interface CertificateCardProps {
  certificate: {
    id: string;
    title: string;
    issueDate: string;
    courseId: string;
    courseName: string;
    image: string;
  };
}

const CertificateCard = ({ certificate }: CertificateCardProps) => {
  return (
    <Card className="overflow-hidden course-card-shadow">
      <div className="bg-course-navy text-white p-4 flex items-center justify-between">
        <h3 className="font-semibold line-clamp-1">{certificate.title}</h3>
        <Award className="h-5 w-5" />
      </div>
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="aspect-[16/9] mb-4 relative">
            {/* Certificate preview */}
            <div className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center p-4 border-4 border-gray-300 w-full h-full flex flex-col items-center justify-center">
                <div className="text-lg font-bold mb-2">CERTIFICATE</div>
                <div className="text-md mb-1">This certifies that</div>
                <div className="text-xl font-bold mb-1">John Doe</div>
                <div className="text-md mb-3">successfully completed</div>
                <div className="text-lg font-semibold mb-1">{certificate.courseName}</div>
                <div className="text-sm text-gray-500">Issued on {certificate.issueDate}</div>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">Course</div>
            <Link 
              to={`/courses/${certificate.courseId}`}
              className="font-medium hover:text-course-blue transition-colors line-clamp-2"
            >
              {certificate.courseName}
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Issue Date</div>
              <div className="text-sm">{certificate.issueDate}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Credential ID</div>
              <div className="text-sm">CERT-{certificate.id}</div>
            </div>
          </div>
        </div>
        
        <div className="flex p-4">
          <Button 
            asChild
            variant="outline" 
            className="mr-2 flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Link to={`/certificates/${certificate.id}`}>
              View
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="mr-2"
            onClick={(e) => {
              e.stopPropagation();
              // Download functionality would be implemented here
              alert("Certificate download started");
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              // Share functionality would be implemented here
              alert("Share certificate");
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificatesPage;
