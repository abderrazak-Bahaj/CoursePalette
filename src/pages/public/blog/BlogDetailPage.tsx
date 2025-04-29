import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Share2,
  Bookmark,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
} from 'lucide-react';

const mockBlogPosts = [
  {
    id: '1',
    title: 'Getting Started with JavaScript for Beginners',
    content: `
      <p class="lead">JavaScript is a powerful and versatile programming language that's essential for modern web development. This guide will help beginners get started on the right track.</p>
      
      <h2>What is JavaScript?</h2>
      <p>JavaScript is a high-level, interpreted programming language that enables interactive web pages. It's an essential part of web development along with HTML and CSS.</p>
      
      <h2>Setting Up Your Development Environment</h2>
      <p>To start writing JavaScript, all you need is a text editor and a web browser. Here's a simple setup process:</p>
      <ol>
        <li>Choose a text editor like Visual Studio Code, Sublime Text, or Atom</li>
        <li>Create a new file with a .js extension</li>
        <li>Write your JavaScript code</li>
        <li>Link it to your HTML file using the script tag</li>
      </ol>
      
      <h2>JavaScript Basics</h2>
      <p>Let's cover some fundamental concepts in JavaScript:</p>
      
      <h3>Variables and Data Types</h3>
      <p>Variables are containers for storing data values. Here's how you declare variables in JavaScript:</p>
      <pre><code>
// Using let (recommended for variables that will change)
let age = 25;

// Using const (for variables that won't change)
const name = "John";

// JavaScript has several data types
let num = 42;            // Number
let str = "Hello";       // String
let isTrue = true;       // Boolean
let arr = [1, 2, 3];     // Array
let obj = {name: "John"}; // Object
let empty = null;        // Null
      </code></pre>
      
      <h3>Functions</h3>
      <p>Functions are blocks of code designed to perform a particular task. Here's a simple function:</p>
      <pre><code>
// Function declaration
function greet(name) {
  return "Hello, " + name + "!";
}

// Function call
console.log(greet("World")); // Outputs: Hello, World!

// Arrow function (ES6)
const multiply = (a, b) => a * b;
console.log(multiply(2, 3)); // Outputs: 6
      </code></pre>
      
      <h2>Next Steps in Your JavaScript Journey</h2>
      <p>Once you're comfortable with the basics, you can explore more advanced topics:</p>
      <ul>
        <li>DOM manipulation</li>
        <li>Event handling</li>
        <li>Asynchronous JavaScript (Promises, async/await)</li>
        <li>ES6+ features</li>
        <li>JavaScript frameworks like React, Vue, or Angular</li>
      </ul>
      
      <p>Remember, learning to code is a journey. Take your time, practice regularly, and don't be afraid to make mistakes!</p>
    `,
    author: 'Dr. Alex Johnson',
    authorRole: 'Senior Web Development Instructor',
    authorBio:
      'Dr. Alex Johnson has over 10 years of experience in web development and has taught thousands of students through online courses and workshops.',
    authorAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    date: 'October 15, 2023',
    category: 'Web Development',
    readTime: '8 min read',
    tags: ['JavaScript', 'Web Development', 'Programming', 'Beginner'],
    image:
      'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    comments: 12,
    related: [2, 3, 6],
  },
  {
    id: '2',
    title: '10 Tips for Effective Learning Online',
    content: `Content for the second blog post would go here...`,
    author: 'Sarah Williams',
    authorRole: 'Educational Psychologist',
    authorBio:
      'Sarah Williams specializes in online learning methodologies and has conducted extensive research on effective digital education practices.',
    authorAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    date: 'October 10, 2023',
    category: 'Learning Tips',
    readTime: '6 min read',
    tags: ['Online Learning', 'Study Tips', 'Education'],
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    comments: 8,
    related: [1, 4, 5],
  },
  {
    id: '3',
    title: 'Understanding Machine Learning Algorithms',
    content: `Content for the third blog post would go here...`,
    author: 'Michael Chen',
    authorRole: 'Data Science Professor',
    authorBio:
      'Michael Chen is a professor of Data Science with a focus on machine learning applications in business and healthcare.',
    authorAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    date: 'October 5, 2023',
    category: 'Data Science',
    readTime: '12 min read',
    tags: ['Machine Learning', 'Data Science', 'AI'],
    image:
      'https://images.unsplash.com/photo-1527474305487-b87b222841cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    comments: 15,
    related: [1, 5, 6],
  },
  {
    id: '4',
    title: 'How to Build Your First Mobile App',
    content: `Content for the fourth blog post would go here...`,
    author: 'James Wilson',
    authorRole: 'Mobile App Developer',
    authorBio:
      'James Wilson has developed over 20 successful mobile applications and runs a popular YouTube channel teaching app development.',
    authorAvatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    date: 'September 28, 2023',
    category: 'Mobile Development',
    readTime: '10 min read',
    tags: ['Mobile Development', 'App Development', 'Programming'],
    image:
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    comments: 7,
    related: [1, 2, 6],
  },
  {
    id: '5',
    title: 'The Future of Cloud Computing in Education',
    content: `Content for the fifth blog post would go here...`,
    author: 'Maria Garcia',
    authorRole: 'Cloud Solutions Architect',
    authorBio:
      'Maria Garcia has worked with major educational institutions to implement cloud solutions that enhance learning experiences.',
    authorAvatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    date: 'September 22, 2023',
    category: 'Cloud Computing',
    readTime: '7 min read',
    tags: ['Cloud Computing', 'Education Technology', 'Future Tech'],
    image:
      'https://images.unsplash.com/photo-1584854444132-6df1938fedf4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    comments: 5,
    related: [2, 3, 6],
  },
  {
    id: '6',
    title: 'Essential UX Design Principles Every Developer Should Know',
    content: `Content for the sixth blog post would go here...`,
    author: 'Lisa Roberts',
    authorRole: 'UX Design Lead',
    authorBio:
      'Lisa Roberts bridges the gap between design and development, helping teams create more user-friendly digital experiences.',
    authorAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    date: 'September 15, 2023',
    category: 'UX Design',
    readTime: '9 min read',
    tags: ['UX Design', 'Web Development', 'Design Principles'],
    image:
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    comments: 10,
    related: [1, 2, 4],
  },
];

