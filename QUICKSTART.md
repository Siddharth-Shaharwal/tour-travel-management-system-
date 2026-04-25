# Quick Start Guide

## ⚡ Get Running in 5 Minutes

### Step 1: Set Up Database

```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
source C:\Users\Trilok\Desktop\travel-management-system\backend\schema_and_triggers.sql
```

After running the SQL, the database will have:
- All tables created
- Triggers for auto-driver-assignment
- 3 sample vehicles
- 2 sample drivers
- 3 sample packages
- 2 sample users (admin + regular)

### Step 2: Start Backend

```powershell
cd "C:\Users\Trilok\Desktop\travel-management-system\backend"

# Create .env file (copy from .env.example and update if needed)
copy .env.example .env

# Install dependencies (if not done already)
npm install

# Start dev server
npm run dev
```

Backend will run on **http://localhost:4000**

### Step 3: Start Frontend

```powershell
cd "C:\Users\Trilok\Desktop\travel-management-system\frontend"

# Install dependencies (if not done already)
npm install

# Start dev server
npm run dev
```

Frontend will run on **http://localhost:5173** (or next available port)

### Step 4: Open Browser

Go to: **http://localhost:5173**

## 🔐 Login Credentials

### Admin Account
- **Email**: admin@travelms.com
- **Password**: admin@123

### Regular User Account
- **Email**: user@travelms.com
- **Password**: user@123

## 📋 User Journey

### As Regular User:
1. Click "Login" → enter credentials above
2. Go to "Packages" → see all available tours
3. Click "Book Now" on any package
4. Fill dates and passenger count
5. Submit booking
6. Go to "My Bookings" to see status

### As Admin:
1. Click "Login" → use admin credentials
2. Go to "Admin Panel"
3. See "Pending Bookings" tab
4. Click "Approve" or "Reject" each booking
5. Switch to "All Bookings" to see history

## 🗄️ Database Structure

**Core Tables:**
- `users` - User accounts with is_admin flag
- `packages` - Tour packages with pricing
- `vehicles` - Cars, vans, buses with capacity
- `drivers` - Drivers assigned to vehicles
- `bookings` - User bookings with status
- `transactions` - Payment tracking
- `admin_verifications` - Admin approval records
- `booking_logs` - Audit trail

**Key Features:**
- Booking status: pending → confirmed → completed/cancelled
- Auto-driver assignment via trigger
- Vehicle status: available → booked → maintenance
- Admin verification required for all bookings

## 🔧 Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### Port already in use
- Backend: Change PORT in `.env`
- Frontend: Will auto-select next available port

### Cannot connect to database
- Check MySQL is running
- Verify credentials in `.env`
- Run schema migration again

### Login not working
- Check user exists in database: `SELECT * FROM users;`
- Verify passwords are hashed with bcrypt

## 📝 API Base URL

All frontend requests go to:
```
http://localhost:4000/api
```

Change in `frontend/src/utils/api.js` if different.

## 🎯 Key Endpoints

**Auth:**
- POST `/api/auth/register` - Sign up
- POST `/api/auth/login` - Sign in

**Packages:**
- GET `/api/packages` - List all
- POST `/api/packages` - Create (admin)
- PUT `/api/packages/:id` - Update (admin)

**Bookings:**
- POST `/api/bookings` - Create booking
- GET `/api/bookings` - My bookings
- PUT `/api/bookings/:id/cancel` - Cancel booking

**Admin:**
- GET `/api/admin/bookings/pending` - Pending
- GET `/api/admin/bookings/all` - All
- PUT `/api/admin/bookings/:id/approve` - Approve
- PUT `/api/admin/bookings/:id/reject` - Reject

## 🚀 Production Deployment

1. Update `.env` JWT_SECRET with strong random string
2. Set `NODE_ENV=production`
3. Use actual database credentials
4. Run `npm run build` for frontend
5. Deploy to hosting platform

## 💡 Pro Tips

- Admin can see all bookings, users only see their own
- Bookings auto-assign drivers on approval (via trigger)
- Vehicles become "booked" when booking is approved
- Cancel booking releases vehicle back to available
- Check browser console for detailed API errors

## 📞 Support

Check these for debugging:
- **Backend logs**: Terminal output from `npm run dev`
- **Frontend logs**: Browser DevTools → Console
- **Database logs**: MySQL logs or check tables directly

Enjoy your Travel Management System! 🌍✈️🏖️
