"use client";

import { useState } from 'react';
import Button from '@mui/material/Button';

export default function Settings() {
  const [formData, setFormData] = useState({
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael@woxox.com',
    jobTitle: 'Marketing Director',
    bio: 'Digital marketing professional with 8+ years of experience in social media strategy and campaign management.',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: null // Add profile image state
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = () => {
    console.log('Saving changes:', formData);
    // Handle form submission logic here
  };

  const handleCancel = () => {
    // Reset form or handle cancel logic
    console.log('Cancel clicked');
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, profileImage: null }));
    console.log('Remove photo clicked');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <Button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <i class="ri-refresh-line"></i>
          <span className="text-sm">Refresh Status</span>
        </Button>
      </div>
      
      <p className="text-gray-600 mb-8">Manage your account preference, Security and Customization options</p>

      {/* User Profile Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">User Profile</h2>
        
        <div className="space-y-6">
          {/* Profile Photo and Name Row */}
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2 overflow-hidden">
                {formData.profileImage ? (
                  <img 
                    src={formData.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, show first letter instead
                      setFormData(prev => ({ ...prev, profileImage: null }));
                    }}
                  />
                ) : (
                  <span className="text-2xl font-semibold text-gray-600">
                    {formData.firstName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <Button 
                onClick={handleRemovePhoto}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Remove photo
              </Button>
            </div>

            {/* Name Fields */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
        
        <div className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* New Password Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        <Button
        sx={{ border: '1px solid #E5E7EB' }}
          onClick={handleCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </Button>
        <Button
        variant='contained'
          onClick={handleSaveChanges}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}