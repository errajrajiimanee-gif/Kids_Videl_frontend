import { Star } from 'lucide-react';

export default function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const starIndex = index + 1;
        const isFull = starIndex <= fullStars;
        const isHalf = !isFull && hasHalf && starIndex === fullStars + 1;

        return (
          <div key={starIndex} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-gray-200" fill="currentColor" />
            {isFull ? (
              <Star className="absolute inset-0 w-4 h-4 text-amber-400" fill="currentColor" />
            ) : isHalf ? (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

