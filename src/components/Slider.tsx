import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  link: string;
}

export default function Slider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  const scrollTo = (index: number) => emblaApi?.scrollTo(index);

  useEffect(() => {
    api
      .get<Slide[]>('/sliders')
      .then(res => setSlides(res.data))
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    setSelectedIndex(emblaApi.selectedScrollSnap());

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  if (slides.length === 0) return null;

  return (
    <div className="relative container mt-6">
      <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div className="relative flex-[0_0_100%] aspect-[16/10] sm:aspect-[21/9] md:aspect-[3/1]" key={slide.id}>
              <img
                src={slide.image}
                alt={slide.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent flex items-center p-6 sm:p-10 md:p-16">
                <div className="max-w-xl text-white">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/90 bg-white/10 border border-white/15 px-3 py-1 rounded-full">
                    Videl Kids
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mt-4 leading-[1.05] drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="text-base sm:text-lg md:text-2xl mt-3 text-white/90 drop-shadow-md">
                    {slide.subtitle}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <Link
                      to={slide.link || '/products'}
                      className="inline-flex items-center justify-center bg-white text-gray-900 px-6 md:px-8 py-3 rounded-full font-extrabold hover:bg-primary hover:text-white transition-all text-sm md:text-base"
                    >
                      {slide.buttonText}
                    </Link>
                    <Link
                      to="/products"
                      className="inline-flex items-center justify-center bg-white/10 text-white px-6 md:px-8 py-3 rounded-full font-bold hover:bg-white/15 transition-all text-sm md:text-base border border-white/15"
                    >
                      Tout voir
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-all"
      >
        <ArrowLeft className="w-6 h-6 text-gray-800" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-all"
      >
        <ArrowRight className="w-6 h-6 text-gray-800" />
      </button>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 md:bottom-6 flex items-center gap-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === selectedIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
