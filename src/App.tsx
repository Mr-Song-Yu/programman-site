import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  BracketsCurly,
  Check,
  Code,
  Compass,
  FloppyDisk,
  GithubLogo,
  GlobeHemisphereEast,
  PencilSimple,
  Plus,
  RocketLaunch,
  Trash,
} from "@phosphor-icons/react";
import { site } from "./config/site";
import { useContent } from "./hooks/useContent";
import { readContentFile, writeContentFile } from "./lib/github";
import { MarkdownView } from "./lib/markdown";
import { slugify, uid } from "./lib/slug";
import type { BlogPost, GitHubConfig, Product, SaveTarget } from "./types";

type Route = {
  name: "home" | "blog" | "post" | "products" | "admin" | "not-found";
  slug?: string;
};

const emptyPost = (): BlogPost => ({
  id: uid("post"),
  slug: "",
  title: "",
  excerpt: "",
  content: "## 新文章\n\n从这里开始写。",
  author: "Programman",
  date: new Date().toISOString().slice(0, 10),
  tags: [],
  published: false,
  cover: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80",
  readingMinutes: 3,
});

const emptyProduct = (): Product => ({
  id: uid("product"),
  slug: "",
  name: "",
  subtitle: "",
  description: "",
  status: "idea",
  year: new Date().getFullYear().toString(),
  tags: [],
  links: {
    demo: "",
    repo: "",
  },
  image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  featured: false,
  published: false,
  highlights: [],
});

function parseRoute(pathname: string): Route {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const parts = clean.split("/").filter(Boolean);

  if (clean === "/") return { name: "home" };
  if (clean === "/blog") return { name: "blog" };
  if (parts[0] === "blog" && parts[1]) return { name: "post", slug: parts[1] };
  if (clean === "/products") return { name: "products" };
  if (clean === "/admin") return { name: "admin" };
  return { name: "not-found" };
}

