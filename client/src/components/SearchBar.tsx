import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Slider } from './ui/slider';

interface SearchFilters {
  query: string;
  genre: string;
  year: string;
  minRating: number;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    genre: 'all',
    year: 'all',
    minRating: 0
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      query: '',
      genre: 'all',
      year: 'all',
      minRating: 0
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const genres = [
    'All Genres',
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Fantasy',
    'Horror',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Thriller'
  ];

  const years = ['All Years', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

  return (
    <div className="w-full space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search for movies..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 h-12"
          />
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 h-12 px-4"
        >
          <SlidersHorizontal className="w-5 h-5 mr-2" />
          Filters
        </Button>
        <Button
          onClick={handleSearch}
          className="bg-red-600 hover:bg-red-700 h-12 px-6"
        >
          Search
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white">Advanced Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Genre Filter */}
            <div className="space-y-2">
              <Label htmlFor="genre" className="text-zinc-300">
                Genre
              </Label>
              <Select
                value={filters.genre}
                onValueChange={(value) => {
                  const newFilters = { ...filters, genre: value };
                  setFilters(newFilters);
                  onSearch(newFilters);
                }}
              >
                <SelectTrigger
                  id="genre"
                  className="bg-zinc-800 border-zinc-700 text-white"
                >
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {genres.map((genre) => (
                    <SelectItem
                      key={genre}
                      value={genre.toLowerCase().replace(' ', '-')}
                      className="text-white focus:bg-zinc-700 focus:text-white"
                    >
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div className="space-y-2">
              <Label htmlFor="year" className="text-zinc-300">
                Release Year
              </Label>
              <Select
                value={filters.year}
                onValueChange={(value) => {
                  const newFilters = { ...filters, year: value };
                  setFilters(newFilters);
                  onSearch(newFilters);
                }}
              >
                <SelectTrigger
                  id="year"
                  className="bg-zinc-800 border-zinc-700 text-white"
                >
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {years.map((year) => (
                    <SelectItem
                      key={year}
                      value={year.toLowerCase().replace(' ', '-')}
                      className="text-white focus:bg-zinc-700 focus:text-white"
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">Minimum Rating</Label>
              <span className="text-white">{filters.minRating.toFixed(1)} / 10.0</span>
            </div>
            <Slider
              value={[filters.minRating]}
              onValueChange={(value) => {
                const newFilters = { ...filters, minRating: value[0] };
                setFilters(newFilters);
                onSearch(newFilters);
              }}
              max={10}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
