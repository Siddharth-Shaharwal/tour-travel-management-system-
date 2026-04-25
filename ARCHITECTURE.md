# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     TRAVEL MANAGEMENT SYSTEM                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                       │
│                   http://localhost:5173                         │
├─────────────────────────────────────────────────────────────────┤
│  Pages:                                                         │
│  • Home.jsx - Landing page with CTA                           │
│  • Login.jsx - Authentication                                 │
│  • Register.jsx - User signup                                 │
│  • Packages.jsx - Browse & book packages                      │
│  • MyBookings.jsx - View personal bookings                    │
│  • AdminPanel.jsx - Approve/reject bookings                   │
│                                                                │
│  Components:                                                   │
│  • Navbar - Navigation & user menu                            │
│  • Footer - Site footer                                       │
│  • Card - Reusable package card                               │
└─────────────────────────────────────────────────────────────────┘
                            ↕ (JWT Token)
                      HTTPS/CORS
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Node.js)                        │
│                  http://localhost:4000/api                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  Routes:                                                       │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ /api/auth          - Login, Register, Profile        │   │
│  │ /api/packages      - List, Create, Update, Delete    │   │
│  │ /api/bookings      - User booking operations         │   │
│  │ /api/admin         - Admin approval workflows        │   │
│  │ /api/vehicles      - Vehicle information            │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                                │
│  Controllers:                                                  │
│  • authController - User auth logic                           │
│  • bookingController - Booking creation & management          │
│  • adminController - Admin approval operations               │
│  • packageController - Package CRUD                           │
│                                                                │
│  Middleware:                                                   │
│  • authenticateToken - JWT verification                      │
│  • authorizeAdmin - Admin role check                         │
│  • helmet - Security headers                                 │
│  • rateLimit - Request throttling                            │
│  • CORS - Cross-origin requests                              │
│                                                                │
│  Models:                                                       │
│  • User - User account management                            │
│  • Booking - Booking lifecycle                               │
│  • Package - Package catalog                                 │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
                            ↕ (SQL)
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MySQL)                           │
│                 travel_management schema                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                │
│  Tables:                                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ • users                                             │    │
│  │ • packages                                          │    │
│  │ • vehicles                                          │    │
│  │ • vehicle_types                                     │    │
│  │ • drivers                                           │    │
│  │ • bookings                                          │    │
│  │ • transactions                                      │    │
│  │ • booking_logs                                      │    │
│  │ • admin_verifications                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                                │
│  Advanced Features:                                            │
│  • Triggers (auto-driver assignment, validation)              │
│  • Views (booking_details with JOINs)                         │
│  • Stored Procedures (vehicle availability)                   │
│  • Indexes (optimized queries)                                │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### User Registration Flow
```
User enters form
    ↓
Frontend validates input
    ↓
POST /api/auth/register
    ↓
Backend: authController.register()
    ↓
Hash password with bcrypt
    ↓
INSERT into users table
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Frontend stores token in localStorage
    ↓
Redirect to packages page
```

### Booking Flow
```
User clicks "Book Now"
    ↓
Frontend checks for token
    ↓
Show booking modal form
    ↓
User fills dates/passengers
    ↓
POST /api/bookings
    ↓
Backend: bookingController.createBooking()
    ↓
Validate package exists
    ↓
Calculate total price
    ↓
INSERT into bookings (status = 'pending')
    ↓
TRIGGER: trg_after_booking_insert
    ├─ CREATE admin_verification record
    ├─ CREATE booking_log entry
    └─ Try to assign available driver
    ↓
Return booking_id
    ↓
Frontend: redirect to /my-bookings
    ↓
User sees booking with status = PENDING
```

### Admin Approval Flow
```
Admin clicks "Admin Panel"
    ↓
GET /api/admin/bookings/pending
    ↓
Backend: adminController.getPendingBookings()
    ↓
SELECT from bookings where status='pending'
    ↓
JOIN with users, packages, drivers
    ↓
Return formatted bookings list
    ↓
Frontend renders booking cards
    ↓
Admin clicks "Approve"
    ↓
PUT /api/admin/bookings/:id/approve
    ↓
Backend: adminController.approveBooking()
    ↓
UPDATE bookings SET status='confirmed'
    ↓
UPDATE admin_verifications SET verified=true
    ↓
TRIGGER: trg_after_booking_update (if cancelled)
    └─ Release vehicle & driver
    ↓
Frontend: refresh list, booking now shows CONFIRMED
    ↓
Regular user sees booking CONFIRMED on /my-bookings
```

## Database Schema Diagram

