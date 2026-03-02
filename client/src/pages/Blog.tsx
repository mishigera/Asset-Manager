import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { useBlogPosts } from "@/hooks/use-blog";
import { useI18n } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Blog() {
  const { t } = useI18n();
  const { data: posts, isLoading } = useBlogPosts();

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-20 md:py-32 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{t("blog.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("blog.subtitle")}</p>
        </motion.div>

        <div className="space-y-12">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 pb-12 border-b border-border">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          ) : (
            posts?.map((post, i) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative pb-12 border-b border-border/50 last:border-0"
              >
                <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10">
                  <span className="sr-only">Read {post.title}</span>
                </Link>
                <time className="text-sm font-medium text-muted-foreground mb-3 block">
                  {format(new Date(post.publishedAt), 'MMMM d, yyyy')} · {post.readTime}
                </time>
                <h2 className="text-2xl font-bold tracking-tight mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </motion.article>
            ))
          )}
          
          {posts?.length === 0 && (
             <div className="py-12 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-border/50">
               Próximamente nuevos artículos.
             </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
