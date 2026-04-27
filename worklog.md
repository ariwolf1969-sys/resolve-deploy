# Resolvé - Worklog

## Build Summary (Rebuild from scratch)

### Prisma Schema
- **File**: `prisma/schema.prisma`
- Models: User, Need, Response, ChatThread, ChatThreadParticipant, Message, Rating, AffiliateProduct, AffiliateClick, Quote, Transaction, CheckIn, Dispute
- SQLite database at `db/custom.db`
- User model includes all professional fields (skills, experience, education, certifications, hourlyRate, etc.)

### Zustand Store
- **File**: `src/store/app-store.ts`
- SPA-like navigation with `currentView` state
- Persistent auth state (token + user)
- View history for back navigation
- All 16+ view types defined

### API Routes
All routes are real API calls (NO demo mode):
1. `POST /api/auth/register` - User registration with +54 phone formatting
2. `POST /api/auth/login` - Login by email or phone
3. `GET /api/auth/me` - Token validation
4. `GET /api/users` - List users with filters
5. `GET/PUT /api/users/[id]` - Get/update user
6. `GET /api/professionals` - List professionals with filters
7. `POST/GET /api/needs` - Create/list needs
8. `GET /api/needs/[id]` - Get need with responses
9. `POST/GET /api/quotes` - Create/list quotes
10. `GET/PUT /api/quotes/[id]` - Get/update quote status
11. `POST/GET /api/transactions` - Create/list transactions
12. `GET /api/products/real` - List affiliate products
13. `POST/GET /api/chat` - List/create chat threads
14. `GET/POST /api/chat/[threadId]/messages` - Get/send messages
15. `POST /api/seed` - Seed database with sample data

### Screen Components (src/components/app/)

1. **app-container.tsx** - Main SPA router with token validation
2. **splash-screen.tsx** - Login/Register with FIXED phone input
3. **home-screen.tsx** - Main page with professions, carousels, top pros
4. **profile-screen.tsx** - User profile with menu items
5. **edit-profile-screen.tsx** - Edit profile with FIXED phone input
6. **pro-profile-screen.tsx** - Professional profile with quote request
7. **register-pro-screen.tsx** - 5-step professional registration wizard
8. **products-screen.tsx** - Product marketplace with filters
9. **quotes-screen.tsx** - Quote/budget list (sent/received tabs)
10. **create-quote-screen.tsx** - New quote request with professional search
11. **quote-detail-screen.tsx** - Quote detail with status management
12. **payments-screen.tsx** - Transaction history with summary cards
13. **chat-list-screen.tsx** - Chat thread list
14. **chat-screen.tsx** - Real-time chat messaging
15. **search-overlay.tsx** - Professional search with profession filters

### Critical Fix: Phone Input
- Fixed "+54" prefix label is OUTSIDE the input field
- User types only local number digits (8-11 digits)
- Input type="tel" with inputMode="numeric"
- No auto-formatting during typing
- On submit, "+54" is prepended to get full international format
- Applied in: splash-screen (register & login), edit-profile

### Color Scheme
- All primary colors use BLUE (blue-600, blue-700, blue-500, etc.)
- Green badges for hourly rates
- Red buttons for logout/errors
- No orange anywhere in the codebase

### Home Page Features
- "Iniciar sesión" button visible when not logged in
- Horizontally scrollable professions section with all 10 categories
- "Ofertas del día" product carousel (featured)
- "Populares" product carousel (popular)
- Top 5 professionals list
- Quick action cards when logged in
- Professional registration CTA for regular users
- Bottom navigation bar

### Seed Data
- 10 professional users across all categories
- 6 affiliate products
- 3 sample quotes
- All with realistic Argentine data
