import { Movie, Review, Group } from '../types';

export const mockMovies: Movie[] = [
  {
    id: 1,
    title: 'Quantum Nexus',
    posterUrl: 'https://images.unsplash.com/photo-1761948245703-cbf27a3e7502?w=400&h=600&fit=crop',
    rating: 4.5,
    year: 2024,
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    duration: 148,
    description: 'In a world where quantum computing has unlocked parallel dimensions, a group of scientists must prevent a catastrophic merge of realities. As they race against time, they discover that their actions in one dimension affect all others.',
    director: 'Sofia Chen',
    cast: ['James Morrison', 'Emma Watson', 'Idris Elba'],
    inCinemas: true,
    releaseDate: '2024-11-15'
  },
  {
    id: 2,
    title: 'The Last Symphony',
    posterUrl: 'https://images.unsplash.com/photo-1762356121454-877acbd554bb?w=400&h=600&fit=crop',
    rating: 4.2,
    year: 2024,
    genre: ['Drama', 'Music', 'Biography'],
    duration: 132,
    description: 'The story of a renowned composer facing hearing loss who must complete his final masterpiece. A deeply emotional journey about art, legacy, and the power of music to transcend physical limitations.',
    director: 'Marcus Williams',
    cast: ['Benedict Cumberbatch', 'Viola Davis', 'Oscar Isaac'],
    inCinemas: true,
    releaseDate: '2024-10-28'
  },
  {
    id: 3,
    title: 'Shadows of Helsinki',
    posterUrl: 'https://images.unsplash.com/photo-1642979904635-33d2e73b1d01?w=400&h=600&fit=crop',
    rating: 3.8,
    year: 2024,
    genre: ['Thriller', 'Mystery', 'Nordic Noir'],
    duration: 118,
    description: 'A detective investigating a series of mysterious disappearances in Helsinki uncovers a conspiracy that reaches the highest levels of government. Set during the dark Finnish winter, this Nordic noir keeps you guessing until the end.',
    director: 'Antti Virtanen',
    cast: ['Laura Birn', 'Pilou Asbæk', 'Krista Kosonen'],
    inCinemas: true,
    releaseDate: '2024-11-08'
  },
  {
    id: 4,
    title: 'Cosmic Jest',
    posterUrl: 'https://images.unsplash.com/photo-1587042285747-583b4d4d73b7?w=400&h=600&fit=crop',
    rating: 4.0,
    year: 2024,
    genre: ['Comedy', 'Sci-Fi', 'Adventure'],
    duration: 105,
    description: 'When an alien spacecraft crashes at a comedy club, a struggling comedian discovers that laughter is the universal language—and the key to saving Earth from an intergalactic war.',
    director: 'Rachel Green',
    cast: ['Chris Pratt', 'Awkwafina', 'John Boyega'],
    inCinemas: false,
    releaseDate: '2024-09-20'
  },
  {
    id: 5,
    title: 'Midnight Protocol',
    posterUrl: 'https://images.unsplash.com/photo-1762356121454-877acbd554bb?w=400&h=600&fit=crop',
    rating: 4.6,
    year: 2024,
    genre: ['Action', 'Thriller', 'Cyberpunk'],
    duration: 142,
    description: 'An elite hacker is forced out of retirement when a sophisticated AI begins manipulating global financial systems. In a race against time, she must navigate both the digital and physical worlds to stop a cyber apocalypse.',
    director: 'David Park',
    cast: ['Charlize Theron', 'Dev Patel', 'Tilda Swinton'],
    inCinemas: true,
    releaseDate: '2024-11-01'
  },
  {
    id: 6,
    title: 'The Aurora Project',
    posterUrl: 'https://images.unsplash.com/photo-1761948245703-cbf27a3e7502?w=400&h=600&fit=crop',
    rating: 3.9,
    year: 2024,
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    duration: 155,
    description: 'Humanity\'s first mission to terraform Mars faces unexpected challenges when the crew discovers evidence of ancient life. This epic space drama explores themes of discovery, sacrifice, and what it means to be human.',
    director: 'Christopher Nolan',
    cast: ['Jessica Chastain', 'Matthew McConaughey', 'Lupita Nyong\'o'],
    inCinemas: false,
    releaseDate: '2024-08-15'
  },
  {
    id: 7,
    title: 'Whispers in the Pines',
    posterUrl: 'https://images.unsplash.com/photo-1642979904635-33d2e73b1d01?w=400&h=600&fit=crop',
    rating: 4.3,
    year: 2024,
    genre: ['Horror', 'Mystery', 'Supernatural'],
    duration: 112,
    description: 'A family\'s weekend getaway to a remote Finnish cabin turns into a nightmare when they realize they\'re not alone in the forest. Ancient secrets and modern horror collide in this chilling tale.',
    director: 'Jalmari Helander',
    cast: ['Mads Mikkelsen', 'Laura Birn', 'Peter Franzén'],
    inCinemas: true,
    releaseDate: '2024-10-31'
  },
  {
    id: 8,
    title: 'Velocity',
    posterUrl: 'https://images.unsplash.com/photo-1762356121454-877acbd554bb?w=400&h=600&fit=crop',
    rating: 3.7,
    year: 2024,
    genre: ['Action', 'Racing', 'Drama'],
    duration: 125,
    description: 'A former race car driver returns to the track one last time to save his family\'s legacy. High-octane action combines with emotional depth in this adrenaline-fueled story of redemption.',
    director: 'Justin Lin',
    cast: ['Tom Hardy', 'Zendaya', 'Daniel Brühl'],
    inCinemas: false,
    releaseDate: '2024-07-12'
  },
  {
    id: 9,
    title: 'Silent Waters',
    posterUrl: 'https://images.unsplash.com/photo-1762356121454-877acbd554bb?w=400&h=600&fit=crop',
    rating: 4.4,
    year: 2023,
    genre: ['Drama', 'Mystery', 'Thriller'],
    duration: 136,
    description: 'In a small coastal town in Finland, a journalist investigating environmental crimes discovers a web of corruption that threatens to destroy the community she once called home.',
    director: 'Klaus Härö',
    cast: ['Alicia Vikander', 'Sverrir Gudnason', 'Krista Kosonen'],
    inCinemas: false,
    releaseDate: '2023-11-10'
  },
  {
    id: 10,
    title: 'Neon Dreams',
    posterUrl: 'https://images.unsplash.com/photo-1761948245703-cbf27a3e7502?w=400&h=600&fit=crop',
    rating: 4.1,
    year: 2024,
    genre: ['Sci-Fi', 'Romance', 'Cyberpunk'],
    duration: 128,
    description: 'In a dystopian future Tokyo, an android begins to experience human emotions after a glitch in her programming. A visually stunning exploration of consciousness, identity, and love.',
    director: 'Makoto Shinkai',
    cast: ['Rinko Kikuchi', 'John Cho', 'Sonoya Mizuno'],
    inCinemas: false,
    releaseDate: '2024-06-21'
  },
  {
    id: 11,
    title: 'The Inheritance',
    posterUrl: 'https://images.unsplash.com/photo-1762356121454-877acbd554bb?w=400&h=600&fit=crop',
    rating: 3.6,
    year: 2024,
    genre: ['Drama', 'Family', 'Mystery'],
    duration: 115,
    description: 'When a wealthy patriarch dies, his estranged children gather for the reading of the will, only to discover that their inheritance comes with dark family secrets and impossible conditions.',
    director: 'Mike Leigh',
    cast: ['Emily Blunt', 'Ralph Fiennes', 'Saoirse Ronan'],
    inCinemas: false,
    releaseDate: '2024-05-03'
  },
  {
    id: 12,
    title: 'Frost Giants',
    posterUrl: 'https://images.unsplash.com/photo-1762356121454-877acbd554bb?w=400&h=600&fit=crop',
    rating: 3.9,
    year: 2024,
    genre: ['Fantasy', 'Adventure', 'Action'],
    duration: 160,
    description: 'Based on Finnish mythology, warriors must journey to the frozen north to battle ancient frost giants threatening to bring eternal winter. Epic battles and Norse-inspired fantasy combine in this visual spectacle.',
    director: 'Dome Karukoski',
    cast: ['Chris Hemsworth', 'Tessa Thompson', 'Laura Birn'],
    inCinemas: true,
    releaseDate: '2024-11-22'
  }
];

