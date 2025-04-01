
import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-12 pb-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">CoursePalette</h3>
            <p className="text-gray-600 mb-4">
              Expand your skills with professional courses and certificates. Learn from industry experts and transform your career.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-course-blue">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-course-blue">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-course-blue">
                <Linkedin size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-course-blue">
                <Instagram size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-course-blue">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses" className="text-gray-600 hover:text-course-blue">All Courses</Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-600 hover:text-course-blue">Categories</Link>
              </li>
              <li>
                <Link to="/certificates" className="text-gray-600 hover:text-course-blue">Certificates</Link>
              </li>
              <li>
                <Link to="/instructors" className="text-gray-600 hover:text-course-blue">Instructors</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/learners" className="text-gray-600 hover:text-course-blue">Learners</Link>
              </li>
              <li>
                <Link to="/partners" className="text-gray-600 hover:text-course-blue">Partners</Link>
              </li>
              <li>
                <Link to="/developers" className="text-gray-600 hover:text-course-blue">Developers</Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-course-blue">Blog</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-course-blue">Help Center</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-course-blue">Contact Us</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-course-blue">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-course-blue">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} CoursePalette. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
