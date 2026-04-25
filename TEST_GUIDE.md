# 🚀 Quick Start Guide - Testing New Features

## Starting the Application

### Backend
```bash
cd backend
node server.js
# Server will run on http://localhost:4000
```

### Frontend
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 🧪 Complete Testing Workflow

### Step 1: Admin Login & View Dashboard
1. Go to http://localhost:5173
2. Click "Login"
3. Enter credentials:
   - Email: `admin@travelms.com`
   - Password: `admin@123`
4. You'll be redirected to Admin Panel (if first login)
5. Click on "Admin" link in navbar to go to Dashboard
6. **See these sections:**
   - 📊 Revenue, Profit, Bookings, Users, Packages KPIs
   - 📈 Booking Status breakdown
   - 💰 Revenue by Package
   - 📋 Recent Bookings table
   - 👥 Pending Bookings for vehicle/driver assignment

### Step 2: Create a Test User Booking
1. Open new browser tab or logout
2. Go to http://localhost:5173
3. Click "Register"
4. Fill in:
   - Name: `Test Customer`
   - Email: `test@example.com`
   - Phone: `9876543210`
   - Password: `test@123`
5. Click "Register"
6. You'll be logged in automatically

### Step 3: Browse Packages
1. Click "Packages" in navbar
2. See available tour packages:
   - Historic Jaipur Tour (₹1,200)
   - Ranthambore Safari (₹8,000)
   - Udaipur City Tour (₹5,000)

### Step 4: Book with Vehicle Selection
1. Click "Book Now" on any package
2. Fill in booking details:
   - Start Date: Pick a future date
   - End Date: Pick a later date
   - Passengers: 2
3. **Important**: As you fill dates/passengers, watch the "Select Vehicle" dropdown populate
4. Choose a vehicle from dropdown (optional)
5. See total price calculated
6. Click "Confirm Booking"
7. Success message shows

### Step 5: Admin Assigns Vehicle & Driver
1. Login as admin (new tab)
2. Go to Admin Dashboard (click "Admin" in navbar)
3. Scroll to "Pending Bookings - Assign Vehicle & Driver"
4. Click "Assign" button on the booking you just created
5. Modal pops up:
   - Select a Vehicle (shows capacity)
   - Select a Driver (shows phone number)
6. Click "Assign"
7. Success message
8. Dashboard updates automatically
9. Booking now shows ✓ marks for assigned vehicle & driver

### Step 6: View Dashboard Metrics
1. Scroll to top of dashboard
2. **KPI Cards** now show updated numbers:
   - Total Revenue increased
   - Total Bookings increased
   - Recent Bookings table shows new booking
3. **Revenue by Package** shows booking count and revenue
4. **Booking Status** shows breakdown

---

## 🎯 Key Features to Test

### Vehicle Selection Features
- ✅ Vehicle list changes based on date range
- ✅ Vehicle list changes based on passenger count
- ✅ Only vehicles with sufficient capacity show
- ✅ No conflicts with existing bookings
- ✅ Optional selection (users can book without choosing)

### Dashboard Features
- ✅ Revenue calculation is correct
- ✅ Profit calculation (30% margin)
- ✅ Booking status counts
- ✅ Revenue by package shows all packages with bookings
- ✅ Recent bookings displayed in order
- ✅ Pending bookings show assignment status

### Assignment Features
- ✅ Vehicle dropdown shows available vehicles
- ✅ Driver dropdown shows unassigned drivers
- ✅ Assignment succeeds
- ✅ Booking updates with vehicle/driver ID
- ✅ Dashboard refreshes automatically
- ✅ Booking logs record assignment

---

## 🔍 Advanced Testing

### Test Vehicle Availability Logic
1. Book Package 1: Dates Jan 1-5, Vehicle A
2. Try to book Package 2: Dates Jan 3-7
3. Vehicle A should NOT appear (conflicts with dates)
4. Try to book with 10 passengers
5. Only vehicles with capacity ≥ 10 should show

### Test Profit Calculation
1. Admin Dashboard shows: Revenue = ₹X, Profit = ₹X × 0.30
2. Make multiple bookings
3. Watch total revenue and profit increase

### Test Multiple Bookings
1. Create 3-5 bookings as different users
2. Assign different vehicles to each
3. Dashboard should show all in "Recent Bookings"
4. "Revenue by Package" should accumulate

### Test Admin Approval Workflow
1. Create booking as user
2. Go to Admin Dashboard
3. Click "Approve" button in pending section
4. Check "Confirmed" status in "Recent Bookings" table

---

## 📲 API Testing (Optional)

### Get Dashboard Stats
```bash
curl -H "Authorization: Bearer {admin_token}" \
  http://localhost:4000/api/dashboard/stats
```

### Get Available Vehicles
```bash
curl "http://localhost:4000/api/dashboard/vehicles?start_date=2024-12-01&end_date=2024-12-05&passenger_count=2"
```

### Assign Vehicle & Driver
```bash
curl -X POST http://localhost:4000/api/dashboard/assign-vehicle \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"booking_id":1,"vehicle_id":1,"driver_id":1}'
```

---

## 🆘 Troubleshooting

**No vehicles showing in dropdown?**
- Check if dates are properly filled
- Ensure passenger count ≤ vehicle capacity
- Verify there are no conflicting bookings

**Assignment button disabled?**
- Ensure you're logged in as admin
- Check if vehicle and driver are already assigned to booking

**Dashboard not loading?**
- Verify backend is running on port 4000
- Check browser console for errors
- Try refreshing the page

**Vehicles greyed out or missing?**
- The dates/passengers may conflict with existing bookings
- Try different dates
- Try different passenger count

---

## 📞 Demo Accounts Summary

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | `admin@travelms.com` | `admin@123` | View dashboard, assign vehicles |
| User | `user@travelms.com` | `user@123` | Book packages |
| Test | `test@example.com` | `test@123` | Create new during testing |

---

## ✅ Verification Checklist

After testing, verify:
- [ ] Can login as both admin and user
- [ ] Can browse packages and see details
- [ ] Can book packages with or without vehicle selection
- [ ] Vehicle list updates based on dates/passengers
- [ ] Admin can see dashboard with correct stats
- [ ] Admin can assign vehicles and drivers
- [ ] Dashboard updates after assignment
- [ ] Transactions are recorded
- [ ] Booking status changes reflect in dashboard

---

**🎉 System is fully functional and ready for use!**
