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
  Moon,
  Sun,
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

type Theme = "light" | "dark";

type NavItem = {
  href: string;
  label: string;
};

const ADMIN_UNLOCK_KEY = "programman-admin-unlocked";
const ADMIN_CONFIG_KEY = "programman-github-config";
const ADMIN_PIN_KEY = "programman-admin-pin";
const THEME_KEY = "programman-theme";

const navItems: NavItem[] = [
  { href: "/blog", label: "Journal" },
  { href: "/products", label: "Vibe Lab" },
];

const promptKits = [
  {
    icon: Brain,
    title: "Brief Compressor",
    label: "需求压缩",
    summary: "把一句模糊想法压成目标用户、核心任务、页面结构、数据边界和验收标准。",
    prompt:
      "请先把我的想法整理成开发 brief。输出目标用户、核心流程、页面结构、数据模型、风险点和验收标准。遇到不确定处只问一个最关键问题。",
    principle: "先约束问题，再生成代码。AI 写得快，但模糊 brief 会把速度变成返工。",
  },
  {
    icon: TerminalWindow,
    title: "Repo Cartographer",
    label: "代码勘察",
    summary: "进入项目先画地图，找到入口、依赖、状态流、构建命令和可能破坏的边界。",
    prompt:
      "请先阅读项目结构，不要改代码。找出主入口、路由、状态管理、数据来源、构建命令和这次修改最可能影响的文件。",
    principle: "让系统先教你怎么动手。越熟悉现有边界，越少制造新的复杂度。",
  },
  {
    icon: Strategy,
    title: "Design Critic",
    label: "界面审稿",
    summary: "识别页面里的模板感、视觉噪声、无用装饰、移动端风险和文案含混处。",
    prompt:
      "请从真实用户视角审查这个页面。指出层级、文案、留白、按钮状态、移动端和可访问性问题，只列会影响体验的改动。",
    principle: "设计不是堆效果，而是让下一步动作更清晰、更可信、更值得点击。",
  },
  {
    icon: FlowArrow,
    title: "Ship Loop",
    label: "发布闭环",
    summary: "把构建、预览、DNS、HTTPS、回滚和复盘纳入同一条上线链路。",
    prompt:
      "请把这次上线拆成检查清单。包含本地构建、路由、内容、SEO、DNS、HTTPS、回滚方案和发布后验证命令。",
    principle: "发布不是最后一步。可验证、可回滚、可记录，才是完整的产品动作。",
  },
];

const operatingPrinciples = [
  {
    icon: FileText,
    title: "Context before code",
    text: "每次编码前先读 brief、路由、数据和约束。真正高级的速度，不是少看上下文，而是少做错误假设。",
  },
  {
    icon: Stack,
    title: "Small surface, strong loop",
    text: "把大愿望切成能构建、能预览、能验证的小表面。每一轮都留下可运行结果。",
  },
  {
    icon: Cards,
    title: "Prompt as interface",
    text: "prompt 不是口号，是人和模型之间的接口。它应该定义输入、边界、输出、失败处理和验收方式。",
  },
  {
    icon: ShieldCheck,
    title: "Ship with receipts",
    text: "构建日志、DNS 状态、HTTPS、截图和复盘都要被记录。上线后能解释，才算真的交付。",
  },
];

const consoleLines = [
  "read brief -> extract constraints",
  "map repo -> identify safe edit surface",
  "compose UI -> remove template smell",
  "build -> browser verify -> deploy",
];

const stackSignals = [
  { label: "Host", value: "GitHub Pages" },
  { label: "Domain", value: site.domain },
  { label: "CMS", value: "GitHub Contents API" },
  { label: "Motion", value: "CSS + IntersectionObserver" },
];

const statusLabels: Record<Product["status"], string> = {
  idea: "idea",
  prototype: "prototype",
  building: "building",
  launched: "launched",
};

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
      blog: "Programman Journal",
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

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
}

