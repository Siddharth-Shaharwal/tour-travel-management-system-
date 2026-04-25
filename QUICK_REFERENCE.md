# Quick Reference Card

## 🚀 Quick Start

### Windows
```batch
start.bat
```
Opens backend and frontend in separate command windows.

### macOS/Linux
```bash
chmod +x start.sh
./start.sh
```

### Manual
```bash
# Terminal 1
cd backend && npm install && node server.js

# Terminal 2
cd frontend && npm install && npm run dev
```

---

## 🌐 URLs

| Component | URL |
|-----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| Admin Dashboard | http://localhost:5173/admin |

---

## 👤 Test Accounts

### Regular User
- Email: user@example.com
- Password: password123

### Admin Account
- Email: admin@example.com
- Password: admin123

*(Create your own in the app)*

---

## 📱 User Flow

1. **Home** → Browse packages
2. **Packages** → Click package for details
3. **Book** → Select dates and passengers
4. **Reservations** → View booking status
5. **Cancel** → Get automatic refund

---

## 👨‍💼 Admin Flow

1. **Dashboard** → See metrics
2. **Pending Bookings** → Review requests
3. **Assign** → Select vehicle & driver
4. **Confirm** → Auto-confirms on assignment
5. **Or Reject** → Cancels booking with refund

---

## 🔑 Key Features

| Feature | Command | Endpoint |
|---------|---------|----------|
| Register | `npm run dev` + UI | POST /api/auth/register |
| Login | UI Form | POST /api/auth/login |
| Book Package | UI Form | POST /api/bookings |
| View Dashboard | /admin | GET /api/dashboard/stats |
| Assign Vehicle | Modal | POST /api/dashboard/assign-vehicle |
| Check Driver Availability | API | GET /api/dashboard/driver-availability?driver_id=1&dates |
| Check Seats | Modal | GET /api/dashboard/available-seats?package_id=1 |

---

## 🛠 Database Quick Check

```bash
# Login to MySQL
mysql -u root -p

# Select database
USE travel_manage;

# Check tables
SHOW TABLES;

# Check drivers
SELECT * FROM drivers;

# Check bookings
SELECT * FROM bookings;

# Check transactions
SELECT * FROM transactions;
```

---

## 📊 Dashboard Metrics

- **Total Revenue** - Sum of all confirmed bookings
- **Est. Profit** - 30% of total revenue
- **Total Bookings** - Count of all bookings
- **Total Users** - Count of non-admin users
- **Active Packages** - Count of packages with is_active=TRUE

---

## 🔐 Authentication

- JWT Token: Stored in `localStorage`
- Expiration: 7 days
- Scope: All authenticated API calls
- Admin Flag: `isAdmin` in token payload

---

## 📋 Booking Statuses

| Status | Meaning |
|--------|---------|
| pending | Waiting for admin assignment |
| confirmed | Vehicle & driver assigned |
| cancelled | Rejected or user cancelled |
| completed | Travel completed |

---

## 🚗 Vehicle Statuses

| Status | Meaning |
|--------|---------|
| available | Ready to assign |
| booked | Assigned to booking |
| maintenance | Not available |

---

## 👨 Driver Statuses

| Status | Meaning |
|--------|---------|
| available | Not assigned |
| busy | Currently assigned |

---

## 💳 Transaction Statuses

| Status | Meaning |
|--------|---------|
| initiated | Just created |
| success | Booking confirmed |
| failed | Booking cancelled (record deleted) |

---

## 🔍 Common API Calls

### List Packages
```bash
curl http://localhost:4000/api/packages
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'
```

### Create Booking
```bash
curl -X POST http://localhost:4000/api/bookings \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "package_id": 1,
    "start_date": "2024-01-15",
    "end_date": "2024-01-20",
    "passengers": 2
  }'
```

### Get Dashboard Stats
```bash
curl http://localhost:4000/api/dashboard/stats \
  -H "Authorization: Bearer TOKEN"
```

### Check Driver Availability
```bash
curl "http://localhost:4000/api/dashboard/driver-availability?driver_id=1&start_date=2024-01-15&end_date=2024-01-20" \
  -H "Authorization: Bearer TOKEN"
```

---

## 📂 Project Structure

```
travel-management-system/
├── backend/
│   ├── controllers/          # Business logic
│   ├── models/              # Database models
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth, validation
│   ├── config/              # Database config
│   ├── utils/               # Helper functions
│   └── server.js            # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # API client
│   │   ├── App.jsx          # Main app
│   │   └── main.jsx         # Entry point
│   └── package.json
└── README.md
```

---

## ⚡ Performance Tips

- API calls are cached where possible
- JWT tokens prevent repeated auth queries
- Database queries use indexes
- React components are optimized
- Tailwind CSS is production-optimized

---

## 🛡️ Security Checklist

- ✅ Passwords hashed with bcryptjs
- ✅ JWT tokens with expiration
- ✅ CORS enabled
- ✅ Rate limiting enabled
- ✅ Input validation on all endpoints
- ✅ Admin-only routes protected
- ✅ SQL injection prevented
- ✅ Security headers via Helmet

---

## 🐛 Quick Fixes

**Backend won't start:**
```bash
# Check if port 4000 is in use
netstat -ano | findstr :4000
# If occupied, kill process or change PORT in .env
```

**Frontend won't start:**
```bash
# Clear cache and reinstall
cd frontend
rm -r node_modules
npm install
npm run dev
```

**Can't login:**
```bash
# Check if backend is running
curl http://localhost:4000/
# Check if database is connected
# Verify credentials in MySQL
```

---

## 📞 Support Resources

- **IMPLEMENTATION_SUMMARY.md** - Full feature list
- **TESTING_GUIDE.md** - Testing procedures  
- **COMPLETION_REPORT.md** - Project summary

---

## ✅ Success Checklist

After starting:
- [ ] Both servers running without errors
- [ ] Can open http://localhost:5173
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can browse packages
- [ ] Can create booking (if admin)
- [ ] Can view dashboard (if admin)
- [ ] Can assign vehicle/driver (if admin)

---

**All systems ready!** 🚀

For detailed docs, see the markdown files in project root.
