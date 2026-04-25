import React from 'react'

export default function Card({title, subtitle, img, children}){
  return (
    <div className="bg-white shadow rounded overflow-hidden">
      {img && <img src={img} alt={title} className="w-full h-48 object-cover" />}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}