export const mockReviews: Review[] = [
  {
    id: 1,
    movieId: 1,
    username: 'CinemaLover99',
    rating: 5,
    text: 'Absolutely mind-bending! The visual effects are stunning and the plot keeps you guessing until the very end. A must-see for any sci-fi fan.',
    date: '2024-11-08',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop'
  },
  {
    id: 2,
    movieId: 1,
    username: 'SciFiEnthusiast',
    rating: 4,
    text: 'Great concept and execution. The quantum mechanics could have been explained better, but overall an excellent thriller that makes you think.',
    date: '2024-11-07',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop'
  },
  {
    id: 3,
    movieId: 1,
    username: 'MovieCritic2024',
    rating: 4,
    text: 'Solid performances from the entire cast. The parallel dimension scenes are beautifully crafted. Minor pacing issues in the second act, but it picks up nicely.',
    date: '2024-11-06',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=50&h=50&fit=crop'
  },
  {
    id: 4,
    movieId: 2,
    username: 'DramaFan',
    rating: 5,
    text: 'A masterpiece! The emotional depth and musical score are breathtaking. One of the best dramas of the year.',
    date: '2024-11-05',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop'
  },
  {
    id: 5,
    movieId: 3,
    username: 'NordicNoirFan',
    rating: 4,
    text: 'Excellent Finnish thriller with great atmosphere. The Helsinki winter setting adds so much to the mood. Highly recommend!',
    date: '2024-11-09',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop'
  }
];

