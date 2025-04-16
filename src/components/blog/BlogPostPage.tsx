import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { SAMPLE_BLOG_POSTS } from './BlogData';

// Related post component
const RelatedPost: React.FC<{ id: string; title: string; image: string; category: string }> = ({ id, title, image, category }) => {
  return (
    <Link to={`/blog/${id}`} className="group">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div>
          <span className="text-xs font-semibold text-primary-red">{category}</span>
          <h3 className="text-sm font-medium group-hover:text-primary-red transition-colors line-clamp-2">{title}</h3>
        </div>
      </div>
    </Link>
  );
};

const BlogPostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState(SAMPLE_BLOG_POSTS.find(p => p.id === postId));
  const [relatedPosts, setRelatedPosts] = useState(SAMPLE_BLOG_POSTS.filter(p => p.id !== postId).slice(0, 3));

  useEffect(() => {
    // If post ID changes, update the post and related posts
    const currentPost = SAMPLE_BLOG_POSTS.find(p => p.id === postId);

    if (currentPost) {
      setPost(currentPost);

      // Find related posts based on category and tags
      const related = SAMPLE_BLOG_POSTS
        .filter(p => p.id !== postId)
        .sort((a, b) => {
          // Calculate relevance score (matching category or tags)
          const aRelevance =
            (a.category === currentPost.category ? 2 : 0) +
            a.tags.filter(tag => currentPost.tags.includes(tag)).length;

          const bRelevance =
            (b.category === currentPost.category ? 2 : 0) +
            b.tags.filter(tag => currentPost.tags.includes(tag)).length;

          return bRelevance - aRelevance; // Higher score first
        })
        .slice(0, 3); // Get top 3 related posts

      setRelatedPosts(related);
    } else {
      // If post not found, redirect to blog home
      navigate('/blog');
    }
  }, [postId, navigate]);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Post not found</h2>
          <Link
            to="/blog"
            className="text-primary-red hover:underline"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/" className="hover:text-primary-red hover:underline">Home</Link>
          <span className="mx-2">›</span>
          <Link to="/blog" className="hover:text-primary-red hover:underline">Blog</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700">{post.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Post header */}
          <div className="mb-8">
            <div className="flex items-center mb-3">
              <span className="text-xs font-semibold px-2 py-1 bg-primary-red text-white rounded-full mr-3">
                {post.category}
              </span>
              <span className="text-gray-500 text-sm">
                {formatDate(post.published)}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>By {post.author}</div>
              <div>{post.readTime} min read</div>
            </div>
          </div>

          {/* Featured image */}
          <div className="mb-8">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto rounded-lg"
            />
          </div>

          {/* Post content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Link
                  key={tag}
                  to={`/blog?tag=${tag}`}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Author bio */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold mr-4">
                {post.author.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold">{post.author}</h3>
                <p className="text-sm text-gray-600">Window Treatment Expert</p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              {post.author} is a window treatment specialist with over 10 years of experience in the industry.
              They specialize in {post.category.toLowerCase()} and are passionate about helping homeowners find
              the perfect window coverings for their needs.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Sticky sidebar */}
          <div className="sticky top-8">
            {/* Share buttons */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Share This Article</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#3b5998] flex items-center justify-center text-white"
                  aria-label="Share on Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#1da1f2] flex items-center justify-center text-white"
                  aria-label="Share on Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#0077b5] flex items-center justify-center text-white"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.7 3H4.3A1.3 1.3 0 003 4.3v15.4A1.3 1.3 0 004.3 21h15.4a1.3 1.3 0 001.3-1.3V4.3A1.3 1.3 0 0019.7 3zM8.339 18.338H5.667v-8.59h2.672v8.59zM7.004 8.574a1.548 1.548 0 11-.002-3.096 1.548 1.548 0 01.002 3.096zm11.335 9.764H15.67v-4.177c0-.996-.017-2.278-1.387-2.278-1.389 0-1.601 1.086-1.601 2.206v4.249h-2.667v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.779 3.203 4.092v4.711z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[#e60023] flex items-center justify-center text-white"
                  aria-label="Share on Pinterest"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Related posts */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Related Articles</h3>
              <div className="space-y-4">
                {relatedPosts.map(related => (
                  <RelatedPost
                    key={related.id}
                    id={related.id}
                    title={related.title}
                    image={related.image}
                    category={related.category}
                  />
                ))}
              </div>
            </div>

            {/* Call to action */}
            <div className="p-6 bg-primary-red text-white rounded-lg">
              <h3 className="text-lg font-medium mb-2">Need Help With Your Windows?</h3>
              <p className="text-sm mb-4">
                Our experts are ready to help you find the perfect window treatments for your home.
              </p>
              <Link
                to="/create-estimate"
                className="block w-full bg-white text-primary-red text-center py-2 px-4 rounded font-medium hover:bg-gray-100 transition"
              >
                Get a Free Estimate
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
