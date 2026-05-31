import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpenText,
  Brain,
  BracketsCurly,
  Cards,
  Check,
  Code,
  EyeSlash,
  FileText,
  Fingerprint,
  FloppyDisk,
  FlowArrow,
  GithubLogo,
  GlobeHemisphereEast,
  Key,
  LockKey,
  PencilSimple,
  Plus,
  RocketLaunch,
  ShieldCheck,
  Stack,
  Strategy,
  TerminalWindow,
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

type NavItem = {
  href: string;
  label: string;
};

const ADMIN_UNLOCK_KEY = "programman-admin-unlocked";
const ADMIN_CONFIG_KEY = "programman-github-config";
const ADMIN_PIN_KEY = "programman-admin-pin";

const navItems: NavItem[] = [
  { href: "/blog", label: "Blog" },
  { href: "/products", label: "Vibe Lab" },
];

const promptKits = [
  {
    icon: Brain,
    title: "Brief Compressor",
    label: "需求压缩",
    summary: "把一句模糊想法压成目标、用户、页面、数据、验收标准五件事。",
    prompt:
      "请先把我的想法整理成开发 brief。输出目标用户、核心流程、页面结构、数据模型、风险点和验收标准。遇到不确定处只问一个最关键问题。",
    principle: "先约束问题，再生成代码。AI 写得快，但模糊 brief 会把速度变成返工。",
  },
  {
    icon: TerminalWindow,
    title: "Repo Cartographer",
    label: "代码勘察",
    summary: "进入项目先画地图，找入口、依赖、状态流和危险边界。",
    prompt:
      "请先阅读项目结构，不要改代码。找出主入口、路由、状态管理、数据来源、构建命令和最可能影响这次修改的文件。",
    principle: "先让系统教你怎么动手。越熟悉现有边界，越少制造新复杂度。",
  },
  {
    icon: Strategy,
    title: "Design Critic",
    label: "界面审稿",
    summary: "专门识别页面里的模板感、视觉噪声和没有用途的装饰。",
    prompt:
      "请从真实用户视角审查这个页面。指出层级、文案、留白、按钮状态、移动端和可访问性问题，只列会影响体验的改动。",
    principle: "设计不是堆效果，而是让下一步动作更清楚、更值得信任。",
  },
  {
    icon: FlowArrow,
    title: "Ship Loop",
    label: "发布闭环",
    summary: "把构建、测试、DNS、部署、复盘纳入同一条上线链路。",
    prompt:
      "请把这次上线拆成检查清单。包含本地构建、路由、内容、SEO、DNS、HTTPS、回滚方案和发布后验证命令。",
    principle: "发布不是最后一步。可验证、可回滚、可记录，才是一个完整产品动作。",
  },
];

const methodSteps = [
  {
    icon: FileText,
    title: "01 先写任务边界",
    text: "明确要做什么，也明确暂时不做什么。这样 prompt 不会变成愿望清单。",
  },
  {
    icon: Stack,
    title: "02 再读现有系统",
    text: "让代码库的结构决定实现风格。复用已有模式，比新建抽象更可靠。",
  },
  {
    icon: Cards,
    title: "03 小步构建可见结果",
    text: "每一轮都应该能跑、能看、能被验证。模糊灵感要尽快变成界面或命令输出。",
  },
  {
    icon: ShieldCheck,
    title: "04 最后补安全和发布检查",
    text: "静态站也需要边界意识。管理入口、token 权限、DNS、HTTPS 都要有清楚的检查点。",
  },
];