function useRevealOnScroll(trigger: string) {
  useEffect(() => {
    document.documentElement.classList.add("reveal-ready");
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const markVisible = (node: HTMLElement) => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        node.classList.add("is-visible");
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.16 },
    );

    nodes.forEach((node) => {
      markVisible(node);
      observer.observe(node);
    });
    return () => observer.disconnect();
  }, [trigger]);
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
  theme,
  toggleTheme,
}: {
  children: ReactNode;
  navigate: (href: string) => void;
  path: string;
  theme: Theme;
  toggleTheme: () => void;
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
        <div className="header-actions">
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
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "切换到白天主题" : "切换到黑夜主题"}
            title={theme === "dark" ? "切换到白天主题" : "切换到黑夜主题"}
          >
            {theme === "dark" ? <Sun weight="bold" /> : <Moon weight="bold" />}
          </button>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div>
          <strong>{site.name}</strong>
          <span>{site.domain}</span>
        </div>
        <span>Vibe-coding notes, prompt systems, launch logs, and small products.</span>
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
      <section className="hero-section" data-reveal>
        <div className="hero-copy">
          <p className="kicker">Programman Operating Journal</p>
          <h1>为 AI 时代写软件，也写清楚如何写。</h1>
          <p>
            这里不是普通作品集，而是一张公开工作台：记录 prompt 如何变成接口、代码如何被验证、页面如何上线，以及一个高级程序员怎样把模糊想法压成可交付产品。
          </p>
          <div className="hero-actions">
            <Link href="/products" navigate={navigate} className="button primary">
              进入 Vibe Lab <ArrowRight weight="bold" />
            </Link>
            <Link href="/blog" navigate={navigate} className="button secondary">
              阅读工程日志 <BookOpenText weight="bold" />
            </Link>
          </div>
        </div>

        <div className="operator-board" aria-label="Programman 工作台预览">
          <div className="console-card">
            <div className="console-top">
              <span>programman.run</span>
              <span>live loop</span>
            </div>
            <div className="console-lines">
              {consoleLines.map((line, index) => (
                <div className="console-line" key={line} style={{ animationDelay: `${index * 180}ms` }}>
                  <span className="pulse-dot" />
                  <code>{line}</code>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1500&q=82"
              alt="深色代码编辑器中的工程工作台"
            />
          </div>
          <div className="floating-spec">
            <Code weight="bold" />
            <span>static-first, content-managed, DNS-verified</span>
          </div>
        </div>
      </section>

      <section className="signal-strip" aria-label="站点能力信号" data-reveal>
        {stackSignals.map((signal) => (
          <div key={signal.label}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
          </div>
        ))}
      </section>

      <section className="page-section operating-section" data-reveal>
        <div className="section-heading stacked">
          <p className="kicker">Operating system</p>
          <h2>高级程序员的博客，应该展示判断力，而不只是展示结果。</h2>
          <p>
            每篇文章、每个 prompt、每个小产品，都围绕同一件事：把不确定性拆小，把工程动作做实，把发布结果留下证据。
          </p>
        </div>
        <div className="principle-grid">
          {operatingPrinciples.map((item) => (
            <article className="principle-card" key={item.title}>
              <span className="icon-badge">
                <item.icon weight="bold" />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section prompt-section" data-reveal>
        <div className="section-heading inline-heading">
          <div>
            <p className="kicker">Prompt systems</p>
            <h2>把 vibe-coding 变稳的四套 prompt。</h2>
          </div>
          <p>
            它们不是咒语，而是工作流接口。每一条都服务于更清晰的输入、更小的返工和更快的验证。
          </p>
        </div>
        <div className="prompt-grid">
          {promptKits.map((kit) => (
            <PromptKitCard key={kit.title} kit={kit} />
          ))}
        </div>
      </section>

      <section className="page-section" data-reveal>
        <div className="section-heading inline-heading">
          <div>
            <p className="kicker">Product shelf</p>
            <h2>有方法论的 vibe-coding 小产品。</h2>
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

      <section className="page-section writing-section" data-reveal>
        <div className="section-heading inline-heading">
          <div>
            <p className="kicker">Latest writing</p>
            <h2>最近的工程日志。</h2>
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

function BlogHomePage({
  posts,
  products,
  navigate,
}: {
  posts: BlogPost[];
  products: Product[];
  navigate: (href: string) => void;
}) {
  const lead = posts[0];
  const rest = posts.slice(1, 5);
  const columnProducts = products.slice(0, 5);

  return (
    <section className="journal-home" data-reveal>
      <div className="home-intro">
        <p className="kicker">Programman Journal</p>
        <h1>一个程序员的博客、产品实验和 AI 编程笔记。</h1>
        <p>
          这里以文章为主线：记录工程判断、prompt 设计、上线复盘和 vibe coding 产品实验。文章可以继续阅读，产品放在独立专栏里作为长期迭代的目录。
        </p>
      </div>

      <div className="home-columns">
        <section className="blog-column" aria-labelledby="home-blog-heading">
          <div className="column-heading">
            <div>
              <span className="section-label">Blog articles</span>
              <h2 id="home-blog-heading">博客文章</h2>
            </div>
            <Link href="/blog" navigate={navigate} className="text-link">
              查看全部 <ArrowRight weight="bold" />
            </Link>
          </div>

          {lead ? <FeaturedArticle post={lead} navigate={navigate} /> : null}

          <div className="article-list">
            {rest.map((post) => (
              <ArticleListItem key={post.id} post={post} navigate={navigate} />
            ))}
          </div>
        </section>

        <aside className="product-column" aria-labelledby="home-product-heading">
          <div className="column-heading compact">
            <div>
              <span className="section-label">Vibe coding</span>
              <h2 id="home-product-heading">产品专栏</h2>
            </div>
            <Link href="/products" navigate={navigate} className="text-link">
              Vibe Lab <ArrowRight weight="bold" />
            </Link>
          </div>

          <div className="product-column-note">
            <RocketLaunch weight="bold" />
            <p>这些不是一次性作品，而是把 prompt、skill、发布清单和设计判断产品化的实验。</p>
          </div>

          <div className="product-rail">
            {columnProducts.map((product) => (
              <ProductRailItem key={product.id} product={product} navigate={navigate} />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function FeaturedArticle({
  post,
  navigate,
}: {
  post: BlogPost;
  navigate: (href: string) => void;
}) {
  return (
    <article className="featured-article">
      <Link href={`/blog/${post.slug}`} navigate={navigate} className="featured-article-image">
        <img src={post.cover} alt={post.title} />
      </Link>
      <div className="featured-article-body">
        <div className="meta-row">
          <time dateTime={post.date}>{post.date}</time>
          <span>{post.readingMinutes} min read</span>
        </div>
        <h3>
          <Link href={`/blog/${post.slug}`} navigate={navigate}>
            {post.title}
          </Link>
        </h3>
        <p>{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} navigate={navigate} className="read-more">
          阅读全文 <ArrowRight weight="bold" />
        </Link>
      </div>
    </article>
  );
}

function ArticleListItem({
  post,
  navigate,
}: {
  post: BlogPost;
  navigate: (href: string) => void;
}) {
  return (
    <article className="article-list-item">
      <Link href={`/blog/${post.slug}`} navigate={navigate}>
        <div className="meta-row">
          <time dateTime={post.date}>{post.date}</time>
          <span>{post.readingMinutes} min read</span>
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <div className="tag-row">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </Link>
    </article>
  );
}

function ProductRailItem({
  product,
  navigate,
}: {
  product: Product;
  navigate: (href: string) => void;
}) {
  return (
    <article className="product-rail-item">
      <Link href="/products" navigate={navigate}>
        <div className="product-rail-top">
          <span>{statusLabels[product.status]}</span>
          <span>{product.year}</span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.subtitle}</p>
        <div className="tag-row">
          {product.tags.slice(0, 2).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </Link>
    </article>
  );
}

function PromptKitCard({ kit }: { kit: (typeof promptKits)[number] }) {
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
          <span>{post.readingMinutes} min read</span>
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
          <span>{statusLabels[product.status]}</span>
        </div>
        <h3>{product.name}</h3>
        <p className="product-subtitle">{product.subtitle}</p>
        <p>{product.description}</p>
        <div className="tag-row">
          {product.tags.slice(0, 4).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
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
  const lead = posts[0];
  const rest = posts.slice(1);

  return (
    <section className="page-section first-section" data-reveal>
      <div className="section-heading stacked page-intro">
        <p className="kicker">Journal</p>
        <h1>工程日志、prompt 设计和发布复盘。</h1>
        <p>
          这里写的不是流水账，而是可迁移的判断：怎样读项目、怎样压缩需求、怎样让 AI 参与开发又不失控。
        </p>
      </div>
      {lead ? (
        <article className="lead-article">
          <Link href={`/blog/${lead.slug}`} navigate={navigate} className="lead-image">
            <img src={lead.cover} alt={lead.title} />
          </Link>
          <div>
            <div className="meta-row">
              <time dateTime={lead.date}>{lead.date}</time>
              <span>{lead.readingMinutes} min read</span>
            </div>
            <h2>
              <Link href={`/blog/${lead.slug}`} navigate={navigate}>
                {lead.title}
              </Link>
            </h2>
            <p>{lead.excerpt}</p>
            <Link href={`/blog/${lead.slug}`} navigate={navigate} className="text-link">
              阅读这篇 <ArrowRight weight="bold" />
            </Link>
          </div>
        </article>
      ) : null}
      <div className="post-index roomy">
        {rest.map((post) => (
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
    <article className="article-page" data-reveal>
      <div className="article-hero">
        <div>
          <Link href="/blog" navigate={navigate} className="back-link">
            <ArrowRight /> 返回日志
          </Link>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="meta-row">
            <time dateTime={post.date}>{post.date}</time>
            <span>{post.author}</span>
            <span>{post.readingMinutes} min read</span>
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
      <section className="page-section first-section product-hero" data-reveal>
        <div className="section-heading stacked page-intro">
          <p className="kicker">Vibe Lab</p>
          <h1>有用的 skill、prompt 和小产品原型。</h1>
          <p>
            展示重点不是工具名，而是使用场景、设计思路、验证方式和可迁移方法。每个产品都应该帮下一次开发少踩一个坑。
          </p>
        </div>
        <div className="lab-manifest">
          <div>
            <span>01</span>
            <strong>Skill</strong>
            <p>沉淀一类任务的判断标准。</p>
          </div>
          <div>
            <span>02</span>
            <strong>Prompt</strong>
            <p>定义输入、边界和输出契约。</p>
          </div>
          <div>
            <span>03</span>
            <strong>Product</strong>
            <p>把工作流变成可复用界面。</p>
          </div>
        </div>
      </section>
      <section className="page-section no-top-padding" data-reveal>
        <div className="product-list">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <section className="page-section prompt-section" data-reveal>
        <div className="section-heading stacked">
          <p className="kicker">Prompt library</p>
          <h2>可以直接复制改造的 prompt 设计。</h2>
          <p>每一条都带着设计原理，帮助你判断什么时候用、怎样改、失败时该看哪里。</p>
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
          管理台已经从公开导航移除，并禁止搜索索引。静态站无法提供真正的服务端鉴权，写入权限仍由 GitHub token 控制。
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
  const { theme, toggleTheme } = useTheme();

  useRouteMeta(route);
  useRevealOnScroll(`${path}:${state}:${publicPosts.length}:${publicProducts.length}`);

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
    page = <BlogHomePage posts={publicPosts} products={publicProducts} navigate={navigate} />;
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
    <Shell navigate={navigate} path={path} theme={theme} toggleTheme={toggleTheme}>
      {page}
    </Shell>
  );
}
