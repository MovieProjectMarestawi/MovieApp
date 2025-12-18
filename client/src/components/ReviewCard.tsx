import { Review } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { RatingStars } from './RatingStars';
import { User } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="w-12 h-12 border-2 border-zinc-700">
          <AvatarImage src={review.avatar} alt={review.username} />
          <AvatarFallback className="bg-zinc-800 flex items-center justify-center">
            <User className="w-6 h-6 text-zinc-400" />
            <span className="sr-only">{review.username.slice(0, 2).toUpperCase()}</span>
          </AvatarFallback>
        </Avatar>

        {/* Review Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-white">{review.username}</h4>
              <p className="text-zinc-500 text-sm">{formatDate(review.date)}</p>
            </div>
            <RatingStars rating={review.rating} size="sm" />
          </div>

          <p className="text-zinc-300 leading-relaxed">{review.text}</p>
        </div>
      </div>
    </div>
  );
}
