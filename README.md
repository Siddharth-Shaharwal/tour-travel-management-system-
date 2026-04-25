# Travel Management System

A complete full-stack travel booking and management system with admin dashboard, real-time availability tracking, and automated confirmation workflow.

## 🌟 Features

### User Features
- ✅ User Registration & Login with JWT authentication
- ✅ Browse travel packages with filtering
- ✅ Book packages with optional vehicle selection
- ✅ View booking history and status
- ✅ Cancel bookings (automatic refund processing)
- ✅ Real-time updates on login/logout

### Admin Features
- ✅ Dashboard with revenue and profit metrics
- ✅ View all bookings and pending approvals
- ✅ Assign vehicles and drivers to bookings
- ✅ Auto-confirmation when vehicle/driver assigned
- ✅ Reject bookings with one click
- ✅ Full CRUD operations for drivers, vehicles, packages
- ✅ Driver availability checking by time period
- ✅ Real-time seat availability tracking

### System Features
- ✅ Automatic transaction recording on booking
- ✅ Refund processing (transaction deletion on cancellation)
- ✅ Conflict prevention for driver/vehicle assignments
- ✅ Audit trail with booking logs
- ✅ Role-based access control
- ✅ Responsive UI (mobile, tablet, desktop)

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MySQL (`travel_manage` schema)
- **Auth**: JWT (7-day tokens) + bcryptjs
- **Security**: Helmet, rate-limiting, input validation
- Booking logs and admin verifications
- Transaction tracking
- Vehicle and driver management

## Project Structure

```
travel-management-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── packageController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Booking.js
│   │   └── Package.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── packages.js
│   │   ├── admin.js
│   │   ├── vehicles.js
│   │   └── ...
│   ├── utils/
│   │   └── validation.js
│   ├── server.js
│   ├── schema_and_triggers.sql
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Packages.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Card.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Installation & Setup

### 1. Database Setup

Run the SQL migration file to set up the database:

```bash
mysql -u root -p < backend/schema_and_triggers.sql
```

This will create the `travel_management` database with all tables, triggers, views, and seed data.

### 2. Backend Setup

```bash
cd backend

# Copy .env.example and update with your database credentials
cp .env.example .env

# Edit .env with your values
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=travel_management
# JWT_SECRET=your_secret_key
# BCRYPT_ROUNDS=10

# Install dependencies
npm install

# Start development server
npm run dev
# or production
npm run start
```

The backend will run on port 4000 (or `$PORT` environment variable).

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Fix vulnerabilities (optional but recommended)
npm audit fix

# Start dev server
npm run dev
```

The frontend will run on port 5173 (or next available port if taken).

## Demo Credentials

After running the migration, you can use these credentials:

**Admin User:**
- Email: `admin@travelms.com`
- Password: `admin@123`

**Regular User:**
- Email: `user@travelms.com`
- Password: `user@123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user profile (protected)

### Packages
- `GET /api/packages` - Get all packages
- `GET /api/packages/:id` - Get package details
- `POST /api/packages` - Create package (admin only)
- `PUT /api/packages/:id` - Update package (admin only)
- `DELETE /api/packages/:id` - Delete package (admin only)

### Bookings
- `POST /api/bookings` - Create new booking (protected)
- `GET /api/bookings` - Get user's bookings (protected)
- `GET /api/bookings/:bookingId` - Get booking details (protected)
- `PUT /api/bookings/:bookingId/cancel` - Cancel booking (protected)

### Admin
- `GET /api/admin/bookings/pending` - Get pending bookings (admin only)
- `GET /api/admin/bookings/all` - Get all bookings (admin only)
- `PUT /api/admin/bookings/:bookingId/approve` - Approve booking (admin only)
- `PUT /api/admin/bookings/:bookingId/reject` - Reject booking (admin only)

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle details

## Usage

### User Flow
1. Visit home page
2. Click "Register" to create an account
3. Login with email and password
4. Browse packages on "/packages"
5. Click "Book Now" on a package
6. Fill in dates and passenger count
7. Submit booking
8. View booking in "My Bookings" page
9. Wait for admin approval

### Admin Flow
1. Login with admin credentials
2. Go to "/admin" panel
3. View pending bookings
4. Click "Approve" to confirm or "Reject" to cancel
5. Switch to "All Bookings" tab to see booking history

## Key Database Features

### Triggers
- `trg_before_booking_insert` - Validates vehicle capacity and availability before inserting booking
- `trg_after_booking_insert` - Auto-assigns driver and creates verification records
- `trg_after_booking_update` - Handles cancellation cleanup (releases vehicles and drivers)

### Views
- `vw_booking_details` - Complete booking details with related data

### Stored Procedures
- `sp_get_available_vehicles` - Fetch available vehicles for date range

### Indexes
- Optimized for common queries on bookings, vehicles, and users

## Environment Variables

Create a `.env` file in the `backend` folder:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=travel_management
PORT=4000
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
```

## Frontend Configuration

Update `frontend/src/utils/api.js` if your backend is on a different host/port:

```javascript
const API = axios.create({
  baseURL: 'http://localhost:4000/api'
});
```

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Helmet** - HTTP headers security
- **Rate Limiting** - Express rate limiter on all routes
- **CORS** - Cross-origin resource sharing configured
- **Input Validation** - Server-side validation on all inputs

## Troubleshooting

### Backend won't start
- Check database connection in `.env`
- Ensure MySQL service is running
- Run the schema migration script

### Frontend won't connect to backend
- Check `api.js` base URL matches backend port
- Ensure backend is running on correct port
- Check CORS settings in `server.js`

### Login not working
- Check `.env` JWT_SECRET is set
- Verify credentials match seed data or user registration
- Check browser console for error details

## Performance Optimizations

- Database indexes on frequently queried columns
- Connection pooling for MySQL
- Efficient JOIN queries with LEFT JOINs
- Caching patterns in frontend components

## Future Enhancements

- Payment gateway integration
- Email notifications
- Advanced filtering and search
- Booking history and analytics
- Multi-language support
- Mobile app (React Native)
- Real-time notifications (WebSockets)

## License

MIT

## Support

For issues or questions, please check the error messages in the browser console (frontend) and backend server logs.
