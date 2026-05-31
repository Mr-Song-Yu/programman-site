export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  published: boolean;
  cover: string;
  readingMinutes: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  status: "idea" | "prototype" | "building" | "launched";
  year: string;
  tags: string[];
  links: {
    demo: string;
    repo: string;
  };
  image: string;
  featured: boolean;
  published: boolean;
  highlights: string[];
};

export type ContentState = {
  posts: BlogPost[];
  products: Product[];
};

export type GitHubConfig = {
  owner: string;
  repo: string;
  branch: string;
  token: string;
};

export type SaveTarget = "posts" | "products";
