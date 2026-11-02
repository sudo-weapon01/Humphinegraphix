import Image from "next/image";
import type { PortfolioItem } from "@/lib/content/types";

type PortfolioCardProps = {
  item: PortfolioItem;
  priority?: boolean;
  sizes?: string;
};

export function PortfolioCard({ item, priority = false, sizes = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" }: PortfolioCardProps) {
  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-[3px] border border-brand-line bg-brand-paper-deep">
        <div className="aspect-[3/4]">
          <Image
            src={item.image}
            alt={item.imageAlt || `${item.title} flyer design`}
            width={800}
            height={1067}
            priority={priority}
            sizes={sizes}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <span className="absolute left-3 top-3 rounded-[2px] bg-brand-primary/90 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-brand-paper backdrop-blur">
          {item.flyerType}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="font-heading text-lg font-bold tracking-[-0.02em] text-brand-primary">
          {item.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">{item.description}</p>
      </div>
    </article>
  );
}