```
┌──────────────────┐
│     users        │
├──────────────────┤
│ id (PK)          │
│ name             │
│ email (UNIQUE)   │
│ phone            │
│ password_hash    │
│ is_admin         │
│ is_active        │
└──────────┬───────┘
           │
           │ (1:N) user_id
           │
┌──────────▼─────────────┐        ┌─────────────────┐
│      bookings          │◀───────│   packages      │
├────────────────────────┤        ├─────────────────┤
│ id (PK)                │        │ id (PK)         │
│ user_id (FK) ────────┐ │        │ title           │
│ package_id (FK) ─────┼─┼──────►│ price           │
│ vehicle_id (FK) ────┐│ │        │ duration_days   │
│ driver_id (FK) ────┐││ │        │ description     │
│ start_date         │││ │        │ image_url       │
│ end_date           │││ │        │ guide_required  │
│ passengers         │││ │        │ is_active       │
│ total_price        │││ │        └─────────────────┘
│ status             │││ │
│ created_at         │││ │        ┌────────────────┐
└────────┬───────────┼┼┼─┼────────│   vehicles     │
         │           │││ │        ├────────────────┤
         │ (1:N)     │││ │        │ id (PK)        │
         │           ││└─┼──────►│ make           │
         │           ││  │        │ model          │
         │           ││  │        │ capacity       │
┌────────▼─────────┐ ││  │        │ status         │
│  booking_logs    │ ││  │        └────────┬───────┘
├──────────────────┤ ││  │                 │
│ id (PK)          │ ││  │        ┌────────▼────────┐
│ booking_id (FK)  │ ││  │        │    drivers      │
│ action           │ ││  │        ├─────────────────┤
│ note             │ ││  └──────►│ id (PK)         │
│ created_at       │ ││           │ name            │
└──────────────────┘ ││           │ license_no      │
                     ││           │ assigned_vehicle│
┌────────────────────┼┘           └─────────────────┘
│ admin_            │
│ verifications     │
├───────────────────┤
│ id (PK)           │
│ booking_id (FK)   │
│ verified_by (FK)  │
│ verified          │
│ verified_at       │
└───────────────────┘

Indexes:
├─ idx_bookings_dates (start_date, end_date)
├─ idx_vehicle_status (status)
├─ idx_users_email (email)
├─ idx_bookings_user_id (user_id)
└─ idx_bookings_status (status)
```

## Authentication Flow

```
Frontend                          Backend                   Database
   │                                 │                           │
   ├─ POST /auth/login ─────────────►│                           │
   │   (email, password)             │                           │
   │                                 ├─ SELECT user by email ───►│
   │                                 │◄─ user record             │
   │                                 │                           │
   │                                 ├─ bcrypt.compare()        │
   │                                 │  (password)               │
   │                                 │                           │
   │◄────── JWT Token ────────────────┤                           │
   │  {token, user}                  │                           │
   │                                 │                           │
   ├─ Store token in localStorage    │                           │
   │                                 │                           │
   ├─ GET /bookings ────────────────►│                           │
   │ (Header: "Authorization: Bearer token")                     │
   │                                 │                           │
   │                                 ├─ jwt.verify(token)       │
   │                                 │                           │
   │                                 ├─ Attach user to req      │
   │                                 │                           │
   │                                 ├─ SELECT bookings ───────►│
   │◄────── Bookings ────────────────┤◄─ records               │
```

## Security Flow

```
Request arrives
    ↓
CORS Middleware
    ├─ Check origin
    └─ Allow if localhost
    ↓
Helmet Middleware
    ├─ Add security headers
    └─ Set CSP, X-Frame-Options, etc.
    ↓
Rate Limiter
    ├─ Check request count
    └─ Block if exceeded (100 req/15min)
    ↓
Body Parser
    ├─ Parse JSON
    └─ Validate content-type
    ↓
Route Handler
    ├─ If protected route:
    │  ├─ Check for Authorization header
    │  ├─ Extract and verify JWT
    │  ├─ Attach user to request
    │  └─ Continue if valid
    │
    ├─ If admin-only route:
    │  ├─ Check req.user.isAdmin
    │  └─ Return 403 if not admin
    │
    └─ Execute handler
    ↓
Database Query
    ├─ Use parameterized queries (prevent SQL injection)
    └─ Return data
    ↓
Response Sent
```

## Component Architecture

```
App (Router Setup)
├── Navbar (Auth State Management)
│   ├── Home Link
│   ├── Packages Link
│   ├── Login/Register (if not logged in)
│   ├── My Bookings (if logged in)
│   ├── Admin Panel (if admin)
│   └── Logout
│
├── Routes
│   ├── / → Home
│   │   └── Hero Section, Features, CTA
│   │
│   ├── /login → Login
│   │   └── Form, Demo creds, Link to Register
│   │
│   ├── /register → Register
│   │   └── Form, Link to Login
│   │
│   ├── /packages → Packages
│   │   ├── Package Grid
│   │   └── Card (for each package)
│   │       └── Booking Modal
│   │
│   ├── /my-bookings → MyBookings
│   │   └── Booking List (with cancel buttons)
│   │
│   └── /admin → AdminPanel
│       ├── Tab: Pending Bookings
│       └── Tab: All Bookings
│           └── Approve/Reject Buttons
│
└── Footer
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────┐
│              Frontend Hosting                   │
│          (Vercel/Netlify/AWS S3)               │
│        Optimized React build                    │
│        CDN for static assets                    │
│        Auto deploys from git                    │
└────────────────────┬────────────────────────────┘
                     │ HTTPS
                     ↓
┌─────────────────────────────────────────────────┐
│         Backend Server (Cloud)                  │
│      (Heroku/Railway/AWS EC2)                   │
│     Node.js app with auto-scaling              │
│     Environment variables from secrets          │
└────────────────────┬────────────────────────────┘
                     │ SQL/TLS
                     ↓
┌─────────────────────────────────────────────────┐
│    Managed Database Service                     │
│   (AWS RDS/Cloud SQL/Azure DB)                 │
│   MySQL with automatic backups                  │
│   Point-in-time recovery enabled               │
└─────────────────────────────────────────────────┘
```

This architecture provides:
- **Scalability**: Horizontal scaling at each layer
- **Security**: SSL/TLS encryption, JWT auth, rate limiting
- **Reliability**: Database backups, error handling, graceful degradation
- **Performance**: CDN for frontend, connection pooling for DB
- **Maintainability**: Clear separation of concerns, modular design
