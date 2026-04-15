import Header from '@/components/Header';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Tips & Guides for Email Privacy | Mailly',
  description: 'Learn about email privacy, temporary email best practices, and how to protect your online identity with Mailly blog.',
  openGraph: {
    title: 'Blog - Mailly',
    description: 'Tips and guides for protecting your email privacy.',
  },
};

const blogPosts = [
  {
    id: 1,
    title: 'Why You Need a Temporary Email Address',
    excerpt: 'Discover the benefits of using disposable email addresses to protect your privacy and reduce spam.',
    date: 'April 10, 2026',
    slug: 'why-temporary-email',
    category: 'Privacy',
  },
  {
    id: 2,
    title: '5 Ways to Protect Your Online Privacy',
    excerpt: 'Essential tips for maintaining your privacy online, including the use of temporary email services.',
    date: 'April 5, 2026',
    slug: 'protect-online-privacy',
    category: 'Security',
  },
  {
    id: 3,
    title: 'How Temporary Email Services Work',
    excerpt: 'A technical deep-dive into how disposable email services like Mailly operate behind the scenes.',
    date: 'March 28, 2026',
    slug: 'how-temp-email-works',
    category: 'Technology',
  },
];

export default function Blog() {
  return (
    <main className="min-h-screen bg-midnight relative pt-[72px]">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute -top-48 left-1/4 w-[500px] h-[500px] bg-[#36ffc4]/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-[#2ee0ad]/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-[#36ffc4] via-[#2ee0ad] to-[#36ffc4] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Blog & Resources
            </span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
            Tips, guides, and insights on email privacy and security
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <article 
              key={post.id}
              className="glass rounded-lg p-6 border border-[#36ffc4]/10 hover:border-[#36ffc4]/30 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4">
                <span className="text-xs font-medium text-[#36ffc4] bg-[#36ffc4]/10 px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
              <h2 className="font-display text-xl text-on-surface mb-3 hover:text-[#36ffc4] transition-colors">
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <time dateTime={post.date}>{post.date}</time>
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-[#36ffc4] hover:text-[#2ee0ad] transition-colors font-medium"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-on-surface-variant">
            More articles coming soon. Stay tuned!
          </p>
        </div>

        <div className="mt-8 animate-fade-in">
          <Link 
            href="/" 
            className="text-[#36ffc4] hover:text-[#2ee0ad] inline-flex items-center gap-2 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
