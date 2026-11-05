import Image from "next/image";

const photos = [
  {
    src: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=400",
    alt: "Volunteers distributing blankets at a night drive in Mirpur, Dhaka",
    caption: "Blanket Drive",
    location: "Mirpur 10, Dhaka",
  },
  {
    src: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400",
    alt: "Community members planting trees along the Agrabad road in Chattogram",
    caption: "Tree Plantation",
    location: "Agrabad, Chattogram",
  },
  {
    src: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=400",
    alt: "Youth volunteers cleaning a canal in Mohammadpur, Dhaka",
    caption: "Canal Cleanup",
    location: "Mohammadpur, Dhaka",
  },
  {
    src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400",
    alt: "Food relief distribution at a community centre in Uttara, Dhaka",
    caption: "Food Relief Drive",
    location: "Uttara, Dhaka",
  },
];

export default function Gallery() {
  return (
    <section id="gallery" className="border-t border-slate-200 bg-slate-100 py-16 dark:border-slate-800 dark:bg-slate-900/60 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Community Action Gallery
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real moments of warmth and togetherness captured during our recent events.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {photos.map(({ src, alt, caption, location }) => (
            <div
              key={caption}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 shadow dark:border-slate-800"
            >
              <Image
                src={src}
                alt={alt}
                fill
                unoptimized
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 p-4 text-center text-white opacity-0 transition group-hover:opacity-100">
                <div>
                  <p className="text-sm font-bold">{caption}</p>
                  <p className="mt-0.5 text-[11px] text-slate-300">{location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
