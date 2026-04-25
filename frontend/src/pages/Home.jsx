import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const isLoggedIn = !!localStorage.getItem('token')

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-16 rounded-lg mb-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Tour & Travel</h1>
          <p className="text-xl mb-8 opacity-90">Discover amazing destinations and book unforgettable journeys</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              to="/packages"
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100"
            >
              Explore Packages
            </Link>
            {!isLoggedIn && (
              <Link 
                to="/register"
                className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-8">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🏆 Best Deals</h3>
            <p className="text-gray-600">Get the best prices on travel packages without compromising quality.</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🚗 Reliable Transport</h3>
            <p className="text-gray-600">Modern, comfortable vehicles with experienced professional drivers.</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">📅 Easy Booking</h3>
            <p className="text-gray-600">Simple booking process with instant confirmation and support.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-8">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">1</div>
            <h3 className="font-semibold mb-2">Sign Up</h3>
            <p className="text-sm text-gray-600">Create your account in seconds</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">2</div>
            <h3 className="font-semibold mb-2">Browse Packages</h3>
            <p className="text-sm text-gray-600">Choose from our exciting packages</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">3</div>
            <h3 className="font-semibold mb-2">Book & Wait</h3>
            <p className="text-sm text-gray-600">Submit booking for admin approval</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">4</div>
            <h3 className="font-semibold mb-2">Enjoy!</h3>
            <p className="text-sm text-gray-600">Get confirmed and start your journey</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="mt-12 bg-indigo-600 text-white p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Next Adventure?</h2>
          <p className="mb-6 opacity-90">Join thousands of happy travelers</p>
          <Link 
            to="/register"
            className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100"
          >
            Sign Up Now
          </Link>
        </section>
      )}
    </div>
  )
}