const emptyPost = (): BlogPost => ({
  id: uid("post"),
  slug: "",
  title: "",
  excerpt: "",
  content: "## 新文章\n\n从这里开始写。先给读者一个问题，再给一个可复用的方法。",
  author: "Programman",
  date: new Date().toISOString().slice(0, 10),
  tags: [],
  published: false,
  cover:
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80",
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
  image:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
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

function useRouteMeta(route: Route) {
  useEffect(() => {
    const titles: Record<Route["name"], string> = {
      home: "Programman",
      blog: "Programman Blog",
      post: "Programman Article",
      products: "Programman Vibe Lab",
      admin: "Programman Studio",
      "not-found": "Programman",
    };
    document.title = titles[route.name];

    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = route.name === "admin" ? "noindex,nofollow" : "index,follow";
  }, [route.name]);
}

function Link({
  href,
  navigate,
  children,
  className,
}: {
  href: string;
  navigate: (href: string) => void;
  children: ReactNode;
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
  children: ReactNode;
  navigate: (href: string) => void;
  path: string;
}) {
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
          {navItems.map((item) => (
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
        <div>
          <strong>{site.name}</strong>
          <span>{site.domain}</span>
        </div>
        <span>Vibe-coding notes, prompt systems, and small products.</span>
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
  const featured = products.filter((product) => product.featured).slice(0, 3);

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="kicker">Vibe-coding studio</p>
          <h1>把想法变成可运行的产品，再把过程写成方法。</h1>
          <p>
            Programman 记录 AI 辅助开发、prompt 设计、前端审美、部署清单和个人产品实验。
          </p>
          <div className="hero-actions">
            <Link href="/products" navigate={navigate} className="button primary">
              进入 Vibe Lab <ArrowRight weight="bold" />
            </Link>
            <Link href="/blog" navigate={navigate} className="button secondary">
              阅读笔记 <BookOpenText weight="bold" />
            </Link>
          </div>
        </div>
        <div className="hero-board" aria-label="vibe-coding 工作流">
          <div className="board-visual">
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1500&q=82"
              alt="打开代码编辑器的开发工作台"
            />
          </div>
          <div className="board-panel board-panel-main">
            <span>Operating loop</span>
            <strong>brief / build / verify / publish</strong>
          </div>
          <div className="board-panel board-panel-side">
            <Code weight="bold" />
            <span>Static first</span>
          </div>
        </div>
      </section>

      <section className="metric-strip" aria-label="站点内容统计">
        <div>
          <strong>{posts.length}</strong>
          <span>public notes</span>
        </div>
        <div>
          <strong>{products.length}</strong>
          <span>lab products</span>
        </div>
        <div>
          <strong>{promptKits.length}</strong>
          <span>prompt systems</span>
        </div>
        <div>
          <strong>0</strong>
          <span>server required</span>
        </div>
      </section>

      <section className="page-section lab-section">
        <div className="section-heading stacked">
          <p className="kicker">Prompt systems</p>
          <h2>把 vibe-coding 变稳的四套 prompt</h2>
          <p>它们不是咒语，而是工作流接口。每一条都服务于更清楚的输入、更小的返工和更快的验证。</p>
        </div>
        <div className="prompt-grid">
          {promptKits.map((kit) => (
            <PromptKitCard key={kit.title} kit={kit} />
          ))}
        </div>
      </section>

      <section className="page-section split-method">
        <div className="method-intro">
          <p className="kicker">Design principle</p>
          <h2>先设计判断，再设计页面。</h2>
          <p>
            一个好的 AI 开发流程，不是让模型连续输出更多代码，而是持续缩小不确定性。
          </p>
        </div>
        <div className="method-stack">
          {methodSteps.map((step) => (
            <div className="method-row" key={step.title}>
              <step.icon weight="bold" />
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading inline-heading">
          <div>
            <p className="kicker">Product shelf</p>
            <h2>可复用的 vibe-coding 小产品</h2>
          </div>
          <Link href="/products" navigate={navigate} className="text-link">
            查看全部 <ArrowRight weight="bold" />
          </Link>
        </div>
        <div className="featured-products">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading inline-heading">
          <div>
            <p className="kicker">Latest writing</p>
            <h2>最近的开发笔记</h2>
          </div>
          <Link href="/blog" navigate={navigate} className="text-link">
            所有文章 <ArrowRight weight="bold" />
          </Link>
        </div>
        <div className="post-index">
          {latest.map((post) => (
            <ArticleCard key={post.id} post={post} navigate={navigate} />
          ))}
        </div>
      </section>
    </>
  );
}

function PromptKitCard({
  kit,
}: {
  kit: (typeof promptKits)[number];
}) {
  return (
    <article className="prompt-card">
      <div className="prompt-card-top">
        <span className="icon-badge">
          <kit.icon weight="bold" />
        </span>
        <span>{kit.label}</span>
      </div>
      <h3>{kit.title}</h3>
      <p>{kit.summary}</p>
      <blockquote>{kit.prompt}</blockquote>
      <small>{kit.principle}</small>
    </article>
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
    <article className={product.featured ? "product-card featured" : "product-card"}>
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
      <div className="section-heading stacked page-intro">
        <p className="kicker">Blog</p>
        <h1>开发笔记、prompt 设计和发布复盘</h1>
        <p>记录从模糊需求到上线页面的过程，也保留那些下次能直接复用的判断。</p>
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
    <>
      <section className="page-section first-section product-hero">
        <div className="section-heading stacked page-intro">
          <p className="kicker">Vibe Lab</p>
          <h1>有用的 skill、prompt 和小产品原型</h1>
          <p>这里展示的不只是工具名称，而是背后的使用场景、设计思路和可迁移方法。</p>
        </div>
      </section>
      <section className="page-section no-top-padding">
        <div className="product-list">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <section className="page-section lab-section">
        <div className="section-heading stacked">
          <p className="kicker">Prompt library</p>
          <h2>可以直接复制改造的 prompt 设计</h2>
        </div>
        <div className="prompt-grid">
          {promptKits.map((kit) => (
            <PromptKitCard key={kit.title} kit={kit} />
          ))}
        </div>
      </section>
    </>
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

function AdminGate({ children }: { children: ReactNode }) {
  const [hasLocalPin, setHasLocalPin] = useState(() => Boolean(localStorage.getItem(ADMIN_PIN_KEY)));
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(ADMIN_UNLOCK_KEY) === "true");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [message, setMessage] = useState("");

  const setupPin = () => {
    if (pin.trim().length < 6) {
      setMessage("本地口令至少 6 位。");
      return;
    }
    if (pin !== confirmPin) {
      setMessage("两次输入不一致。");
      return;
    }
    localStorage.setItem(ADMIN_PIN_KEY, pin);
    localStorage.setItem(ADMIN_UNLOCK_KEY, "true");
    setHasLocalPin(true);
    setUnlocked(true);
  };

  const unlock = () => {
    const saved = localStorage.getItem(ADMIN_PIN_KEY);
    if (!saved || saved !== pin) {
      setMessage("本地口令不正确。");
      return;
    }
    localStorage.setItem(ADMIN_UNLOCK_KEY, "true");
    setUnlocked(true);
  };

  if (unlocked) return <>{children}</>;

  return (
    <section className="admin-gate">
      <div className="gate-card">
        <div className="gate-icon">
          <LockKey weight="bold" />
        </div>
        <p className="kicker">Private studio</p>
        <h1>{hasLocalPin ? "解锁内容管理台" : "设置本地管理口令"}</h1>
        <p>
          管理台已从公开导航移除，并禁止搜索索引。静态站无法提供服务端鉴权，真正的写入权限仍由 GitHub token 控制。
        </p>
        <div className="gate-form">
          <label>
            本地口令
            <input
              value={pin}
              type="password"
              autoComplete="current-password"
              onChange={(event) => setPin(event.target.value)}
            />
          </label>
          {!hasLocalPin ? (
            <label>
              确认口令
              <input
                value={confirmPin}
                type="password"
                autoComplete="new-password"
                onChange={(event) => setConfirmPin(event.target.value)}
              />
            </label>
          ) : null}
          {message ? <div className="notice error">{message}</div> : null}
          <button className="button primary" onClick={hasLocalPin ? unlock : setupPin}>
            {hasLocalPin ? "解锁管理台" : "保存并进入"} <Key weight="bold" />
          </button>
        </div>
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
    const saved = localStorage.getItem(ADMIN_CONFIG_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as GitHubConfig;
      } catch {
        return { owner: "Mr-Song-Yu", repo: "programman-site", branch: site.defaultBranch, token: "" };
      }
    }
    return { owner: "Mr-Song-Yu", repo: "programman-site", branch: site.defaultBranch, token: "" };
  });

  useEffect(() => {
    setPosts(initialPosts);
    setProducts(initialProducts);
  }, [initialPosts, initialProducts]);

  useEffect(() => {
    localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  const selectedPost = posts.find((post) => post.id === selectedId) ?? posts[0];
  const selectedProduct = products.find((product) => product.id === selectedId) ?? products[0];
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

  const clearLocalSecrets = () => {
    const ok = window.confirm("确定清除本地 token 和管理口令吗？这不会删除仓库内容。");
    if (!ok) return;
    localStorage.removeItem(ADMIN_CONFIG_KEY);
    localStorage.removeItem(ADMIN_PIN_KEY);
    localStorage.removeItem(ADMIN_UNLOCK_KEY);
    window.location.reload();
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
              slug: patch.name && !product.slug ? slugify(patch.name) : patch.slug ?? product.slug,
            }
          : product,
      ),
    );
  };

  return (
    <AdminGate>
      <section className="admin-shell">
        <div className="admin-heading">
          <div>
            <p className="kicker">Studio</p>
            <h1>内容管理台</h1>
            <p>通过 GitHub Contents API 更新博客和产品内容。token 只保存在当前浏览器。</p>
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

        <div className="security-note">
          <Fingerprint weight="bold" />
          <span>公开静态站无法隐藏前端代码。请使用 fine-grained token，只授权此仓库的 Contents 读写权限。</span>
          <button onClick={clearLocalSecrets}>
            <EyeSlash weight="bold" /> 清除本地凭据
          </button>
        </div>

        <div className="admin-config">
          <TextInput
            label="Owner"
            value={config.owner}
            placeholder="GitHub 用户名"
            onChange={(value) => setConfig({ ...config, owner: value.trim() })}
          />
          <TextInput
            label="Repo"
            value={config.repo}
            placeholder="仓库名"
            onChange={(value) => setConfig({ ...config, repo: value.trim() })}
          />
          <TextInput
            label="Branch"
            value={config.branch}
            onChange={(value) => setConfig({ ...config, branch: value.trim() })}
          />
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
    </AdminGate>
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

  useRouteMeta(route);

  const post = useMemo(
    () => publicPosts.find((item) => item.slug === route.slug),
    [publicPosts, route.slug],
  );

  let page: ReactNode;

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
