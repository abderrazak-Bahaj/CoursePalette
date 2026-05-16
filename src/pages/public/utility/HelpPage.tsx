import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ds/primitives/Card';
import { Button } from '@/components/ds/primitives/Button';
import { Input } from '@/components/ds/primitives/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  HelpCircle,
  Search,
  FileText,
  Mail,
  Book,
  MessageCircle,
} from 'lucide-react';

const HelpPage = () => {
  const faqItems = [
    {
      question: 'How do I enroll in a course?',
      answer:
        "To enroll in a course, navigate to the course details page and click the 'Enroll Now' button. Follow the checkout process to complete your enrollment. Once enrolled, the course will appear in your dashboard.",
    },
    {
      question: 'Can I download course materials for offline viewing?',
      answer:
        'Yes, most course materials can be downloaded for offline viewing. Look for the download icon next to videos and resources. Note that some materials may not be available for download due to copyright restrictions.',
    },
    {
      question: 'How do I get a certificate after completing a course?',
      answer:
        "Certificates are automatically issued once you've completed all required modules and passed any necessary assessments. You can view and download your certificates from the 'Certificates' section in your dashboard.",
    },
    {
      question: 'What payment methods are accepted?',
      answer:
        'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for some regions. Payment options will be displayed during checkout.',
    },
    {
      question: 'How long do I have access to a course after purchasing?',
      answer:
        'Once you purchase a course, you have lifetime access to the course materials. You can revisit the content as many times as you need.',
    },
    {
      question: "Can I get a refund if I'm not satisfied with a course?",
      answer:
        "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with a course, you can request a refund within 30 days of purchase by contacting our support team.",
    },
  ];

  const categories = [
    {
      title: 'Account & Profile',
      icon: <Book className="h-5 w-5" />,
      count: 15,
    },
    {
      title: 'Courses & Enrollment',
      icon: <FileText className="h-5 w-5" />,
      count: 23,
    },
    {
      title: 'Payments & Billing',
      icon: <Mail className="h-5 w-5" />,
      count: 18,
    },
    {
      title: 'Certificates',
      icon: <MessageCircle className="h-5 w-5" />,
      count: 9,
    },
    {
      title: 'Technical Issues',
      icon: <HelpCircle className="h-5 w-5" />,
      count: 12,
    },
  ];

  return (
    <MainLayout>
      <div className="bg-[#0f172a] py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl font-bold text-neutral-50 mb-2">
              How can we help you?
            </h1>
            <p className="text-neutral-400 max-w-2xl mx-auto mb-8">
              Find answers to common questions or contact our support team for
              further assistance.
            </p>
            <div className="max-w-2xl mx-auto flex relative">
              <Input variant="search" placeholder="Search for answers..." />
              <Search className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          <Tabs defaultValue="faq" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="faq">Frequent Questions</TabsTrigger>
              <TabsTrigger value="categories">Help Categories</TabsTrigger>
              <TabsTrigger value="contact">Contact Support</TabsTrigger>
            </TabsList>

            <TabsContent value="faq">
              <Card>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-neutral-400">{item.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                  <Card key={index} variant="interactive">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="bg-violet-600/10 p-3 rounded-full mr-4 text-violet-400">
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-100 mb-1">
                            {category.title}
                          </h3>
                          <p className="text-sm text-neutral-500 mb-3">
                            {category.count} articles
                          </p>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="mt-2"
                          >
                            View Articles
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <Card variant="elevated">
                <CardContent className="pt-6">
                  <div className="max-w-xl mx-auto">
                    <h2 className="font-serif text-xl font-semibold text-neutral-50 mb-4">
                      Get in Touch
                    </h2>
                    <p className="text-neutral-400 mb-6">
                      Can't find what you're looking for? Our support team is
                      here to help.
                    </p>

                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-neutral-300 mb-1"
                          >
                            Name
                          </label>
                          <Input
                            variant="default"
                            id="name"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-neutral-300 mb-1"
                          >
                            Email
                          </label>
                          <Input
                            variant="default"
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-neutral-300 mb-1"
                        >
                          Subject
                        </label>
                        <Input
                          variant="default"
                          id="subject"
                          placeholder="How can we help you?"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-neutral-300 mb-1"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          rows={5}
                          className="w-full px-3 py-2 bg-[#1e293b] border border-neutral-600 rounded-md text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-violet-500 focus:shadow-glow-violet"
                          placeholder="Describe your issue in detail..."
                        ></textarea>
                      </div>

                      <Button variant="action" className="w-full md:w-auto">
                        Submit Request
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default HelpPage;
