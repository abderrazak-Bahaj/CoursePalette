import { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User } from 'lucide-react';

const mockBlogPosts = [
  {
    id: 1,
    title: 'Getting Started with JavaScript for Beginners',
    excerpt:
      'Learn the basics of JavaScript programming and start your journey as a web developer with this comprehensive guide for beginners.',
    author: 'Dr. Alex Johnson',
    authorAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    date: 'October 15, 2023',
    category: 'Web Development',
    readTime: '8 min read',
    image:
      'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: 2,
    title: '10 Tips for Effective Learning Online',
    excerpt:
      'Discover proven strategies to make the most of your online learning experience. These practical tips will help you stay motivated and achieve your learning goals.',
    author: 'Sarah Williams',
    authorAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    date: 'October 10, 2023',
    category: 'Learning Tips',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: 3,
    title: 'Understanding Machine Learning Algorithms',
    excerpt:
      "Explore the fundamentals of machine learning algorithms and how they're transforming industries. A clear introduction for non-technical readers.",
    author: 'Michael Chen',
    authorAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    date: 'October 5, 2023',
    category: 'Data Science',
    readTime: '12 min read',
    image:
      'https://images.unsplash.com/photo-1527474305487-b87b222841cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: 4,
    title: 'How to Build Your First Mobile App',
    excerpt:
      'A step-by-step guide to creating your first mobile application. Learn about the tools, frameworks, and best practices for successful app development.',
    author: 'James Wilson',
    authorAvatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    date: 'September 28, 2023',
    category: 'Mobile Development',
    readTime: '10 min read',
    image:
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: 5,
    title: 'The Future of Cloud Computing in Education',
    excerpt:
      'Explore how cloud computing is revolutionizing education and creating new opportunities for students and educators in the digital age.',
    author: 'Maria Garcia',
    authorAvatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    date: 'September 22, 2023',
    category: 'Cloud Computing',
    readTime: '7 min read',
    image:
      'https://images.unsplash.com/photo-1584854444132-6df1938fedf4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: 6,
    title: 'Essential UX Design Principles Every Developer Should Know',
    excerpt:
      'Discover the key UX design principles that developers need to understand to create user-friendly and engaging applications and websites.',
    author: 'Lisa Roberts',
    authorAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    date: 'September 15, 2023',
    category: 'UX Design',
    readTime: '9 min read',
    image:
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
];

const categories = [
  'All',
  'Web Development',
  'Data Science',
  'Mobile Development',
  'UX Design',
  'Cloud Computing',
  'Learning Tips',
];

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = mockBlogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Learning Resources & Insights
          </h1>
          <p className="text-lg opacity-90 mb-6 max-w-2xl">
            Explore our collection of articles, tutorials, and resources to
            enhance your learning journey and stay updated with the latest in
            education.
          </p>
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <Input
              placeholder="Search articles..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs
          defaultValue="all"
          className="space-y-8"
          onValueChange={(value) =>
            setSelectedCategory(value === 'all' ? 'All' : value)
          }
        >
          <div className="flex justify-between items-center">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="Web Development">Web Dev</TabsTrigger>
              <TabsTrigger value="Data Science">Data Science</TabsTrigger>
              <TabsTrigger value="Learning Tips">Learning Tips</TabsTrigger>
              <TabsTrigger value="Mobile Development">Mobile Dev</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link to={`/blog/${post.id}`} key={post.id}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{post.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {post.readTime}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={post.authorAvatar}
                            alt={post.author}
                          />
                          <AvatarFallback>
                            {post.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{post.author}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {post.date}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">
                  No articles found
                </h2>
                <p className="text-muted-foreground">
                  Try a different search term or category
                </p>
              </div>
            )}
          </TabsContent>

          {categories.slice(1).map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockBlogPosts
                  .filter((post) => post.category === category)
                  .filter(
                    (post) =>
                      post.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      post.excerpt
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .map((post) => (
                    <Link to={`/blog/${post.id}`} key={post.id}>
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="w-full h-48 overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{post.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {post.readTime}
                            </span>
                          </div>
                          <CardTitle className="line-clamp-2">
                            {post.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground line-clamp-3">
                            {post.excerpt}
                          </p>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between border-t pt-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={post.authorAvatar}
                                alt={post.author}
                              />
                              <AvatarFallback>
                                {post.author.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{post.author}</span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {post.date}
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-center mt-10">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default BlogPage;
