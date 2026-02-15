"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  /** Delay in ms before adding the visible class */
  delay?: number;
  /** HTML tag to render (defaults to div) */
  as?: "div" | "section" | "article" | "aside";
}

/**
 * Wrapper that applies the animate-on-scroll CSS utility.
 * When the element enters the viewport, it adds the "visible" class
 * which triggers the opacity + translateY transition defined in globals.css.
 *
 * Elements start visible in SSR (no flash of invisible content),
 * then the animation class is applied only after hydration.
 */
export function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);

  // After hydration, apply the animate-on-scroll behavior
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const el = ref.current;
    if (!el) return;

    // If element is already in viewport, show immediately
    const rect = el.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (inViewport) {
      if (delay > 0) {
        setTimeout(() => el.classList.add("visible"), delay);
      } else {
        el.classList.add("visible");
      }
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => el.classList.add("visible"), delay);
          } else {
            el.classList.add("visible");
          }
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hydrated, delay]);

  // Before hydration: render without animate-on-scroll (fully visible)
  // After hydration: apply animate-on-scroll class
  return (
    <Tag ref={ref} className={`${hydrated ? "animate-on-scroll" : ""} ${className}`}>
      {children}
    </Tag>
  );
}
