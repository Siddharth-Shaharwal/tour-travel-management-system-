# SETUP INSTRUCTIONS - READ THIS FIRST

## Prerequisites
- MySQL server running
- Node.js installed
- npm installed

## Step-by-Step Setup

### 1️⃣ DATABASE SETUP (Most Important!)

Open your MySQL client and run:

```sql
mysql -u root -p < "C:\Users\Trilok\Desktop\travel-management-system\backend\schema_and_triggers.sql"
```

Or copy-paste the entire content of `backend/schema_and_triggers.sql` into MySQL Workbench.

**This will:**
- Create database: `travel_management`
- Create all 8 tables
- Add triggers for automation
- Create views and procedures
- Seed demo data (3 vehicles, 2 drivers, 3 packages, 2 users)

### 2️⃣ BACKEND SETUP

Open PowerShell and run:

```powershell
cd "C:\Users\Trilok\Desktop\travel-management-system\backend"

# Create .env file
cp .env.example .env

# Edit .env to match your MySQL credentials (if different from defaults)
# nano .env   (or use your text editor)

# Install dependencies
npm install

# Start backend server
npm run dev
```

**You should see:**
```
Database connected successfully
Server running on port 4000
```

### 3️⃣ FRONTEND SETUP

Open another PowerShell window:

```powershell
cd "C:\Users\Trilok\Desktop\travel-management-system\frontend"

# Install dependencies  
npm install

# Start frontend dev server
npm run dev
```

**You should see:**
```
VITE v5.x.x ready in xxx ms
Local:   http://localhost:5173/
```

### 4️⃣ OPEN IN BROWSER

Go to: **http://localhost:5173**

## 🔓 Login Immediately

Click "Login" button and use:

**Option A - Admin Account:**
```
Email: admin@travelms.com
Password: admin@123
```

**Option B - Regular User:**
```
Email: user@travelms.com
Password: user@123
```

## 🧪 Test the System

### As Regular User:
1. Login with user account
2. Go to "Packages" page
3. See 3 packages listed
4. Click "Book Now" on any package
5. Fill dates and passengers
6. Submit booking
7. Go to "My Bookings" - see status as "PENDING"

### As Admin:
1. Logout and login as admin
2. Go to "Admin Panel"
3. See the booking you just created in "Pending Bookings"
4. Click "Approve" button
5. Booking status changes to "CONFIRMED"
6. Logout and login as regular user again
7. Check "My Bookings" - now shows "CONFIRMED"

## ⚠️ Common Issues & Fixes

### Issue: "Cannot find module 'express'"
**Fix:** Run `npm install` in both backend and frontend folders

### Issue: "Cannot connect to database"
**Fix:** 
- Check MySQL is running
- Update DB credentials in `.env`
- Ensure database name is `travel_management`

### Issue: "Port 4000 already in use"
**Fix:** 
- Change PORT in `.env` to 4001 or higher
- Or kill process using port 4000

### Issue: "Port 5173 already in use"
**Fix:** Vite will automatically use next available port

### Issue: "Login fails"
**Fix:**
- Check .env JWT_SECRET is set
- Check user exists: `SELECT * FROM users;` in MySQL
- Check password hash starts with `$2a$`

### Issue: "Cannot book - 500 error"
**Fix:**
- Check backend console for error
- Verify user is logged in (token in localStorage)
- Check package_id exists in database

### Issue: "Admin panel blank"
**Fix:**
- Must be logged in as admin (is_admin=1 in users table)
- Check bookings exist: `SELECT * FROM bookings;` in MySQL

## 📁 Important Files

- `backend/.env` - YOUR DB CREDENTIALS (don't commit this!)
- `backend/schema_and_triggers.sql` - Database setup script
- `frontend/src/utils/api.js` - Backend URL config

## 🎯 What Each Page Does

| Page | Access | Purpose |
|------|--------|---------|
| `/` | Everyone | Home/landing page |
| `/login` | Not logged in | Login form |
| `/register` | Not logged in | Signup form |
| `/packages` | Everyone | Browse & book packages |
| `/my-bookings` | Logged in users | View personal bookings |
| `/admin` | Admin only | Approve/reject bookings |

## 📱 API Endpoints (Backend)

All requests need token in header:
```
Authorization: Bearer <your_jwt_token>
```

Key endpoints:
- `POST /api/auth/login` → Get token
- `GET /api/packages` → List packages
- `POST /api/bookings` → Create booking
- `GET /api/bookings` → My bookings
- `GET /api/admin/bookings/pending` → Admin pending (admin only)
- `PUT /api/admin/bookings/:id/approve` → Approve (admin only)

## 🔄 Booking Status Flow

```
pending (awaiting admin) 
  ↓
confirmed (admin approved, driver assigned)
  ↓
completed (booking done)

OR

pending → cancelled (admin rejected or user cancelled)
```

## 🛑 IMPORTANT REMINDERS

1. **Must run SQL first!** The database must be created before backend starts
2. **Both servers must run!** Frontend AND backend both needed
3. **Check console logs!** All errors show in terminal/browser console
4. **Clear browser cache!** If things look weird, press Ctrl+Shift+Delete
5. **Don't commit .env!** It has sensitive database passwords

## 🎉 You're All Set!

Now:
1. Register a new account (or use demo)
2. Book a package
3. Approve booking as admin
4. See complete workflow working!

If stuck, check:
- Browser console (F12)
- Backend terminal output
- MySQL directly: `SELECT * FROM bookings;`

Enjoy! 🌍✈️
