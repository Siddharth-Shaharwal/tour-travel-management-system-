import React from 'react'

export default function Footer(){
  return (
    <footer className="bg-gray-100 mt-12">
      <div className="container py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        <div>© {new Date().getFullYear()} Tour & Travel</div>
        <div className="flex gap-4 mt-3 md:mt-0">
          <a href="#" className="hover:underline">Contact</a>
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Privacy</a>
        </div>
      </div>
    </footer>
  )
}
