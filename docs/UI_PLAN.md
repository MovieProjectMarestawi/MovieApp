# UI Plan - Movie4you Application

This document describes the user interface design and structure of the Movie4you application.

## Design System

### Color Scheme
- Primary Background: Black (#000000)
- Secondary Background: Zinc-900 (#18181b)
- Tertiary Background: Zinc-800 (#27272a)
- Primary Accent: Red-600 (#dc2626)
- Text Primary: White (#ffffff)
- Text Secondary: Zinc-300 (#d4d4d8)
- Text Tertiary: Zinc-400 (#a1a1aa)
- Border: Zinc-800 (#27272a)

### Typography
- Headings: Large, bold, white text
- Body: Regular, zinc-300/zinc-400
- Small text: Zinc-500, smaller font size

### Theme
- Dark theme throughout
- High contrast for readability
- Red accent color for primary actions

## Layout Structure

### Global Layout
```
┌─────────────────────────────────────┐
│           Navbar (Fixed)            │
├─────────────────────────────────────┤
│                                     │
│         Main Content Area           │
│      (Page-specific content)       │
│                                     │
├─────────────────────────────────────┤
│           Footer (Fixed)            │
└─────────────────────────────────────┘
```

### Responsive Breakpoints
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md)
- Desktop: > 1024px (lg)

## Pages and Their Structure

### 1. HomePage (/)
Layout:
```
┌─────────────────────────────────────┐
│      Hero Section (Full Width)     │
│   - Featured Movie (Auto-rotate)     │
│   - Movie Info & CTA Buttons        │
│   - Navigation Indicators           │
├─────────────────────────────────────┤
│      Trending Movies Section        │
│   - Grid: 2 cols (mobile)           │
│         6 cols (desktop)             │
├─────────────────────────────────────┤
│      Now in Cinemas Section         │
│   - Grid: 2 cols (mobile)           │
│         4 cols (desktop)             │
├─────────────────────────────────────┤
│      CTA Section (Gradient)         │
│   - Get Started / Discover Movies   │
│   - Browse Groups                    │
└─────────────────────────────────────┘
```

Components:
- Hero Section with auto-rotating movies
- MovieCard components (grid layout)
- CTA buttons

### 2. LoginPage (/login)
Layout:
```
┌─────────────────────────────────────┐
│         Centered Card Layout         │
│                                     │
│   ┌─────────────────────────┐      │
│   │   Movie4you Logo        │      │
│   │                         │      │
│   │   Welcome Back          │      │
│   │   Email Input           │      │
│   │   Password Input        │      │
│   │   Login Button          │      │
│   │   Register Link          │      │
│   └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

Components:
- Card component
- Input fields
- Button
- Error message display

### 3. RegisterPage (/register)
Layout:
Similar to LoginPage but with:
- Email input
- Password input
- Confirm Password input
- Register button
- Login link

### 4. MovieSearchPage (/search)
Layout:
```
┌─────────────────────────────────────┐
│      Page Header                    │
│   - Title: "Discover Movies"        │
│   - Description                     │
├─────────────────────────────────────┤
│      SearchBar Component            │
│   - Search input                    │
│   - Genre filter                    │
│   - Year filter                     │
│   - Rating filter                   │
├─────────────────────────────────────┤
│      Results Info                   │
│   - Total results count             │
│   - Clear Filters button            │
├─────────────────────────────────────┤
│      Movies Grid                    │
│   - Grid: 2 cols (mobile)           │
│         5 cols (desktop)             │
│   - MovieCard components            │
├─────────────────────────────────────┤
│      Pagination                     │
│   - Previous/Next buttons           │
│   - Page numbers                    │
└─────────────────────────────────────┘
```

Components:
- SearchBar (with filters)
- MovieCard (with hover effects)
- Pagination controls

### 5. MovieDetailPage (/movie/:id)
Layout:
```
┌─────────────────────────────────────┐
│      Backdrop Image (Full Width)    │
│   - Movie backdrop with overlay     │
├─────────────────────────────────────┤
│   ┌──────────┬──────────────────┐  │
│   │          │                  │  │
│   │ Poster   │  Movie Title     │  │
│   │ Image    │  Rating/Genres  │  │
│   │          │  Action Buttons │  │
│   └──────────┴──────────────────┘  │
├─────────────────────────────────────┤
│   ┌──────────────────┬──────────┐  │
│   │                  │          │  │
│   │ Overview         │  Movie   │  │
│   │                  │  Info    │  │
│   │ Reviews Section  │  Sidebar │  │
│   │ - Review Form    │          │  │
│   │ - Reviews List   │          │  │
│   │                  │          │  │
│   └──────────────────┴──────────┘  │
└─────────────────────────────────────┘
```

Components:
- ImageWithFallback (poster/backdrop)
- RatingStars
- ReviewCard
- Review form
- Action buttons (Favorite, Add to Group, Share)

### 6. NowInCinemasPage (/now-in-cinemas)
Layout:
```
┌─────────────────────────────────────┐
│      Page Header                    │
│   - Title: "Now in Cinemas"         │
│   - Description                     │
├─────────────────────────────────────┤
│      Movies Grid                    │
│   - Grid: 2 cols (mobile)           │
│         4 cols (desktop)             │
│   - MovieCard components            │
├─────────────────────────────────────┤
│      Pagination                     │
└─────────────────────────────────────┘
```

### 7. GroupsListPage (/groups)
Layout:
```
┌─────────────────────────────────────┐
│      Page Header                    │
│   - Title: "Movie Groups"           │
│   - Create Group Button             │
├─────────────────────────────────────┤
│      Search Bar                     │
│   - Search groups by name/desc      │
├─────────────────────────────────────┤
│      Stats Cards (4 columns)        │
│   - Public Groups count             │
│   - Total Members                   │
│   - Avg Members/Group               │
│   - Community Status                │
├─────────────────────────────────────┤
│      Groups Grid                    │
│   - Grid: 1 col (mobile)            │
│         3 cols (desktop)             │
│   - GroupCard components            │
├─────────────────────────────────────┤
│      CTA Section                    │
│   - Create Group CTA                │
└─────────────────────────────────────┘
```

Components:
- GroupCard (with image, name, description, member count)
- Search input
- Stats cards

### 8. GroupDetailPage (/groups/:id)
Layout:
```
┌─────────────────────────────────────┐
│      Group Header                   │
│   - Back button                     │
│   - Group Image/Icon                │
│   - Group Name & Description        │
│   - Owner Info                      │
│   - Member Count                    │
│   - Action Buttons                  │
├─────────────────────────────────────┤
│   ┌──────────────────┬──────────┐  │
│   │                  │          │  │
│   │ Tab Menu         │  Group   │  │
│   │ - Movies         │  Stats   │  │
│   │ - Members        │  Sidebar │  │
│   │ - Join Requests  │          │  │
│   │                  │          │  │
│   │ Tab Content:     │          │  │
│   │ - Movies Grid    │          │  │
│   │ - Members List   │          │  │
│   │ - Requests List  │          │  │
│   │                  │          │  │
│   └──────────────────┴──────────┘  │
└─────────────────────────────────────┘
```

Components:
- Tabs (Movies, Members, Join Requests)
- MovieCard (with remove button for owner)
- Member list with avatars
- Join request management (approve/reject)

### 9. ProfilePage (/profile)
Layout:
```
┌─────────────────────────────────────┐
│      Profile Header                 │
│   - Avatar                          │
│   - User Email                      │
│   - Member Since                    │
│   - Edit Profile Button             │
├─────────────────────────────────────┤
│      Stats Cards (4 columns)        │
│   - Favorite Movies                │
│   - Groups Joined                  │
│   - Reviews Written                │
│   - Movies Watched                 │
├─────────────────────────────────────┤
│      My Groups Section              │
│   - Groups Grid                    │
├─────────────────────────────────────┤
│      My Favorites Section           │
│   - Movies Grid                    │
├─────────────────────────────────────┤
│      My Reviews Section             │
│   - Reviews count/info              │
└─────────────────────────────────────┘
```

Components:
- Avatar component
- Stats cards
- GroupCard
- MovieCard

### 10. SettingsPage (/settings)
Layout:
```
┌─────────────────────────────────────┐
│      Page Title                     │
├─────────────────────────────────────┤
│      Update Profile Card            │
│   - Email input                     │
│   - Save button                     │
├─────────────────────────────────────┤
│      Change Password Card           │
│   - Current password                │
│   - New password                    │
│   - Confirm password                │
│   - Update button                   │
├─────────────────────────────────────┤
│      Delete Account Card            │
│   - Warning message                 │
│   - Delete button                   │
│   - Confirmation dialog             │
└─────────────────────────────────────┘
```

Components:
- Card components
- Input fields with validation
- AlertDialog for delete confirmation

### 11. FavoritesPage (/favorites)
Layout:
```
┌─────────────────────────────────────┐
│      Page Header                    │
│   - Title: "My Favorites"           │
│   - Share button (if logged in)      │
├─────────────────────────────────────┤
│      Movies Grid                    │
│   - Grid: 2 cols (mobile)           │
│         5 cols (desktop)             │
│   - MovieCard components            │
│   - Empty state if no favorites     │
└─────────────────────────────────────┘
```

### 12. NotFoundPage (404)
Layout:
```
┌─────────────────────────────────────┐
│         Centered Layout             │
│                                     │
│   - 404 Illustration                │
│   - Error Message                   │
│   - Action Buttons                  │
│     (Home, Search Movies)           │
│                                     │
└─────────────────────────────────────┘
```

## Reusable Components

### Navigation Components
1. Navbar
   - Logo (Movie4you)
   - Navigation links
   - Search icon
   - Notification icon (if logged in)
   - User avatar dropdown (if logged in)
   - Login/Register buttons (if not logged in)

2. Footer
   - Links to main pages
   - Social media links (if any)
   - Copyright info

### UI Components
1. MovieCard
   - Poster image
   - Movie title
   - Rating (stars)
   - Year
   - Genres (tags)
   - Hover effects:
     - Duration
     - View Details button
     - Add to Group button (if logged in)
     - Favorite button (if logged in)

2. GroupCard
   - Group image (movie poster or SVG icon)
   - Group name
   - Description
   - Member count
   - Movie count
   - Join/View button

3. ReviewCard
   - User avatar (or SVG icon)
   - Username (email)
   - Rating (stars)
   - Review text
   - Date

4. SearchBar
   - Search input
   - Genre dropdown
   - Year dropdown
   - Rating slider
   - Search button

5. RatingStars
   - Interactive (for reviews)
   - Display only (for ratings)
   - 1-5 star rating

### Modal Components
1. CreateGroupModal
   - Group name input
   - Description textarea
   - Create/Cancel buttons

2. EditGroupModal
   - Pre-filled name/description
   - Update/Cancel buttons

3. AddToGroupModal
   - List of user's groups
   - Add to selected group

4. RemoveFromGroupModal
   - List of groups containing movie
   - Remove from selected group

5. JoinGroupModal
   - Group info
   - Optional message
   - Join/Cancel buttons

### Form Components
1. Input
   - Text inputs
   - Password inputs
   - Email inputs

2. Textarea
   - Multi-line text input

3. Button
   - Primary (red)
   - Secondary (outline)
   - Ghost (transparent)

4. Card
   - Container for content sections

## User Flow Diagrams

### Authentication Flow
```
HomePage
  ├─> Login (if not logged in)
  │     └─> HomePage (after login)
  │
  └─> Register (if not logged in)
        └─> HomePage (after registration)
```

### Movie Discovery Flow
```
HomePage
  └─> MovieSearchPage
        └─> MovieDetailPage
              ├─> Add to Favorites
              ├─> Add to Group
              └─> Write Review
```

### Group Management Flow
```
GroupsListPage
  ├─> Create Group
  │     └─> GroupDetailPage
  │
  └─> GroupDetailPage
        ├─> Join Request
        ├─> Add Movies (owner)
        ├─> Manage Members (owner)
        └─> Leave Group
```

## Responsive Design

### Mobile (< 640px)
- Single column layouts
- Stacked navigation
- Smaller text sizes
- Touch-friendly buttons
- Collapsible menus

### Tablet (640px - 1024px)
- 2-3 column grids
- Side-by-side navigation
- Medium text sizes

### Desktop (> 1024px)
- Multi-column grids (up to 6 columns)
- Full navigation bar
- Larger text sizes
- Hover effects
- Sidebar layouts

## Accessibility Features

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- High contrast colors
- Alt text for images

## Animation and Transitions

- Smooth page transitions
- Hover effects on cards
- Loading states
- Toast notifications
- Modal animations
- Hero section auto-rotation (8 seconds)

## Component Hierarchy

```
App
├── AuthProvider
│   └── Router
│       ├── LayoutWithNavbar
│       │   ├── Navbar
│       │   │   ├── Logo
│       │   │   ├── Navigation Links
│       │   │   ├── NotificationDropdown
│       │   │   └── ProfileDropdown
│       │   ├── Routes (Pages)
│       │   └── Footer
│       └── Auth Routes (Login/Register)
└── Toaster (Notifications)
```

## Design Principles

1. Dark Theme: Consistent black/zinc color scheme
2. Red Accent: Primary actions use red-600
3. Card-based Layout: Content organized in cards
4. Grid System: Responsive grid for lists
5. Spacing: Consistent padding and margins
6. Typography: Clear hierarchy with sizes
7. Icons: Lucide React icons throughout
8. Images: Fallback to SVG icons when missing

## File Structure

```
client/src/
├── pages/           # All page components
├── components/      # Reusable components
│   ├── ui/         # Base UI components (Radix UI)
│   └── ...         # Feature components
├── context/         # React context (Auth)
├── services/       # API services
└── types/          # TypeScript types
```

## Notes

- All pages use consistent spacing (p-4, p-6, p-8)
- Max width containers (max-w-7xl) for content
- Sticky positioning for sidebars
- Z-index management for modals/dropdowns
- Loading states on all async operations
- Empty states with helpful messages