const BlogDetailPage = () => {
  const { id } = useParams();
  const post = mockBlogPosts.find((post) => post.id === id);

  if (!post) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const relatedPosts = post.related
    .map((id) => mockBlogPosts.find((p) => p.id === id.toString()))
    .filter(Boolean);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/blog" className="flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Blog
            </Link>
          </Button>

          <div className="mx-auto max-w-4xl">
            <div className="mb-6">
              <Badge variant="outline" className="mb-4">
                {post.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-8">
                <div className="flex items-center mr-6 mb-2">
                  <Avatar className="h-10 w-10 mr-2">
                    <AvatarImage src={post.authorAvatar} alt={post.author} />
                    <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center mr-6 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center mr-6 mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{post.readTime}</span>
                </div>
                <div className="flex items-center mb-2">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{post.comments} comments</span>
                </div>
              </div>
            </div>

            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div
              className="prose prose-lg max-w-none mb-10"
              dangerouslySetInnerHTML={{ __html: post.content }}
            ></div>

            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex justify-between items-center mb-10">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Bookmark className="h-4 w-4" />
                  Save
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className="my-10" />

            <div className="flex flex-col md:flex-row gap-6 items-start mb-10">
              <Avatar className="h-20 w-20">
                <AvatarImage src={post.authorAvatar} alt={post.author} />
                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold mb-1">{post.author}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {post.authorRole}
                </p>
                <p className="mb-3">{post.authorBio}</p>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </div>

            <Separator className="my-10" />

            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link to={`/blog/${relatedPost?.id}`} key={relatedPost?.id}>
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <div className="w-full h-40 overflow-hidden">
                        <img
                          src={relatedPost?.image}
                          alt={relatedPost?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <Badge variant="outline" className="mb-2 inline-flex">
                          {relatedPost?.category}
                        </Badge>
                        <CardTitle className="text-lg line-clamp-2">
                          {relatedPost?.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{relatedPost?.date}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Comments (12)</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center py-8 text-muted-foreground">
                    Comments functionality will be implemented in a future
                    update.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BlogDetailPage;
