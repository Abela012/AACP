import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  onRatingChange,
  readonly = false,
  size = 24,
  className
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={cn("flex gap-1", className)}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hoverRating || rating);
        
        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            className={cn(
              "transition-all transform",
              !readonly && "hover:scale-110 active:scale-95",
              readonly ? "cursor-default" : "cursor-pointer"
            )}
            onClick={() => onRatingChange?.(starValue)}
            onMouseEnter={() => !readonly && setHoverRating(starValue)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                isActive 
                  ? "fill-amber-400 text-amber-400" 
                  : "fill-gray-200 text-gray-200 dark:fill-white/10 dark:text-white/10"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
