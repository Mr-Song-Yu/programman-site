import { useEffect, useMemo, useState } from "react";
import type { BlogPost, Product } from "../types";

type LoadState = "loading" | "ready" | "error";

async function loadJson<T>(path: string): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Unable to load ${path}`);
  }
  return response.json() as Promise<T>;
}

export function useContent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      loadJson<BlogPost[]>("content/blogs.json"),
      loadJson<Product[]>("content/products.json"),
    ])
      .then(([postData, productData]) => {
        if (cancelled) return;
        setPosts(postData);
        setProducts(productData);
        setState("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "内容加载失败");
        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const publicPosts = useMemo(
    () =>
      posts
        .filter((post) => post.published)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [posts],
  );

  const publicProducts = useMemo(
    () =>
      products
        .filter((product) => product.published)
        .sort((a, b) => Number(b.featured) - Number(a.featured)),
    [products],
  );

  return {
    posts,
    products,
    publicPosts,
    publicProducts,
    state,
    error,
  };
}
