import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

const TermsPage = () => {
  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'changes', title: 'Changes to Terms' },
    { id: 'accounts', title: 'User Accounts' },
    { id: 'content', title: 'User Content' },
    { id: 'conduct', title: 'Code of Conduct' },
    { id: 'intellectual', title: 'Intellectual Property Rights' },
    { id: 'payments', title: 'Payments and Refunds' },
    { id: 'termination', title: 'Termination' },
    { id: 'disclaimer', title: 'Disclaimer of Warranties' },
    { id: 'limitation', title: 'Limitation of Liability' },
    { id: 'indemnification', title: 'Indemnification' },
    { id: 'governing', title: 'Governing Law' },
    { id: 'contact', title: 'Contact Information' },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <p className="text-gray-600 mb-2">Last Updated: June 15, 2023</p>

            <Card className="p-8 mb-8">
              <p className="mb-6">
                Please read these Terms of Service carefully before using the
                CoursePalette platform. These Terms govern your access to and
                use of the services, websites, and applications offered by
                CoursePalette.
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

              <section id="acceptance" className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="mb-4">
                  By accessing or using the CoursePalette platform, you agree to
                  be bound by these Terms and all applicable laws and
                  regulations. If you do not agree with any of these terms, you
                  are prohibited from using or accessing this platform.
                </p>
              </section>

              <section id="changes" className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  2. Changes to Terms
                </h2>
                <p className="mb-4">
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. If a revision is material, we
                  will provide at least 30 days' notice prior to any new terms
                  taking effect. What constitutes a material change will be
                  determined at our sole discretion.
                </p>
                <p className="mb-4">
                  By continuing to access or use our platform after those
                  revisions become effective, you agree to be bound by the
                  revised terms. If you do not agree to the new terms, please
                  stop using the platform.
                </p>
              </section>

              <section id="accounts" className="mb-8">
                <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
                <p className="mb-4">
                  When you create an account with us, you must provide
                  information that is accurate, complete, and current at all
                  times. Failure to do so constitutes a breach of the Terms,
                  which may result in immediate termination of your account on
                  our platform.
                </p>
                <p className="mb-4">
                  You are responsible for safeguarding the password that you use
                  to access the platform and for any activities or actions under
                  your password. You agree not to disclose your password to any
                  third party. You must notify us immediately upon becoming
                  aware of any breach of security or unauthorized use of your
                  account.
                </p>
              </section>

              <section id="content" className="mb-8">
                <h2 className="text-xl font-semibold mb-4">4. User Content</h2>
                <p className="mb-4">
                  Our platform allows you to post, link, store, share and
                  otherwise make available certain information, text, graphics,
                  videos, or other material. You are responsible for the content
                  that you post on or through the platform, including its
                  legality, reliability, and appropriateness.
                </p>
                <p className="mb-4">
                  By posting content on or through the platform, you represent
                  and warrant that:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                  <li>
                    The content is yours (you own it) or you have the right to
                    use it and grant us the rights and license as provided in
                    these Terms.
                  </li>
                  <li>
                    The posting of your content on or through the platform does
                    not violate the privacy rights, publicity rights,
                    copyrights, contract rights or any other rights of any
                    person.
                  </li>
                </ul>
                <p className="mb-4">
                  We reserve the right to remove any content from the platform
                  at our discretion, without prior notice, for any reason
                  whatsoever.
                </p>
              </section>

              {/* Additional sections would continue here */}

              <section id="contact" className="mt-8">
                <h2 className="text-xl font-semibold mb-4">
                  13. Contact Information
                </h2>
                <p>
                  If you have any questions about these Terms, please contact us
                  at:
                </p>
                <p className="mt-2">
                  <strong>Email:</strong> legal@coursepalette.com
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

export default TermsPage;
