import { useState, useEffect } from "react";
import type { MetaFunction } from "react-router";
import { AnnouncementBar } from "~/components/home/AnnouncementBar";
import { HomeCatalogueCTA } from "~/components/home/HomeCatalogueCTA";
import { HomeCategoriesSection } from "~/components/home/HomeCategoriesSection";
import { HomeFeaturedSection } from "~/components/home/HomeFeaturedSection";
import { HeroSection } from "~/components/home/HeroSection";
import { HomeTrustSection } from "~/components/home/HomeTrustSection";
import { CATEGORIES } from "~/components/home/home-data";
import { useProducts } from "~/lib/queries";

export const meta: MetaFunction = () => [
  { title: "Blacktoner — Laptops, Printers & Cartridges in Kenya" },
  { name: "description", content: "Your one-stop tech shop — laptops, printers, toners, and accessories at the best prices in Kenya." },
];

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [catIndex, setCatIndex] = useState(0);

  const { data: hotDeals = [] }    = useProducts({ badge: "Hot Deal",    limit: 3 });
  const { data: bestSellers = [] } = useProducts({ badge: "Best Seller", limit: 3 });
  const { data: featured = [] }    = useProducts({ featured: true,       limit: 8 });

  const heroSlides = [...hotDeals, ...bestSellers].slice(0, 6);

  useEffect(() => {
    const t = setInterval(() => setCatIndex((c) => (c + 1) % CATEGORIES.length), 2500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!heroSlides.length) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 4000);
    return () => clearInterval(t);
  }, [heroSlides.length]);

  return (
    <div className="flex flex-col bg-white">
      <AnnouncementBar />
      <HeroSection
        heroSlides={heroSlides}
        slide={slide}
        catIndex={catIndex}
        onPrev={() => setSlide((s) => (s - 1 + heroSlides.length) % heroSlides.length)}
        onNext={() => setSlide((s) => (s + 1) % heroSlides.length)}
      />
      <HomeCategoriesSection />
      <HomeFeaturedSection featured={featured} />
      <HomeCatalogueCTA />
      <HomeTrustSection />
    </div>
  );
}
