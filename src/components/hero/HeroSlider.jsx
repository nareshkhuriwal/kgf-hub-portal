import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Lightweight hero slider:
 * - Auto-play (pause on hover)
 * - Arrows + dots
 * - Responsive height controlled by `aspect` (e.g., "aspect-[21/9]")
 */
export default function HeroSlider({
  slides = [],
  interval = 5000,
  aspect = "aspect-[21/9]",
}) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const hoverRef = useRef(false);

  // autoplay
  useEffect(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      if (!hoverRef.current && slides.length > 1) {
        setIdx((i) => (i + 1) % slides.length);
      }
    }, interval);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, interval]);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const go = (n) => {
    if (!slides.length) return;
    setIdx((n + slides.length) % slides.length);
  };

  if (!slides.length) {
    return (
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-amber-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="inline-block rounded-full bg-black/90 px-3 py-1 text-xs font-semibold tracking-wide text-white">
            KGF HUB • Clothing
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
            Everyday fits. <span className="text-gray-500">Premium feel.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-gray-600 md:text-base">
            Tees, denim, ethnic, and more—crafted for comfort and made to last.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden rounded-3xl border"
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
    >
      <div className={`relative ${aspect} w-full`}>
        {slides.map((s, i) => (
          <Slide key={i} active={i === idx} slide={s} />
        ))}

        {/* Arrows */}
        <button
          aria-label="Previous"
          onClick={() => go(idx - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur hover:bg-white"
        >
          ‹
        </button>
        <button
          aria-label="Next"
          onClick={() => go(idx + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur hover:bg-white"
        >
          ›
        </button>

        {/* Dots */}
        <div className="pointer-events-auto absolute inset-x-0 bottom-3 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === idx ? "bg-white" : "bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Slide({ active, slide }) {
  const Cmp = slide.to ? Link : "div";
  const props = slide.to ? { to: slide.to } : {};
  return (
    <Cmp
      {...props}
      className={`absolute inset-0 transition-opacity duration-700 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <img
        src={slide.src}
        alt={slide.label || "Hero"}
        className="h-full w-full object-cover"
      />
      {/* Bottom-left badge */}
      {slide.label && (
        <div className="pointer-events-none absolute bottom-4 left-4">
          <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur">
            {slide.label}
          </span>
        </div>
      )}
    </Cmp>
  );
}
