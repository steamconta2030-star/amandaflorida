import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Nav } from "@/components/tidly/Nav";
import { getPost, POSTS, type BlogPost } from "@/lib/blog";

const SITE_URL = "https://amandaflorida.com";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Post not found — Amanda Florida" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const p = loaderData.post;
    const url = `${SITE_URL}/blog/${p.slug}`;
    return {
      meta: [
        { title: `${p.title} — Amanda Florida` },
        { name: "description", content: p.description },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.description },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: p.date },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: p.title,
            description: p.description,
            datePublished: p.date,
            dateModified: p.date,
            mainEntityOfPage: url,
            author: { "@type": "Organization", name: "Amanda Florida" },
            publisher: {
              "@type": "Organization",
              name: "Amanda Florida",
              url: SITE_URL,
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
              { "@type": "ListItem", position: 3, name: p.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: BlogPostPage,
  notFoundComponent: PostNotFound,
  errorComponent: PostError,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <article className="mx-auto max-w-2xl px-5 py-14 md:px-8 md:py-20">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link to="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">{post.tag}</span>
        </nav>

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5">{post.tag}</span>
          <span>·</span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{post.readMinutes} min read</span>
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">{post.description}</p>

        <div className="mt-10 space-y-5 text-[15px] leading-relaxed md:text-base">
          {post.blocks.map((b: BlogPost["blocks"][number], i: number) => renderBlock(b, i))}
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Ready when you are
          </p>
          <p className="mt-2 text-lg font-medium">
            Get a real cleaning quote by chat in about 60 seconds.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/chat"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85"
            >
              Start a chat
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              See services
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
              Keep reading
            </h2>
            <ul className="mt-4 space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: r.slug }}
                    className="block rounded-xl border border-border bg-card p-4 hover:border-foreground/30"
                  >
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
}

function renderBlock(b: BlogPost["blocks"][number], i: number) {
  if (b.type === "p") {
    return (
      <p key={i} className="text-muted-foreground">
        {b.text}
      </p>
    );
  }
  if (b.type === "h2") {
    return (
      <h2 key={i} className="pt-4 text-xl font-semibold tracking-tight text-foreground">
        {b.text}
      </h2>
    );
  }
  if (b.type === "ul") {
    return (
      <ul key={i} className="list-disc space-y-1.5 pl-5 text-muted-foreground">
        {b.items.map((it, j) => (
          <li key={j}>{it}</li>
        ))}
      </ul>
    );
  }
  return (
    <blockquote key={i} className="border-l-2 border-foreground/30 pl-4 italic text-foreground">
      {b.text}
    </blockquote>
  );
}

function PostNotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-2xl px-5 py-20 md:px-8 md:py-28">
        <h1 className="text-3xl font-semibold tracking-tight">Post not found</h1>
        <p className="mt-3 text-muted-foreground">
          That article doesn't exist (yet). Check the blog index for what's live.
        </p>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85"
        >
          Back to blog
        </Link>
      </section>
    </div>
  );
}

function PostError() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-2xl px-5 py-20 md:px-8 md:py-28">
        <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">
          The article couldn't load. Try again in a moment.
        </p>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85"
        >
          Back to blog
        </Link>
      </section>
    </div>
  );
}
