// services-card.tsx (21st.dev animated service card carousel, as supplied)
// Adapted to this project: imports from ./lib, plain <button> controls instead of the shadcn Button,
// site colours instead of the purple/green/red gradients, a "Mérce" line under the description,
// and a min-height instead of a fixed 450 px so the longer commitments fit.

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "./lib";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

// --- Carousel Context ---
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];
type CarouselApi = ReturnType<typeof useEmblaCarousel>[1];
type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};
type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error("useCarousel must be used within a <Carousel />");
  return context;
}

// --- Main Carousel Component ---
const Carousel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & CarouselProps>(
  ({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref) => {
    const [carouselRef, api] = useEmblaCarousel({ ...opts, axis: orientation === "horizontal" ? "x" : "y" }, plugins);
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) return;
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
    const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext],
    );

    React.useEffect(() => {
      if (!api || !setApi) return;
      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) return;
      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);
      return () => {
        api?.off("select", onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider value={{ carouselRef, api, opts, orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}>
        <div ref={ref} onKeyDownCapture={handleKeyDown} className={cn("relative", className)} role="region" aria-roledescription="carousel" {...props}>
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

// --- Carousel Content ---
const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y">
      <div ref={ref} className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)} {...props} />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

// --- Carousel Item ---
const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

// --- Carousel Controls ---
const controlClass =
  "relative md:absolute md:top-1/2 md:-translate-y-1/2 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border-0 bg-primary text-primary-foreground shadow-md transition-opacity hover:opacity-90 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

const CarouselPrevious = ({ label, className }: { label: string; className?: string }) => {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button type="button" className={cn(controlClass, "md:-left-5", className)} onClick={scrollPrev} disabled={!canScrollPrev}>
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
};

const CarouselNext = ({ label, className }: { label: string; className?: string }) => {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button type="button" className={cn(controlClass, "md:-right-5", className)} onClick={scrollNext} disabled={!canScrollNext}>
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
};

// --- Service Card & Carousel Section ---
export interface Service {
  number: string;
  title: string;
  description: string;
  measure?: string;
  icon: React.ElementType;
  tone?: string;
}

const ServiceCard = ({ service, index }: { service: Service; index: number }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        "relative flex h-full min-h-[430px] w-full flex-col justify-between gap-8 overflow-hidden rounded-3xl p-7 md:p-8",
        service.tone ?? "bg-secondary text-foreground",
      )}
    >
      <div className="z-10 flex items-start justify-between">
        <span className="text-sm font-medium tabular-nums opacity-60">( {service.number} )</span>
        <service.icon className="h-10 w-10 opacity-90" aria-hidden="true" />
      </div>
      <div className="z-10 flex flex-col gap-3">
        <h3 className="text-[19px] font-semibold leading-snug">{service.title}</h3>
        <p className="text-[15px] leading-relaxed opacity-80">{service.description}</p>
        {service.measure ? <p className="mt-1 border-t border-current/20 pt-3 text-[13.5px] font-medium leading-snug opacity-90">{service.measure}</p> : null}
      </div>
    </motion.div>
  );
};

export const ServiceCarousel = ({ services, prevLabel, nextLabel }: { services: Service[]; prevLabel: string; nextLabel: string }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div className="w-full">
      <Carousel ref={ref} opts={{ align: "start", loop: true, dragFree: false }} plugins={[WheelGesturesPlugin()]} className="relative">
        <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} transition={{ staggerChildren: 0.1 }}>
          <CarouselContent className="items-stretch">
            {services.map((service, index) => (
              <CarouselItem key={index} className="basis-[86%] md:basis-1/2 lg:basis-1/3">
                <div className="h-full p-1">
                  <ServiceCard service={service} index={index} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </motion.div>
      </Carousel>
    </div>
  );
};
