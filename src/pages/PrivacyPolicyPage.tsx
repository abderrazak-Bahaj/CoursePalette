import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const sections = [
    { id: 'information', title: 'Information We Collect' },
    { id: 'usage', title: 'How We Use Your Information' },
    { id: 'sharing', title: 'Information Sharing and Disclosure' },
    { id: 'cookies', title: 'Cookies and Tracking Technologies' },
    { id: 'choices', title: 'Your Choices and Rights' },
    { id: 'security', title: 'Data Security' },
    { id: 'children', title: "Children's Privacy" },
    { id: 'international', title: 'International Data Transfers' },
    { id: 'changes', title: 'Changes to This Privacy Policy' },
    { id: 'contact', title: 'Contact Us' },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-gray-600 mb-2">Last Updated: June 15, 2023</p>

            <Card className="p-8 mb-8">
              <p className="mb-6">
                At CoursePalette, we respect your privacy and are committed to
                protecting your personal data. This privacy policy explains how
                we collect, use, and safeguard your information when you use our
                platform.
              </p>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="flex items-center text-course-blue hover:underline"
                        >
                          <ChevronRight className="h-4 w-4 mr-1" />
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <section id="information" className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  Information We Collect
                </h2>
                <p className="mb-4">
                  We collect several types of information from and about users
                  of our platform, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Personal Information:</strong> Name, email address,
                    phone number, billing address, payment information, and
                    academic history.
                  </li>
                  <li>
                    <strong>Profile Information:</strong> Profile photos,
                    biographical information, and educational background.
                  </li>
                  <li>
                    <strong>User Contributions:</strong> Course reviews, forum
                    posts, and other content you contribute to the platform.
                  </li>
                  <li>
                    <strong>Engagement Data:</strong> Course progress, quiz
                    scores, completion rates, and learning patterns.
                  </li>
                  <li>
                    <strong>Technical Data:</strong> IP address, browser type,
                    device information, and cookies.
                  </li>
                </ul>
              </section>

              <section id="usage" className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  How We Use Your Information
                </h2>
                <p className="mb-4">
                  We use the information we collect for various purposes,
                  including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Providing, operating, and maintaining our platform</li>
                  <li>
                    Processing transactions and sending related information
                  </li>
                  <li>Personalizing and improving your experience</li>
                  <li>
                    Providing customer support and responding to inquiries
                  </li>
                  <li>
                    Sending administrative information and important updates
                  </li>
                  <li>Sending marketing communications (with your consent)</li>
                  <li>Analyzing usage patterns to improve our platform</li>
                  <li>Detecting and preventing fraudulent activities</li>
                </ul>
              </section>

              <section id="sharing" className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  Information Sharing and Disclosure
                </h2>
                <p className="mb-4">
                  We may share your personal information in the following
                  situations:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    <strong>Service Providers:</strong> With third-party vendors
                    who provide services on our behalf.
                  </li>
                  <li>
                    <strong>Instructors:</strong> Course instructors have access
                    to student data related to their courses.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with a
                    merger, acquisition, or sale of assets.
                  </li>
                  <li>
                    <strong>Legal Compliance:</strong> When required by law or
                    to protect our rights.
                  </li>
                  <li>
                    <strong>With Your Consent:</strong> In other cases with your
                    explicit consent.
                  </li>
                </ul>
              </section>

              <section id="cookies" className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  Cookies and Tracking Technologies
                </h2>
                <p className="mb-4">
                  We use cookies and similar tracking technologies to track
                  activity on our platform and store certain information.
                  Cookies are files with a small amount of data that may include
                  an anonymous unique identifier.
                </p>
                <p className="mb-4">
                  You can instruct your browser to refuse all cookies or to
                  indicate when a cookie is being sent. However, if you do not
                  accept cookies, you may not be able to use some portions of
                  our platform.
                </p>
              </section>

              {/* Additional sections would continue here with similar structure */}
              <section id="contact" className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please
                  contact us at:
                </p>
                <p className="mt-2">
                  <strong>Email:</strong> privacy@coursepalette.com
                  <br />
                  <strong>Address:</strong> 123 Education Street, San Francisco,
                  CA 94107, United States
                  <br />
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </section>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicyPage;
