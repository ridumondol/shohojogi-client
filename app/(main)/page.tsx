import type { Metadata } from "next";
import Banner from "@/components/home/Banner";
import Features from "@/components/home/Features";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import Gallery from "@/components/home/Gallery";
import Newsletter from "@/components/home/Newsletter";

export const metadata: Metadata = {
  title: "Shohojogi | Serve Together — Community Events Bangladesh",
  description:
    "Discover and join upcoming community-service events across Bangladesh. Organise warmth events, tree plantations, and blood donation camps with Shohojogi.",
};

export default function HomePage() {
  return (
    <main>
      <Banner />
      <Features />
      <UpcomingEvents />
      <Gallery />
      <Newsletter />
    </main>
  );
}
