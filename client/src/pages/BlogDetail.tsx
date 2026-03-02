import { useParams, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { Layout } from "@/components/Layout";
import { useBlogPost } from "@/hooks/use-blog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useBlogAnalytics } from "@/hooks/use-blog-analytics";

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || "");
  useBlogAnalytics({ blogSlug: slug || null });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 py-20 max-w-3xl">
          <Skeleton className="h-4 w-32 mb-6" />
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-6 w-3/4 mb-16" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 py-32 text-center max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Artículo no encontrado</h1>
          <Link href="/blog" className="text-primary hover:underline">
            Volver al blog
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container mx-auto px-4 md:px-8 py-20 md:py-32 max-w-3xl">
        <Link href="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-12 transition-colors">
          <ArrowLeft className="mr-2 w-4 h-4" /> Todos los artículos
        </Link>

        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <time className="text-sm font-medium text-primary mb-4 block tracking-wide">
            {format(new Date(post.publishedAt), 'MMMM d, yyyy')} · {post.readTime}
          </time>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 leading-tight">
            {post.title}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        </motion.header>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:tracking-tight prose-a:text-primary prose-p:leading-relaxed"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </motion.div>
      </article>
    </Layout>
  );
}
