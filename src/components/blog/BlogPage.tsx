import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost, SAMPLE_BLOG_POSTS } from './BlogData';

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>(SAMPLE_BLOG_POSTS);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(SAMPLE_BLOG_POSTS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Get all unique categories
  const categories = ['All', ...Array.from(new Set(posts.map(post => post.category)))];

  // Filter posts based on category and search term
  useEffect(() => {
    let result = posts;

    // Filter by category
    if (activeCategory !== 'All') {
      result = result.filter(post => post.category === activeCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredPosts(result);
  }, [activeCategory, searchTerm, posts]);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Window Treatment Blog</h1>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 pl-10 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-primary-red focus:border-primary-red"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <div className="mb-12">
          <Link to={`/blog/${filteredPosts[0].id}`} className="group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-64 md:h-auto overflow-hidden">
                <img
                  src={filteredPosts[0].image}
                  alt={filteredPosts[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <div className="flex items-center mb-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-primary-red text-white rounded-full">
                    {filteredPosts[0].category}
                  </span>
                  <span className="text-gray-500 text-sm ml-3">
                    {formatDate(filteredPosts[0].published)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-primary-red transition-colors">
                  {filteredPosts[0].title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {filteredPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm text-gray-500">
                    By {filteredPosts[0].author}
                  </span>
                  <span className="text-sm text-gray-500">
                    {filteredPosts[0].readTime} min read
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Categories */}
      <div className="mb-8 border-b border-gray-200 pb-4 overflow-x-auto">
        <div className="flex space-x-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-primary-red text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Posts Grid */}
      {filteredPosts.length > 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPosts.slice(1).map(post => (
            <Link to={`/blog/${post.id}`} key={post.id} className="group">
              <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-primary-red text-white rounded-full">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">
                      {formatDate(post.published)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary-red transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                    <span>By {post.author}</span>
                    <span>{post.readTime} min read</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600 mb-2">No posts found</h3>
          <p className="text-gray-500">Try adjusting your search or category filter</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('All');
            }}
            className="mt-4 px-4 py-2 bg-primary-red text-white rounded-md hover:bg-red-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default BlogPage;
