import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number; // ms per character
  deletingSpeed?: number; // ms per character when deleting
  pauseBetween?: number; // ms pause at end of phrase before deleting/next
  loop?: boolean;
  className?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  phrases,
  typingSpeed = 40,
  deletingSpeed = 25,
  pauseBetween = 1200,
  loop = false,
  className,
}) => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const currentPhrase = phrases[index] ?? "";

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!currentPhrase) return;

    // Respect reduced motion: render the full first phrase immediately
    if (prefersReducedMotion) {
      setText(currentPhrase);
      return;
    }

    let timeout: number | undefined;

    if (!deleting) {
      if (text.length < currentPhrase.length) {
        timeout = window.setTimeout(() => {
          setText(currentPhrase.slice(0, text.length + 1));
        }, typingSpeed);
      } else {
        if (loop && phrases.length > 1) {
          timeout = window.setTimeout(() => setDeleting(true), pauseBetween);
        }
        // If not looping, stop after fully typed
      }
    } else {
      if (text.length > 0) {
        timeout = window.setTimeout(() => {
          setText(currentPhrase.slice(0, text.length - 1));
        }, deletingSpeed);
      } else {
        setDeleting(false);
        setIndex((i) => (i + 1) % phrases.length);
      }
    }

    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
    // We intentionally exclude some deps to keep the typing flow smooth
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, deleting, currentPhrase, prefersReducedMotion, typingSpeed, deletingSpeed, pauseBetween, loop, phrases.length]);

  // If reduced motion is on, ensure the full phrase is shown
  useEffect(() => {
    if (prefersReducedMotion) setText(currentPhrase);
  }, [prefersReducedMotion, currentPhrase]);

  return (
    <span className={cn("typewriter-caret", className)} aria-live={loop ? "polite" : undefined}>
      {text}
    </span>
  );
};

export default TypewriterText;
