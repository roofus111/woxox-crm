"use client";

import { IconButton } from '@mui/material';
import React, { useState } from 'react';

const ProductDetailsPage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('256GB');
  const [selectedColor, setSelectedColor] = useState('Silver');
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSection, setExpandedSection] = useState('details');

  const product = {
    id: 1,
    name: 'Woxox Fintrack',
    brand: 'Woxox',
    price: 599,
    originalPrice: 1099.99,
    rating: 4.9,
    reviewCount: 1251,
    inStock: true,
    description: '',
    images: [
        'https://images.unsplash.com/photo-1622782914767-404fb9ab3f57?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ],
    sizes: ['256GB', '512GB', '1TB'],
    colors: ['Silver', 'Space Gray', 'Gold', 'Starlight'],
    features: [
        'Woxox Fintrack enables finance teams to streamline budgeting, manage expenditures, and generate automated reports with high accuracy. Designed for growing businesses and startups.'
    ],
    keyFeatures: [
      {
        icon: 'ri-line-chart-line',
        title: 'Automated Budgeting',
        description: 'Generate and adjust budgets using AI-based financial forecasting.'
      },
      {
        icon: 'ri-money-dollar-circle-line',
        title: 'Expense Tracking',
        description: 'Track every rupee with categorized spend analysis and reports.'
      },
      {
        icon: 'ri-file-text-line',
        title: 'Invoice Management',
        description: 'Create, send, and track invoices in a single dashboard.'
      },
      {
        icon: 'ri-bar-chart-line',
        title: 'Tax Reports',
        description: 'Generate GST-ready reports and tax summaries instantly.'
      }
    ],
    moduleInfo: {
      category: 'Analytics & Business Intelligence',
      platforms: ['Web', 'iOS', 'Android'],
      size: '38MB',
      languages: ['English', 'Hindi', 'Spanish', 'French'],
      version: '1.6 – Updated July 8, 2025',
      publisher: 'Woxox Technologies Pvt. Ltd.'
    }
  };

  const reviews = [
    {
      id: 1,
      user: 'Isabella P.',
      rating: 5,
      verified: true,
      date: 'Today',
      title: 'Absolutely love this sunscreen',
      comment: 'Absolutely love this sunscreen! It feels lightweight, blends seamlessly into my skin without any white cast, and leaves it with a dewy finish. Plus, knowing it\'s reef-safe and packed with nourishing ingredients makes it a must-have in my daily routine. Highly recommend!',
      helpful: 13,
      images: [
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop'
      ]
    },
    {
      id: 2,
      user: 'Michael R.',
      rating: 5,
      verified: true,
      date: '2 days ago',
      title: 'Perfect for work',
      comment: 'Great performance and battery life. Perfect for my daily work needs.',
      helpful: 8,
      images: []
    },
    {
      id: 3,
      user: 'Sarah L.',
      rating: 4,
      verified: true,
      date: '1 week ago',
      title: 'Good value',
      comment: 'Solid laptop with great build quality. The display is beautiful.',
      helpful: 5,
      images: []
    }
  ];

  const relatedProducts = [
    {
      id: 2,
      name: 'iPad Pro 11-inch',
      brand: 'Apple',
      price: 799.99,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&h=200&fit=crop'
    },
    {
      id: 3,
      name: 'AirPods Pro',
      brand: 'Apple',
      price: 249.99,
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=200&h=200&fit=crop'
    },
    {
      id: 4,
      name: 'Magic Mouse',
      brand: 'Apple',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200&h=200&fit=crop'
    }
  ];

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Product Section */}
      <div className="flex flex-col lg:flex-row">
        {/* Product Images */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8">
          <div className="lg:sticky lg:top-8">
            {/* Main Image */}
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8">
          <div className="max-w-lg mx-auto lg:mx-0">
            {/* Brand */}
            <p className="text-sm text-gray-600 mb-2">{product.brand}</p>

            {/* Product Name */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-6">
              <div className="flex items-center space-x-1 mb-2 sm:mb-0">
                {[...Array(5)].map((_, i) => (
                <i
                className={`ri-star-line w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                key={i}
                />
                ))}
                <span className="text-sm font-medium text-gray-900 ml-2">{product.rating}</span>
              </div>
              <span className="text-sm text-gray-600">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">₹{product.price.toFixed(2)}/month</span>
                {product.originalPrice && (
                  <span className="text-lg sm:text-xl text-gray-500 line-through">₹{product.originalPrice.toFixed(2)}/month</span>
                )}
              </div>
              {product.originalPrice && (
                <span className="text-sm text-green-600 font-medium">
                  Save ${(product.originalPrice - product.price).toFixed(2)} (15% off)
                </span>
              )}
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-3">Smarter Financial Management</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-8">
              <button className="flex-1 bg-blue-600 cursor-pointer text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <i className="ri-lock-2-line"></i>
                <span>Subscribe to install</span>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Subscribers: 4,320+</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">7-day free trial</span>
              </div>
            </div>

            {/* Expandable Sections */}
            <div className="space-y-4">
              {/* Details */}
              <div className="border border-gray-200 rounded-2xl">
                <div
                  onClick={() => toggleSection('details')}
                  className="w-full flex cursor-pointer items-center justify-between p-3 text-left"
                >
                  <span className="font-medium text-base text-gray-900">Overview</span>
                  {expandedSection === 'details'
                    ? <i className="ri-arrow-up-line" />
                    : <i className="ri-arrow-down-line" />
                  }
                </div>
                <div
                  className={`px-4 pb-4 overflow-hidden transition-all duration-300 ${
                    expandedSection === 'details' ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                  <ul className="space-y-2">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {product.keyFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <i className={`${feature.icon} text-blue-600 text-lg sm:text-xl`}></i>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module Information Section */}
      <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Module Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Category */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-folder-line text-blue-600 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs sm:text-sm text-gray-600">Category</span>
              </div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{product.moduleInfo.category}</p>
            </div>

            {/* Platforms */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-device-line text-blue-600 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs sm:text-sm text-gray-600">Platforms</span>
              </div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{product.moduleInfo.platforms.join(', ')}</p>
            </div>

            {/* Size */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-file-line text-blue-600 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs sm:text-sm text-gray-600">Size</span>
              </div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{product.moduleInfo.size}</p>
            </div>

            {/* Languages */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-global-line text-blue-600 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs sm:text-sm text-gray-600">Languages</span>
              </div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{product.moduleInfo.languages.join(', ')}</p>
            </div>

            {/* Version */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-code-line text-blue-600 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs sm:text-sm text-gray-600">Version</span>
              </div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{product.moduleInfo.version}</p>
            </div>

            {/* Publisher */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-building-line text-blue-600 text-sm sm:text-lg"></i>
                </div>
                <span className="text-xs sm:text-sm text-gray-600">Publisher</span>
              </div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{product.moduleInfo.publisher}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Customer Reviews</h2>
          
          {/* Reviews Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mb-8">
            <div className="text-center mb-6 sm:mb-0">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">{product.rating}</div>
              <div className="flex items-center justify-center space-x-1 mb-1">
                {[...Array(5)].map((_, i) => (
                <i
                className={`ri-star-line w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                key={i}
                />
                ))}
              </div>
              <div className="text-sm text-gray-600">{product.reviewCount} reviews</div>
            </div>
            
            {/* Rating Distribution */}
            <div className="flex-1 max-w-md">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-gray-600 w-2">{rating}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{rating === 5 ? 142 : rating === 4 ? 41 : rating === 3 ? 12 : rating === 2 ? 8 : 5}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{review.user.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{review.user}</span>
                      <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                        {review.verified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified Buyer</span>
                        )}
                        <span className="text-xs sm:text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <i
                        className={`ri-star-line w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        key={i}
                        />
                      ))}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{review.title}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3">{review.comment}</p>
                    {review.images.length > 0 && (
                      <div className="flex space-x-2 mb-3">
                        {review.images.map((image, index) => (
                          <img key={index} src={image} alt={`Review ${index + 1}`} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg" />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                      <span className="hidden sm:inline">Was this review helpful?</span>
                      <span className="sm:hidden">Helpful?</span>
                      <div className="flex items-center space-x-1">
                        <IconButton size="small"><i className="ri-thumb-up-fill text-xs"></i></IconButton>
                        <span>{review.helpful}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <IconButton size="small"><i className="ri-thumb-down-fill text-xs"></i></IconButton>
                        <span>1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Related Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {relatedProducts.map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-white rounded-xl sm:rounded-2xl mb-3 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{product.brand}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;