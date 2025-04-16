import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// Sample blog post data - in a real app, this would come from an API
const SAMPLE_BLOG_POSTS = [
  {
    id: 'window-treatment-trends-2025',
    title: 'Top 10 Window Treatment Trends for 2025',
    slug: 'window-treatment-trends-2025',
    excerpt: 'Discover the latest window treatment trends for 2025, from smart motorized blinds to eco-friendly materials and bold color patterns.',
    category: 'Trends',
    author: 'Sarah Johnson',
    date: '2025-04-01',
    readTime: '7 min read',
    image: 'https://ext.same-assets.com/1286651754/1926672846.jpeg',
    tags: ['Trends', 'Interior Design', 'Smart Home']
  },
  {
    id: 'energy-efficient-window-treatments',
    title: 'How to Choose Energy-Efficient Window Treatments',
    slug: 'energy-efficient-window-treatments',
    excerpt: 'Learn how to select window treatments that can significantly reduce your energy costs while maintaining your home\'s style and comfort.',
    category: 'Guides',
    author: 'Michael Chen',
    date: '2025-03-15',
    readTime: '5 min read',
    image: 'https://ext.same-assets.com/1286651754/2839484726.jpeg',
    tags: ['Energy Efficiency', 'Savings', 'Eco-Friendly']
  },
  {
    id: 'measuring-windows-like-pro',
    title: 'How to Measure Your Windows Like a Professional',
    slug: 'measuring-windows-like-pro',
    excerpt: 'A comprehensive guide to accurately measuring your windows for blinds, shades, and other window treatments to ensure a perfect fit.',
    category: 'DIY',
    author: 'Thomas Wright',
    date: '2025-02-28',
    readTime: '6 min read',
    image: 'https://ext.same-assets.com/1286651754/3981276398.jpeg',
    tags: ['How-to', 'DIY', 'Measurement']
  },
  {
    id: 'cellular-shades-buying-guide',
    title: 'The Ultimate Cellular Shades Buying Guide',
    slug: 'cellular-shades-buying-guide',
    excerpt: 'Everything you need to know about cellular shades, from light filtering options to insulation properties and installation tips.',
    category: 'Buying Guides',
    author: 'Emily Rodriguez',
    date: '2025-01-20',
    readTime: '8 min read',
    image: 'https://ext.same-assets.com/1286651754/2849361857.jpeg',
    tags: ['Cellular Shades', 'Buying Guide', 'Product Guide']
  },
  {
    id: 'cleaning-maintaining-blinds',
    title: 'Cleaning and Maintaining Your Blinds and Shades',
    slug: 'cleaning-maintaining-blinds',
    excerpt: 'Learn the best techniques for cleaning different types of window treatments and how to maintain them for long-lasting performance.',
    category: 'Maintenance',
    author: 'Lisa Patel',
    date: '2025-01-05',
    readTime: '5 min read',
    image: 'https://ext.same-assets.com/1286651754/3817264954.jpeg',
    tags: ['Cleaning', 'Maintenance', 'Tips']
  },
  {
    id: 'smart-blinds-home-automation',
    title: 'Integrating Smart Blinds into Your Home Automation System',
    slug: 'smart-blinds-home-automation',
    excerpt: 'A step-by-step guide to setting up and integrating motorized blinds with popular smart home systems like Google Home, Alexa, and HomeKit.',
    category: 'Smart Home',
    author: 'James Wilson',
    date: '2024-12-12',
    readTime: '9 min read',
    image: 'https://ext.same-assets.com/1286651754/1928374658.jpeg',
    tags: ['Smart Home', 'Motorized Blinds', 'Automation']
  }
];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
}

const BlogLandingPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    // Simulate API fetch - in a real app, this would fetch from an actual API endpoint
    const fetchPosts = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setPosts(SAMPLE_BLOG_POSTS);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Extract all unique categories and tags for filters
  const allCategories = Array.from(new Set(posts.map(post => post.category)));
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  // Filter posts based on selected category and tags
  const filteredPosts = posts.filter(post => {
    // Category filter
    if (selectedCategory && post.category !== selectedCategory) {
      return false;
    }

    // Tags filter
    if (selectedTags.length > 0 && !selectedTags.some(tag => post.tags.includes(tag))) {
      return false;
    }

    return true;
  });

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prevTags =>
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // SEO-friendly blog post schema for JSON-LD
  const blogPostSchemaData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "headline": "SmartBlinds Blog: Window Treatment Tips, Guides & Trends",
    "description": "Expert advice on window treatments, home design, energy efficiency, and more from the SmartBlinds experts.",
    "publisher": {
      "@type": "Organization",
      "name": "SmartBlinds",
      "logo": {
        "@type": "ImageObject",
        "url": "https://smartblinds.com/logo.svg"
      }
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "datePublished": post.date,
      "description": post.excerpt,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "image": post.image,
      "url": `https://smartblinds.com/blog/${post.slug}`
    }))
  };

  return (
    <>
      {/* SEO head content */}
      <Helmet>
        <title>SmartBlinds Blog: Window Treatment Tips, Guides & Design Inspiration</title>
        <meta name="description" content="Discover expert tips, guides, and design inspiration for window treatments. Learn about energy efficiency, smart home integration, and the latest trends." />
        <meta name="keywords" content="window treatments, blinds blog, shades, home decor, energy efficiency, smart blinds, window design, interior design" />
        <link rel="canonical" href="https://smartblinds.com/blog" />
        <script type="application/ld+json">
          {JSON.stringify(blogPostSchemaData)}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-screen-xl mx-auto">
          {/* Blog Header */}
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">SmartBlinds Blog</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Expert advice, design inspiration, and how-to guides for all your window treatment needs.
            </p>
          </header>

          {/* Category Navigation */}
          <div className="mb-8">
            <h2 className="sr-only">Blog Categories</h2>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === null
                    ? 'bg-primary-red text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory(null)}
                aria-pressed={selectedCategory === null}
              >
                All
              </button>
              {allCategories.map(category => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedCategory === category
                      ? 'bg-primary-red text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => handleCategoryClick(category)}
                  aria-pressed={selectedCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content - Blog Posts */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length > 0 ? (
                <div>
                  {/* Featured Post */}
                  <article className="mb-12" itemScope itemType="https://schema.org/BlogPosting">
                    <Link to={`/blog/${filteredPosts[0].slug}`} className="block">
                      <div className="rounded-lg overflow-hidden mb-4">
                        <img
                          src={filteredPosts[0].image}
                          alt={filteredPosts[0].title}
                          className="w-full h-[400px] object-cover transition-transform hover:scale-105"
                          itemProp="image"
                        />
                      </div>
                      <div className="mb-2">
                        <span
                          className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-red bg-red-50"
                          itemProp="articleSection"
                        >
                          {filteredPosts[0].category}
                        </span>
                        <span className="text-gray-500 text-sm ml-2" itemProp="datePublished">
                          {formatDate(filteredPosts[0].date)}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">· {filteredPosts[0].readTime}</span>
                      </div>
                      <h2
                        className="text-2xl md:text-3xl font-bold text-gray-800 hover:text-primary-red transition-colors mb-2"
                        itemProp="headline"
                      >
                        {filteredPosts[0].title}
                      </h2>
                      <p className="text-gray-600 mb-4" itemProp="description">{filteredPosts[0].excerpt}</p>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                          <span className="text-sm font-semibold">{filteredPosts[0].author.charAt(0)}</span>
                        </div>
                        <span className="text-sm text-gray-700" itemProp="author">{filteredPosts[0].author}</span>
                      </div>
                    </Link>
                  </article>

                  {/* Rest of the Posts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredPosts.slice(1).map(post => (
                      <article
                        key={post.id}
                        className="border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        itemScope
                        itemType="https://schema.org/BlogPosting"
                      >
                        <Link to={`/blog/${post.slug}`} className="block">
                          <div className="h-48 overflow-hidden">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform hover:scale-105"
                              itemProp="image"
                            />
                          </div>
                          <div className="p-5">
                            <div className="mb-2">
                              <span
                                className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-red bg-red-50"
                                itemProp="articleSection"
                              >
                                {post.category}
                              </span>
                              <span className="text-gray-500 text-xs ml-2" itemProp="datePublished">
                                {formatDate(post.date)}
                              </span>
                            </div>
                            <h3
                              className="text-xl font-bold text-gray-800 hover:text-primary-red transition-colors mb-2"
                              itemProp="headline"
                            >
                              {post.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4" itemProp="description">{post.excerpt}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700" itemProp="author">{post.author}</span>
                              <span className="text-xs text-gray-500">{post.readTime}</span>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">No posts found</h2>
                  <p className="text-gray-600">Try adjusting your filters or check back later for new content.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedTags([]);
                    }}
                    className="mt-4 bg-primary-red text-white py-2 px-4 rounded hover:bg-red-700 transition"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {/* Popular Tags */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Popular Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedTags.includes(tag)
                          ? 'bg-primary-red text-white'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => handleTagClick(tag)}
                      aria-pressed={selectedTags.includes(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-primary-red text-white rounded-lg p-6">
                <h2 className="text-lg font-bold mb-3">Get Window Treatment Tips</h2>
                <p className="text-sm mb-4">Subscribe to our newsletter for the latest tips, trends, and exclusive offers.</p>
                <form className="space-y-3">
                  <div>
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Your email address"
                      className="w-full px-4 py-2 rounded-md border-0 text-gray-800 focus:ring-2 focus:ring-white focus:outline-none text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white text-primary-red font-medium py-2 px-4 rounded hover:bg-gray-100 transition text-sm"
                  >
                    Subscribe
                  </button>
                </form>
                <p className="text-xs mt-3">We respect your privacy. Unsubscribe at any time.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogLandingPage;
