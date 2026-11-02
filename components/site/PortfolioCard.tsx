import Image from "next/image";
import type { PortfolioItem } from "@/lib/content/types";

type PortfolioCardProps = {
  item: PortfolioItem;
  index?: number;
  priority?: boolean;
  sizes?: string;
};

export function PortfolioCard({
  item,
  index,
  priority = false,
  sizes = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw",
}: PortfolioCardProps) {
  return (
    <article className="group">
      <div className="relative overflow-hidden border border-brand-line bg-brand-surface p-1.5 transition-colors duration-300 group-hover:border-brand-primary">
        <div className="relative aspect-[3/4] overflow-hidden bg-brand-paper-deep">
          <Image
            src={item.image}
            alt={item.imageAlt || `${item.title} flyer design`}
            width={800}
            height={1067}
            priority={priority}
            sizes={sizes}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>
        <span className="absolute left-3 top-3 bg-brand-paper/95 px-2 py-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-brand-primary backdrop-blur">
          {item.flyerType}
        </span>
        {index ? (
          <span
            aria-hidden="true"
            className="absolute bottom-3 right-3 bg-brand-primary/85 px-1.5 py-0.5 font-mono text-[0.55rem] tracking-[0.16em] text-brand-paper backdrop-blur"
          >
            {String(index).padStart(2, "0")}
          </span>
        ) : null}
      </div>
      <div className="mt-4 border-t border-brand-line pt-3">
        <h3 className="font-heading text-[1.05rem] font-extrabold tracking-[-0.025em] text-brand-primary">
          {item.title}
        </h3>
        <p className="mt-1.5 text-[0.85rem] leading-relaxed text-brand-muted">{item.description}</p>
      </div>
    </article>
  );
}