export const mockGroups: Group[] = [
  {
    id: 1,
    name: 'Helsinki Film Club',
    description: 'A community for movie lovers in Helsinki. We discuss new releases, organize cinema meetups, and share recommendations. All film genres welcome!',
    owner: 'MovieMaster',
    ownerId: 100,
    members: 234,
    imageUrl: 'https://images.unsplash.com/photo-1739433437912-cca661ba902f?w=400&h=300&fit=crop',
    isPublic: true,
    membersList: ['MovieMaster', 'CinemaLover99', 'FilmBuff2024', 'MovieFan2024']
  },
  {
    id: 2,
    name: 'Sci-Fi Enthusiasts',
    description: 'Dedicated to science fiction cinema. From classic space operas to modern cyberpunk, we love it all. Join us for weekly watch parties and discussions!',
    owner: 'SciFiGuru',
    ownerId: 101,
    members: 456,
    imageUrl: 'https://images.unsplash.com/photo-1619850015546-84a1c7b7aed0?w=400&h=300&fit=crop',
    isPublic: true,
    membersList: ['SciFiGuru', 'StarWatcher', 'CosmicDreamer', 'MovieFan2024']
  },
  {
    id: 3,
    name: 'Horror Movie Addicts',
    description: 'For those who love the thrill and chill of horror films. We explore everything from psychological horror to slasher classics. Not for the faint of heart!',
    owner: 'NightmareKing',
    ownerId: 102,
    members: 189,
    imageUrl: 'https://images.unsplash.com/photo-1642979904635-33d2e73b1d01?w=400&h=300&fit=crop',
    isPublic: true,
    membersList: ['NightmareKing', 'ScreamQueen', 'DarkCinema']
  },
  {
    id: 4,
    name: 'Nordic Cinema Collective',
    description: 'Celebrating films from Finland, Sweden, Norway, Denmark, and Iceland. We discuss Nordic noir, drama, and the unique storytelling of Scandinavian cinema.',
    owner: 'NordicViewer',
    ownerId: 103,
    members: 167,
    imageUrl: 'https://images.unsplash.com/photo-1739433437912-cca661ba902f?w=400&h=300&fit=crop',
    isPublic: true,
    membersList: ['NordicViewer', 'FinnishFilmFan', 'SwedishCinema']
  },
  {
    id: 5,
    name: 'Classic Film Society',
    description: 'A group dedicated to preserving and discussing classic cinema from the golden age of Hollywood to international masterpieces. Monthly themed viewings.',
    owner: 'ClassicCinephile',
    ownerId: 104,
    members: 312,
    imageUrl: 'https://images.unsplash.com/photo-1739433437912-cca661ba902f?w=400&h=300&fit=crop',
    isPublic: true,
    membersList: ['ClassicCinephile', 'GoldenAgeFilm', 'VintageViewer']
  },
  {
    id: 6,
    name: 'Action Movie Marathon',
    description: 'High-octane action, explosive stunts, and epic fight scenes. This group is for adrenaline junkies who love their movies fast-paced and exciting.',
    owner: 'ActionHero',
    ownerId: 105,
    members: 523,
    imageUrl: 'https://images.unsplash.com/photo-1762356121454-877acbd554bb?w=400&h=300&fit=crop',
    isPublic: true,
    membersList: ['ActionHero', 'StuntLover', 'ExplosionFan']
  },
  {
    id: 7,
    name: 'Indie Film Explorers',
    description: 'Discovering hidden gems and independent films from around the world. We support small filmmakers and appreciate unique storytelling.',
    owner: 'IndieSupporter',
    ownerId: 106,
    members: 278,
    imageUrl: 'https://images.unsplash.com/photo-1739433437912-cca661ba902f?w=400&h=300&fit=crop',
    isPublic: false,
    membersList: ['IndieSupporter', 'ArtHouseViewer']
  },
  {
    id: 8,
    name: 'Animation Appreciation',
    description: 'From Studio Ghibli to Pixar, from anime to stop-motion. A group for those who believe animation is not just for kids but a serious art form.',
    owner: 'AnimationFan',
    ownerId: 107,
    members: 445,
    imageUrl: 'https://images.unsplash.com/photo-1739433437912-cca661ba902f?w=400&h=300&fit=crop',
    isPublic: true,
    membersList: ['AnimationFan', 'GhibliLover', 'PixarEnthusiast']
  }
];