function useRouter() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((href: string) => {
    if (href === window.location.pathname) return;
    window.history.pushState({}, "", href);
    setPath(href);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { route: parseRoute(path), navigate, path };
}

function Link({
  href,
  navigate,
  children,
  className,
}: {
  href: string;
  navigate: (href: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={href}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

function Shell({
  children,
  navigate,
  path,
}: {
  children: React.ReactNode;
  navigate: (href: string) => void;
  path: string;
}) {
  const nav = [
    { href: "/blog", label: "Blog" },
    { href: "/products", label: "Products" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <>
      <header className="site-header">
        <Link href="/" navigate={navigate} className="brand">
          <span className="brand-mark">
            <BracketsCurly weight="bold" />
          </span>
          <span>{site.name}</span>
        </Link>
        <nav className="site-nav" aria-label="主导航">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              navigate={navigate}
              className={path === item.href ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <span>{site.name}</span>
        <span>{site.domain}</span>
        <span>Static blog and product studio</span>
      </footer>
    </>
  );
}

function LoadingBlock() {
  return (
    <section className="page-section">
      <div className="loading-grid" aria-label="内容加载中">
        <div />
        <div />
        <div />
      </div>
    </section>
  );
}

function ErrorBlock({ error }: { error: string }) {
  return (
    <section className="page-section compact-section">
      <div className="notice error">
        <strong>内容加载失败</strong>
        <span>{error}</span>
      </div>
    </section>
  );
}

function HomePage({
  posts,
  products,
  navigate,
}: {
  posts: BlogPost[];
  products: Product[];
  navigate: (href: string) => void;
}) {
  const latest = posts.slice(0, 3);
  const featured = products.filter((product) => product.featured).slice(0, 2);

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Vibe-coding field notes</p>
          <h1>把想法写成文章，也把文章推进成产品。</h1>
          <p>
            Programman 用来记录 AI 辅助开发、前端实验、部署流程和正在成形的小产品。
          </p>
          <div className="hero-actions">
            <Link href="/blog" navigate={navigate} className="button primary">
              阅读博客 <ArrowRight weight="bold" />
            </Link>
            <Link href="/products" navigate={navigate} className="button secondary">
              看产品 <Compass weight="bold" />
            </Link>
          </div>
        </div>
        <div className="hero-media" aria-label="站点内容预览">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
            alt="工作台、笔记本电脑和打开的开发资料"
          />
          <div className="hero-panel">
            <span>Current loop</span>
            <strong>think / build / write / ship</strong>
          </div>
        </div>
      </section>

      <section className="ticker-band" aria-label="站点数据">
        <div>
          <strong>{posts.length}</strong>
          <span>published notes</span>
        </div>
        <div>
          <strong>{products.length}</strong>
          <span>coding products</span>
        </div>
        <div>
          <strong>0</strong>
          <span>server required</span>
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading stacked">
          <p className="eyebrow">Latest writing</p>
          <h2>最近的开发笔记</h2>
        </div>
        <div className="post-index">
          {latest.map((post) => (
            <ArticleCard key={post.id} post={post} navigate={navigate} />
          ))}
        </div>
      </section>

      <section className="page-section product-band">
        <div className="section-heading stacked">
          <p className="eyebrow">Product shelf</p>
          <h2>正在打磨的 vibe-coding 产品</h2>
        </div>
        <div className="featured-products">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}

function ArticleCard({
  post,
  navigate,
}: {
  post: BlogPost;
  navigate: (href: string) => void;
}) {
  return (
    <article className="article-card">
      <Link href={`/blog/${post.slug}`} navigate={navigate} className="article-image">
        <img src={post.cover} alt={post.title} />
      </Link>
      <div className="article-body">
        <div className="meta-row">
          <time dateTime={post.date}>{post.date}</time>
          <span>{post.readingMinutes} min</span>
        </div>
        <h3>
          <Link href={`/blog/${post.slug}`} navigate={navigate}>
            {post.title}
          </Link>
        </h3>
        <p>{post.excerpt}</p>
        <div className="tag-row">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-content">
        <div className="meta-row">
          <span>{product.year}</span>
          <span>{product.status}</span>
        </div>
        <h3>{product.name}</h3>
        <p className="product-subtitle">{product.subtitle}</p>
        <p>{product.description}</p>
        <ul>
          {product.highlights.map((highlight) => (
            <li key={highlight}>
              <Check weight="bold" /> {highlight}
            </li>
          ))}
        </ul>
        <div className="product-links">
          {product.links.demo ? (
            <a href={product.links.demo} target="_blank" rel="noreferrer">
              Demo <GlobeHemisphereEast />
            </a>
          ) : null}
          {product.links.repo ? (
            <a href={product.links.repo} target="_blank" rel="noreferrer">
              Repo <GithubLogo />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function BlogPage({
  posts,
  navigate,
}: {
  posts: BlogPost[];
  navigate: (href: string) => void;
}) {
  return (
    <section className="page-section first-section">
      <div className="section-heading stacked">
        <p className="eyebrow">Blog</p>
        <h1>开发笔记和发布复盘</h1>
        <p>记录从模糊需求到上线页面的过程，也保留那些值得下次复用的判断。</p>
      </div>
      <div className="post-index roomy">
        {posts.map((post) => (
          <ArticleCard key={post.id} post={post} navigate={navigate} />
        ))}
      </div>
    </section>
  );
}

function PostPage({
  post,
  navigate,
}: {
  post?: BlogPost;
  navigate: (href: string) => void;
}) {
  if (!post) {
    return <NotFound navigate={navigate} />;
  }

  return (
    <article className="article-page">
      <div className="article-hero">
        <div>
          <Link href="/blog" navigate={navigate} className="back-link">
            <ArrowRight /> 返回博客
          </Link>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="meta-row">
            <time dateTime={post.date}>{post.date}</time>
            <span>{post.author}</span>
            <span>{post.readingMinutes} min</span>
          </div>
        </div>
        <img src={post.cover} alt={post.title} />
      </div>
      <MarkdownView markdown={post.content} />
    </article>
  );
}

function ProductsPage({ products }: { products: Product[] }) {
  return (
    <section className="page-section first-section">
      <div className="section-heading stacked">
        <p className="eyebrow">Products</p>
        <h1>vibe-coding 产品展示</h1>
        <p>这里放还在构建、已经上线或值得公开记录的小工具。</p>
      </div>
      <div className="product-list">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function NotFound({ navigate }: { navigate: (href: string) => void }) {
  return (
    <section className="page-section compact-section">
      <div className="empty-state">
        <BookOpenText size={36} />
        <h1>没有找到这个页面</h1>
        <p>可能是内容还没发布，也可能是路径写错了。</p>
        <Link href="/" navigate={navigate} className="button primary">
          回到首页 <ArrowRight weight="bold" />
        </Link>
      </div>
    </section>
  );
}

function AdminPage({
  initialPosts,
  initialProducts,
}: {
  initialPosts: BlogPost[];
  initialProducts: Product[];
}) {
  const [active, setActive] = useState<SaveTarget>("posts");
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedId, setSelectedId] = useState(initialPosts[0]?.id ?? "");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<GitHubConfig>(() => {
    const saved = localStorage.getItem("programman-github-config");
    if (saved) {
      try {
        return JSON.parse(saved) as GitHubConfig;
      } catch {
        return { owner: "", repo: "", branch: site.defaultBranch, token: "" };
      }
    }
    return { owner: "", repo: "", branch: site.defaultBranch, token: "" };
  });

  useEffect(() => {
    setPosts(initialPosts);
    setProducts(initialProducts);
  }, [initialPosts, initialProducts]);

  useEffect(() => {
    localStorage.setItem("programman-github-config", JSON.stringify(config));
  }, [config]);

  const selectedPost = posts.find((post) => post.id === selectedId) ?? posts[0];
  const selectedProduct =
    products.find((product) => product.id === selectedId) ?? products[0];

  const items = active === "posts" ? posts : products;

  useEffect(() => {
    if (!items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0]?.id ?? "");
    }
  }, [active, items, selectedId]);

  const requireConfig = () => {
    if (!config.owner || !config.repo || !config.branch || !config.token) {
      throw new Error("请先填写 owner、repo、branch 和 token。");
    }
  };

  const loadFromGitHub = async () => {
    try {
      requireConfig();
      setStatus("正在从 GitHub 读取内容...");
      const [remotePosts, remoteProducts] = await Promise.all([
        readContentFile<BlogPost[]>("posts", config),
        readContentFile<Product[]>("products", config),
      ]);
      setPosts(remotePosts);
      setProducts(remoteProducts);
      setStatus("已读取仓库里的最新内容。");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "读取失败。");
    }
  };

  const saveToGitHub = async () => {
    try {
      requireConfig();
      setIsSaving(true);
      setStatus("正在提交到 GitHub...");
      await writeContentFile(active, active === "posts" ? posts : products, config);
      setStatus("已提交，GitHub Pages 会自动重新部署。");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "提交失败。");
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = () => {
    if (active === "posts") {
      const next = emptyPost();
      setPosts((current) => [next, ...current]);
      setSelectedId(next.id);
    } else {
      const next = emptyProduct();
      setProducts((current) => [next, ...current]);
      setSelectedId(next.id);
    }
  };

  const removeItem = () => {
    if (!selectedId) return;
    const ok = window.confirm("确定删除当前内容吗？删除后还需要提交到 GitHub 才会生效。");
    if (!ok) return;
    if (active === "posts") {
      setPosts((current) => current.filter((post) => post.id !== selectedId));
    } else {
      setProducts((current) => current.filter((product) => product.id !== selectedId));
    }
  };

  const updatePost = (patch: Partial<BlogPost>) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === selectedPost?.id
          ? {
              ...post,
              ...patch,
              slug: patch.title && !post.slug ? slugify(patch.title) : patch.slug ?? post.slug,
            }
          : post,
      ),
    );
  };

  const updateProduct = (patch: Partial<Product>) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === selectedProduct?.id
          ? {
              ...product,
              ...patch,
              slug:
                patch.name && !product.slug
                  ? slugify(patch.name)
                  : patch.slug ?? product.slug,
            }
          : product,
      ),
    );
  };

  return (
    <section className="admin-shell">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>内容管理</h1>
          <p>用 GitHub token 直接更新仓库内容。token 只保存在当前浏览器。</p>
        </div>
        <div className="admin-actions">
          <button className="button secondary" onClick={loadFromGitHub}>
            <GithubLogo weight="bold" /> 从 GitHub 读取
          </button>
          <button className="button primary" onClick={saveToGitHub} disabled={isSaving}>
            <FloppyDisk weight="bold" /> {isSaving ? "提交中" : "提交发布"}
          </button>
        </div>
      </div>

      <div className="admin-config">
        <label>
          Owner
          <input
            value={config.owner}
            placeholder="你的 GitHub 用户名"
            onChange={(event) => setConfig({ ...config, owner: event.target.value.trim() })}
          />
        </label>
        <label>
          Repo
          <input
            value={config.repo}
            placeholder="仓库名"
            onChange={(event) => setConfig({ ...config, repo: event.target.value.trim() })}
          />
        </label>
        <label>
          Branch
          <input
            value={config.branch}
            onChange={(event) => setConfig({ ...config, branch: event.target.value.trim() })}
          />
        </label>
        <label>
          Token
          <input
            value={config.token}
            type="password"
            placeholder="fine-grained token"
            onChange={(event) => setConfig({ ...config, token: event.target.value })}
          />
        </label>
      </div>

      {status ? <div className="notice">{status}</div> : null}

      <div className="admin-tabs" role="tablist" aria-label="内容类型">
        <button className={active === "posts" ? "active" : ""} onClick={() => setActive("posts")}>
          <BookOpenText /> 博客
        </button>
        <button
          className={active === "products" ? "active" : ""}
          onClick={() => setActive("products")}
        >
          <RocketLaunch /> 产品
        </button>
      </div>

      <div className="admin-workspace">
        <aside className="admin-list">
          <button className="list-create" onClick={addItem}>
            <Plus weight="bold" /> 新建
          </button>
          {items.map((item) => (
            <button
              key={item.id}
              className={selectedId === item.id ? "active" : ""}
              onClick={() => setSelectedId(item.id)}
            >
              <span>{active === "posts" ? (item as BlogPost).title : (item as Product).name}</span>
              <small>{item.published ? "published" : "draft"}</small>
            </button>
          ))}
        </aside>

        <section className="admin-editor">
          <div className="editor-toolbar">
            <button className="button secondary" onClick={removeItem}>
              <Trash weight="bold" /> 删除
            </button>
          </div>
          {active === "posts" && selectedPost ? (
            <PostEditor post={selectedPost} updatePost={updatePost} />
          ) : null}
          {active === "products" && selectedProduct ? (
            <ProductEditor product={selectedProduct} updateProduct={updateProduct} />
          ) : null}
          {!selectedPost && active === "posts" ? <EmptyEditor /> : null}
          {!selectedProduct && active === "products" ? <EmptyEditor /> : null}
        </section>
      </div>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label>
      {label}
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label>
      {label}
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function PostEditor({
  post,
  updatePost,
}: {
  post: BlogPost;
  updatePost: (patch: Partial<BlogPost>) => void;
}) {
  return (
    <div className="form-grid">
      <TextInput label="标题" value={post.title} onChange={(value) => updatePost({ title: value })} />
      <TextInput label="Slug" value={post.slug} onChange={(value) => updatePost({ slug: slugify(value) })} />
      <TextArea label="摘要" value={post.excerpt} rows={3} onChange={(value) => updatePost({ excerpt: value })} />
      <TextInput label="封面图 URL" value={post.cover} onChange={(value) => updatePost({ cover: value })} />
      <div className="two-col">
        <TextInput label="作者" value={post.author} onChange={(value) => updatePost({ author: value })} />
        <TextInput label="日期" value={post.date} onChange={(value) => updatePost({ date: value })} />
      </div>
      <div className="two-col">
        <TextInput
          label="标签，逗号分隔"
          value={post.tags.join(", ")}
          onChange={(value) =>
            updatePost({
              tags: value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            })
          }
        />
        <label>
          阅读分钟
          <input
            type="number"
            min={1}
            value={post.readingMinutes}
            onChange={(event) => updatePost({ readingMinutes: Number(event.target.value) })}
          />
        </label>
      </div>
      <Toggle label="发布" checked={post.published} onChange={(value) => updatePost({ published: value })} />
      <TextArea label="正文 Markdown" value={post.content} rows={16} onChange={(value) => updatePost({ content: value })} />
    </div>
  );
}

function ProductEditor({
  product,
  updateProduct,
}: {
  product: Product;
  updateProduct: (patch: Partial<Product>) => void;
}) {
  return (
    <div className="form-grid">
      <TextInput label="产品名" value={product.name} onChange={(value) => updateProduct({ name: value })} />
      <TextInput label="Slug" value={product.slug} onChange={(value) => updateProduct({ slug: slugify(value) })} />
      <TextInput label="副标题" value={product.subtitle} onChange={(value) => updateProduct({ subtitle: value })} />
      <TextArea label="描述" value={product.description} rows={4} onChange={(value) => updateProduct({ description: value })} />
      <TextInput label="图片 URL" value={product.image} onChange={(value) => updateProduct({ image: value })} />
      <div className="two-col">
        <label>
          状态
          <select
            value={product.status}
            onChange={(event) => updateProduct({ status: event.target.value as Product["status"] })}
          >
            <option value="idea">idea</option>
            <option value="prototype">prototype</option>
            <option value="building">building</option>
            <option value="launched">launched</option>
          </select>
        </label>
        <TextInput label="年份" value={product.year} onChange={(value) => updateProduct({ year: value })} />
      </div>
      <div className="two-col">
        <TextInput
          label="标签，逗号分隔"
          value={product.tags.join(", ")}
          onChange={(value) =>
            updateProduct({
              tags: value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            })
          }
        />
        <TextInput
          label="亮点，逗号分隔"
          value={product.highlights.join(", ")}
          onChange={(value) =>
            updateProduct({
              highlights: value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />
      </div>
      <div className="two-col">
        <TextInput
          label="Demo URL"
          value={product.links.demo}
          onChange={(value) => updateProduct({ links: { ...product.links, demo: value } })}
        />
        <TextInput
          label="Repo URL"
          value={product.links.repo}
          onChange={(value) => updateProduct({ links: { ...product.links, repo: value } })}
        />
      </div>
      <div className="two-col align-start">
        <Toggle label="发布" checked={product.published} onChange={(value) => updateProduct({ published: value })} />
        <Toggle label="首页精选" checked={product.featured} onChange={(value) => updateProduct({ featured: value })} />
      </div>
    </div>
  );
}

function EmptyEditor() {
  return (
    <div className="empty-state editor-empty">
      <PencilSimple size={32} />
      <h2>还没有内容</h2>
      <p>点击左侧新建一条内容。</p>
    </div>
  );
}

export function App() {
  const { route, navigate, path } = useRouter();
  const { publicPosts, publicProducts, posts, products, state, error } = useContent();

  const post = useMemo(
    () => publicPosts.find((item) => item.slug === route.slug),
    [publicPosts, route.slug],
  );

  let page: React.ReactNode;

  if (state === "loading") {
    page = <LoadingBlock />;
  } else if (state === "error") {
    page = <ErrorBlock error={error} />;
  } else if (route.name === "home") {
    page = <HomePage posts={publicPosts} products={publicProducts} navigate={navigate} />;
  } else if (route.name === "blog") {
    page = <BlogPage posts={publicPosts} navigate={navigate} />;
  } else if (route.name === "post") {
    page = <PostPage post={post} navigate={navigate} />;
  } else if (route.name === "products") {
    page = <ProductsPage products={publicProducts} />;
  } else if (route.name === "admin") {
    page = <AdminPage initialPosts={posts} initialProducts={products} />;
  } else {
    page = <NotFound navigate={navigate} />;
  }

  return (
    <Shell navigate={navigate} path={path}>
      {page}
    </Shell>
  );
}
