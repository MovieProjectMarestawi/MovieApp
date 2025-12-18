import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, Heart, Share2, ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { ReviewCard } from '../components/ReviewCard';
import { RatingStars } from '../components/RatingStars';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AddToGroupModal } from '../components/AddToGroupModal';
import { RemoveFromGroupModal } from '../components/RemoveFromGroupModal';
import { toast } from 'sonner';
import { moviesAPI, reviewsAPI, favoritesAPI, groupsAPI } from '../services/api';

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
  director?: string;
  cast?: string[];
}

interface Review {
  id: number;
  user_id: number;
  movie_id: number;
  rating: number;
  text: string;
  created_at: string;
  updated_at: string;
  user_email: string;
}

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [showRemoveFromGroupModal, setShowRemoveFromGroupModal] = useState(false);
  const [groupsWithMovie, setGroupsWithMovie] = useState<Array<{
    id: number;
    name: string;
    description?: string;
    member_count: number;
    is_member: boolean;
  }>>([]);
  const [isInAnyGroup, setIsInAnyGroup] = useState(false);

  // Calculate average rating from reviews
  const calculateAverageRating = () => {
    if (reviews.length === 0) {
      return null; // Return null if no reviews, will use TMDB rating
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length) * 2; // Convert 1-5 scale to 1-10 scale
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch movie details
        const movieData = await moviesAPI.getDetails(Number(id));
        setMovie(movieData);

        // Fetch reviews
        const reviewsData = await moviesAPI.getReviews(Number(id));
        setReviews(reviewsData.reviews || []);

        // Check if favorite
        if (isLoggedIn) {
          try {
            const favorites = await favoritesAPI.getAll();
            const favoriteIds = favorites.map((f: any) => f.movie_id);
            setIsFavorite(favoriteIds.includes(Number(id)));
          } catch (error) {
            // Silently fail
          }

          // Check if movie is in any group
          try {
            const groupsData = await groupsAPI.getAll(1, 1000);
            const userGroups = groupsData.groups?.filter((g: any) => g.is_member) || [];
            
            // For each group, check if movie is in it
            const groupsWithMovieList: Array<{
              id: number;
              name: string;
              description?: string;
              member_count: number;
              is_member: boolean;
            }> = [];

            for (const group of userGroups) {
              try {
                const groupDetails = await groupsAPI.getDetails(group.id);
                if (groupDetails.content) {
                  const movieIds = groupDetails.content.map((item: any) => item.movie_id);
                  if (movieIds.includes(Number(id))) {
                    groupsWithMovieList.push({
                      id: group.id,
                      name: group.name,
                      description: group.description,
                      member_count: group.member_count,
                      is_member: group.is_member,
                    });
                  }
                }
              } catch (error) {
                // Silently fail for individual group
              }
            }

            setGroupsWithMovie(groupsWithMovieList);
            setIsInAnyGroup(groupsWithMovieList.length > 0);
          } catch (error) {
            // Silently fail
            setGroupsWithMovie([]);
            setIsInAnyGroup(false);
          }
        }
      } catch (error: any) {
        console.error('Error fetching movie:', error);
        toast.error('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isLoggedIn]);

  const handleFavoriteClick = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to add favorites');
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.remove(Number(id));
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await favoritesAPI.add(Number(id));
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update favorites');
    }
  };

  const handleShareClick = async () => {
    if (navigator.share && movie) {
      try {
        await navigator.share({
          title: movie.title,
          text: movie.overview,
          url: window.location.href,
        });
      } catch (error: any) {
        // User canceled share or share failed - ignore silently
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
          // Fallback to clipboard
          try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
          } catch (clipError) {
            toast.error('Failed to share or copy link');
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }
    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!reviewText.trim()) {
      toast.error('Please enter a review text');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewsAPI.create(Number(id), userRating, reviewText);
      toast.success('Review submitted successfully!');
      setUserRating(0);
      setReviewText('');
      
        // Refresh reviews
        const reviewsData = await moviesAPI.getReviews(Number(id));
        const updatedReviews = reviewsData.reviews || [];
        setReviews(updatedReviews);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Movie not found</h2>
          <Link to="/">
            <Button className="bg-red-600 hover:bg-red-700">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getYear = (dateString: string) => {
    return dateString ? new Date(dateString).getFullYear() : 'N/A';
  };

  const getGenres = () => {
    return movie.genres?.map(g => g.name) || [];
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/">
          <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative h-[60vh] mb-8">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={movie.backdrop_path || movie.poster_path || ''}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end w-full">
            {/* Poster */}
            <div className="w-48 md:w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl">
              <ImageWithFallback
                src={movie.poster_path || ''}
                alt={movie.title}
                className="w-full"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-white text-4xl md:text-5xl mb-4">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4 text-zinc-300">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span className="text-white text-xl">
                    {(() => {
                      const avgRating = calculateAverageRating();
                      return avgRating !== null ? avgRating.toFixed(1) : movie.vote_average.toFixed(1);
                    })()}
                  </span>
                  <span className="text-zinc-400">/10</span>
                  {calculateAverageRating() !== null && (
                    <span className="text-zinc-500 text-sm ml-2">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                  )}
                </div>
                <span>{getYear(movie.release_date)}</span>
                {movie.runtime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5" />
                    <span>{movie.runtime} min</span>
                </div>
                )}
              </div>

              {getGenres().length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                  {getGenres().map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              )}

              <div className="flex gap-3 flex-wrap">
                {isLoggedIn && (
                  <>
                  <Button
                    onClick={handleFavoriteClick}
                    variant="outline"
                    className={`${
                      isFavorite
                        ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                        : 'bg-transparent border-zinc-700 text-white hover:bg-zinc-900'
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorite && 'fill-current'}`} />
                    {isFavorite ? 'Added' : 'Add to Favorites'}
                  </Button>
                    {isInAnyGroup ? (
                      <Button
                        onClick={() => setShowRemoveFromGroupModal(true)}
                        variant="outline"
                        className="bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600/30"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Remove from Group
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowAddToGroupModal(true)}
                        variant="outline"
                        className="bg-transparent border-zinc-700 text-white hover:bg-zinc-900"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Add to Group
                      </Button>
                    )}
                  </>
                )}
                <Button
                  onClick={handleShareClick}
                  variant="outline"
                  className="bg-transparent border-zinc-700 text-white hover:bg-zinc-900"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <section>
              <h2 className="text-white text-2xl mb-4">Overview</h2>
              <p className="text-zinc-300 leading-relaxed text-lg">{movie.overview || 'No overview available.'}</p>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-white text-2xl mb-6">Reviews ({reviews.length})</h2>
              
              {/* Submit Review Form */}
              {isLoggedIn && (
                <form onSubmit={handleSubmitReview} className="bg-zinc-900 rounded-lg p-6 mb-6">
                  <h3 className="text-white text-xl mb-4">Write a Review</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-zinc-300 mb-2 block">Your Rating</Label>
                      <RatingStars
                        rating={userRating}
                        size="lg"
                        interactive
                        onRatingChange={setUserRating}
                      />
                    </div>

                    <div>
                      <Label htmlFor="review" className="text-zinc-300 mb-2 block">
                        Your Review
                      </Label>
                      <Textarea
                        id="review"
                        placeholder="Share your thoughts about this movie..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[120px]"
                        required
                      />
                    </div>

                    <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={{
                      id: review.id,
                      movieId: review.movie_id,
                      username: review.user_email,
                      rating: review.rating,
                      text: review.text,
                      date: review.created_at,
                      avatar: '',
                    }} 
                  />
                ))}
                {reviews.length === 0 && (
                  <div className="text-center py-12 bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column - Details Sidebar */}
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-lg p-6 space-y-4 sticky top-24">
              <h3 className="text-white text-xl mb-4">Movie Info</h3>
              
              {movie.release_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                  <div>
                    <div className="text-zinc-400 text-sm">Release Date</div>
                    <div className="text-white">
                      {new Date(movie.release_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              )}

              {movie.runtime && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-zinc-400" />
                <div>
                  <div className="text-zinc-400 text-sm">Runtime</div>
                    <div className="text-white">{movie.runtime} minutes</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-zinc-400" />
                <div>
                  <div className="text-zinc-400 text-sm">Rating</div>
                  <div className="text-white">
                    {(() => {
                      const avgRating = calculateAverageRating();
                      return avgRating !== null ? avgRating.toFixed(1) : movie.vote_average.toFixed(1);
                    })()} / 10.0
                  </div>
                  <div className="text-zinc-500 text-xs">
                    {calculateAverageRating() !== null 
                      ? `(${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'})`
                      : `(${movie.vote_count} TMDB votes)`
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Group Modal */}
      {movie && (
        <>
          <AddToGroupModal
            open={showAddToGroupModal}
            onClose={() => {
              setShowAddToGroupModal(false);
              // Refresh groups after adding
              if (isLoggedIn && id) {
                const refreshGroups = async () => {
                  try {
                    const groupsData = await groupsAPI.getAll(1, 1000);
                    const userGroups = groupsData.groups?.filter((g: any) => g.is_member) || [];
                    const groupsWithMovieList: Array<{
                      id: number;
                      name: string;
                      description?: string;
                      member_count: number;
                      is_member: boolean;
                    }> = [];

                    for (const group of userGroups) {
                      try {
                        const groupDetails = await groupsAPI.getDetails(group.id);
                        if (groupDetails.content) {
                          const movieIds = groupDetails.content.map((item: any) => item.movie_id);
                          if (movieIds.includes(Number(id))) {
                            groupsWithMovieList.push({
                              id: group.id,
                              name: group.name,
                              description: group.description,
                              member_count: group.member_count,
                              is_member: group.is_member,
                            });
                          }
                        }
                      } catch (error) {
                        // Silently fail
                      }
                    }

                    setGroupsWithMovie(groupsWithMovieList);
                    setIsInAnyGroup(groupsWithMovieList.length > 0);
                  } catch (error) {
                    // Silently fail
                  }
                };
                refreshGroups();
              }
            }}
            movieId={movie.id}
            movieTitle={movie.title}
          />
          <RemoveFromGroupModal
            open={showRemoveFromGroupModal}
            onClose={() => {
              setShowRemoveFromGroupModal(false);
              // Refresh groups after removing
              if (isLoggedIn && id) {
                const refreshGroups = async () => {
                  try {
                    const groupsData = await groupsAPI.getAll(1, 1000);
                    const userGroups = groupsData.groups?.filter((g: any) => g.is_member) || [];
                    const groupsWithMovieList: Array<{
                      id: number;
                      name: string;
                      description?: string;
                      member_count: number;
                      is_member: boolean;
                    }> = [];

                    for (const group of userGroups) {
                      try {
                        const groupDetails = await groupsAPI.getDetails(group.id);
                        if (groupDetails.content) {
                          const movieIds = groupDetails.content.map((item: any) => item.movie_id);
                          if (movieIds.includes(Number(id))) {
                            groupsWithMovieList.push({
                              id: group.id,
                              name: group.name,
                              description: group.description,
                              member_count: group.member_count,
                              is_member: group.is_member,
                            });
                          }
                        }
                      } catch (error) {
                        // Silently fail
                      }
                    }

                    setGroupsWithMovie(groupsWithMovieList);
                    setIsInAnyGroup(groupsWithMovieList.length > 0);
                  } catch (error) {
                    // Silently fail
                  }
                };
                refreshGroups();
              }
            }}
            movieId={movie.id}
            movieTitle={movie.title}
            groupsWithMovie={groupsWithMovie}
          />
        </>
      )}
    </div>
  );
}
