import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

export default function Navbar(){
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const checkAuthState = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        setIsLoggedIn(true);
        setIsAdmin(parsed.is_admin || false);
        setUser(parsed);
      } catch (e) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthState();
    
    // Listen for storage changes (from other tabs or login/logout in same tab)
    const handleStorageChange = () => {
      checkAuthState();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    checkAuthState();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4">
        <Link to='/' className="text-xl font-bold text-indigo-600">🌍 Tour & Travel</Link>
        
        <nav className="space-x-6 hidden md:block">
          <NavLink to='/' className={({isActive})=>isActive? 'text-indigo-600 font-semibold':'text-gray-700 hover:text-indigo-600'}>Home</NavLink>
          <NavLink to='/packages' className={({isActive})=>isActive? 'text-indigo-600 font-semibold':'text-gray-700 hover:text-indigo-600'}>Packages</NavLink>
          {isLoggedIn && (
            <>
              <NavLink to='/my-bookings' className={({isActive})=>isActive? 'text-indigo-600 font-semibold':'text-gray-700 hover:text-indigo-600'}>My Bookings</NavLink>
              {isAdmin && <NavLink to='/admin' className={({isActive})=>isActive? 'text-indigo-600 font-semibold':'text-gray-700 hover:text-indigo-600'}>Admin Panel</NavLink>}
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to='/login' className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">
                Login
              </Link>
              <Link to='/register' className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded text-sm hover:bg-indigo-50">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
