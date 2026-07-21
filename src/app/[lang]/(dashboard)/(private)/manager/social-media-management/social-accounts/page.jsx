"use client";

import React, { useState } from "react";
import { 
  Button, 
  Tabs, 
  Tab, 
  Box, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Switch,
  FormControlLabel,
  Typography,
  Avatar,
  Chip
} from "@mui/material";

const SocialAccountsDashboard = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("Recently Added");
  const [searchQuery, setSearchQuery] = useState("");
  const [permissions, setPermissions] = useState({
    postOnBehalf: true,
    readAnalytics: true,
    manageFollowers: false,
    accessDirectMessages: false,
    automatedResponses: true
  });

  const accounts = [
    {
      id: 1,
      platform: "Instagram",
      handle: "@woxox_official",
      status: "Connected",
      health: { score: 92, label: "Excellent", color: "text-green-600" },
      followers: "28.4K",
      engagement: "4.8%",
      lastSync: "2h ago",
      icon: <i className="ri-instagram-line"></i>,
      bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      id: 2,
      platform: "Facebook",
      handle: "Woxox Official",
      status: "Connected",
      health: { score: 85, label: "Good", color: "text-blue-600" },
      followers: "42.7K",
      engagement: "3.2%",
      lastSync: "1h ago",
      icon: <i className="ri-facebook-fill"></i>,
      bgColor: "bg-blue-600",
    },
    {
      id: 3,
      platform: "X",
      handle: "@WoxoxOfficial",
      status: "Connected",
      health: { score: 76, label: "Good", color: "text-blue-600" },
      followers: "15.3K",
      engagement: "2.7%",
      lastSync: "3h ago",
      icon: <i className="ri-twitter-x-line"></i>,
      bgColor: "bg-black",
    },
    {
      id: 4,
      platform: "LinkedIn",
      handle: "Woxox Technologies",
      status: "Connected",
      health: { score: 95, label: "Excellent", color: "text-green-600" },
      followers: "8.6K",
      engagement: "4.1%",
      lastSync: "5h ago",
      icon: <i className="ri-linkedin-fill"></i>,
      bgColor: "bg-blue-700",
    },
    {
      id: 5,
      platform: "Pinterest",
      handle: "@woxox_designs",
      status: "Pending",
      health: { score: 0, label: "Pending", color: "text-orange-600" },
      followers: "--",
      engagement: "--",
      lastSync: "Awaiting",
      icon: <i className="ri-pinterest-line"></i>,
      bgColor: "bg-red-600",
    },
    {
      id: 6,
      platform: "YouTube",
      handle: "Woxox Channel",
      status: "Error",
      health: { score: 45, label: "Poor", color: "text-red-600" },
      followers: "5.2K",
      engagement: "2.1%",
      lastSync: "Failed",
      icon: <i className="ri-youtube-line"></i>,
      bgColor: "bg-red-600",
    },
  ];

  const teamMembers = [
    {
      id: 1,
      name: "Michael Johnson",
      email: "michael@woxox.com",
      role: "Admin",
      avatar: "/api/placeholder/40/40",
      permissions: {
        instagram: { level: "Full Access", color: "#10B981" },
        facebook: { level: "Full Access", color: "#10B981" },
        x: { level: "Full Access", color: "#10B981" },
        linkedin: { level: "Full Access", color: "#10B981" }
      }
    },
    {
      id: 2,
      name: "Sarah Williams",
      email: "sarah@woxox.com",
      role: "Content Manager",
      avatar: "/api/placeholder/40/40",
      permissions: {
        instagram: { level: "Full Access", color: "#10B981" },
        facebook: { level: "Full Access", color: "#10B981" },
        x: { level: "Post Only", color: "#3B82F6" },
        linkedin: { level: "Post Only", color: "#3B82F6" }
      }
    },
    {
      id: 3,
      name: "David Chen",
      email: "david@woxox.com",
      role: "Analytics Specialist",
      avatar: "/api/placeholder/40/40",
      permissions: {
        instagram: { level: "View Only", color: "#F59E0B" },
        facebook: { level: "View Only", color: "#F59E0B" },
        x: { level: "View Only", color: "#F59E0B" },
        linkedin: { level: "View Only", color: "#F59E0B" }
      }
    }
  ];

  const connectPlatforms = [
    { name: "Instagram", icon: "ri-instagram-line", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { name: "Facebook", icon: "ri-facebook-fill", color: "bg-blue-600" },
    { name: "X", icon: "ri-twitter-x-line", color: "bg-black" },
    { name: "LinkedIn", icon: "ri-linkedin-fill", color: "bg-blue-700" },
    { name: "YouTube", icon: "ri-youtube-line", color: "bg-red-600" },
    { name: "WhatsApp", icon: "ri-whatsapp-line", color: "bg-green-500" }
  ];

  const connectionStatus = [
    {
      platform: "Instagram",
      status: "Connected",
      lastSync: "June 24, 2025 - 10:45 AM",
      health: "Healthy",
      icon: <i className="ri-instagram-line"></i>,
      bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      platform: "Facebook",
      status: "Connected",
      lastSync: "June 24, 2025 - 11:30 AM",
      health: "Healthy",
      icon: <i className="ri-facebook-fill"></i>,
      bgColor: "bg-blue-600",
    },
    {
      platform: "X",
      status: "Connected",
      lastSync: "June 24, 2025 - 09:15 AM",
      health: "Healthy",
      icon: <i className="ri-twitter-x-line"></i>,
      bgColor: "bg-black",
    },
    {
      platform: "LinkedIn",
      status: "Connected",
      lastSync: "June 24, 2025 - 07:30 AM",
      health: "Healthy",
      icon: <i className="ri-linkedin-fill"></i>,
      bgColor: "bg-blue-700",
    },
    {
      platform: "Pinterest",
      status: "Pending",
      lastSync: "-",
      health: "Awaiting",
      icon: <i className="ri-pinterest-line"></i>,
      bgColor: "bg-red-600",
    },
    {
      platform: "YouTube",
      status: "Error",
      lastSync: "Failed (June 23, 2025)",
      health: "API Rate Limit",
      icon: <i className="ri-youtube-line"></i>,
      bgColor: "bg-red-600",
    },
  ];

  const getTabCount = (tab) => {
    switch (tab) {
      case "all":
        return accounts.length;
      case "connected":
        return accounts.filter((a) => a.status === "Connected").length;
      case "pending":
        return accounts.filter((a) => a.status === "Pending").length;
      case "issues":
        return accounts.filter((a) => a.status === "Error").length;
      default:
        return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Connected":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-orange-100 text-orange-800";
      case "Error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getHealthColor = (health) => {
    if (health === "Healthy") return "text-green-600";
    if (health === "Awaiting") return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Social Accounts
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your connected social media accounts and monitor their
            performance
          </p>
        </div>
        <Button
          sx={{ border: "1px solid #E5E7EB" }}
          className="flex items-center text-gray-700 gap-2 px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          <i className="ri-refresh-line"></i> Refresh Status
        </Button>
      </div>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          aria-label="social accounts tabs"
        >
          {["all", "connected", "pending", "issues"].map((tab) => (
            <Tab
              key={tab}
              value={tab}
              label={`${tab.charAt(0).toUpperCase() + tab.slice(1)} (${
                getTabCount(tab)
              })`}
              sx={{ textTransform: "none", fontWeight: 500 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Search & Sort */}
      <div className="flex justify-between items-center my-6">
        <div className="relative">
          <i className="ri-search-line absolute left-2 top-1 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search accounts..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Recently Added</option>
              <option>Alphabetical</option>
              <option>Performance</option>
            </select>
            <i className="ri-arrow-down-line absolute right-2 top-3 text-gray-400 pointer-events-none"></i>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white rounded-3xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${account.bgColor} flex items-center justify-center text-white text-xl`}
                >
                  {account.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {account.platform}
                  </h3>
                  <p className="text-sm text-gray-500">{account.handle}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  account.status
                )}`}
              >
                {account.status}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Account Health</span>
                <span className={`text-sm font-medium ${account.health.color}`}>
                  {account.health.label} ({account.health.score}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    account.health.score >= 90
                      ? "bg-green-500"
                      : account.health.score >= 70
                      ? "bg-blue-500"
                      : account.health.score >= 50
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${account.health.score}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Followers</p>
                <p className="font-semibold text-gray-900">
                  {account.followers}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Engagement</p>
                <p className="font-semibold text-gray-900">
                  {account.engagement}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Sync</p>
                <p className="font-semibold text-gray-900">
                  {account.lastSync}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                sx={{ border: "1px solid #E5E7EB" }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Manage
              </Button>
              <Button
                sx={{ border: "1px solid #E5E7EB" }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                {account.status === "Pending"
                  ? "Check Status"
                  : account.status === "Error"
                  ? "Reconnect"
                  : "Disconnect"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Account Health Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Health Overview
          </h3>
          <div className="space-y-4">
            {[
              { name: "Instagram", score: 92, color: "bg-green-500" },
              { name: "Facebook", score: 85, color: "bg-blue-500" },
              { name: "X", score: 76, color: "bg-blue-500" },
              { name: "LinkedIn", score: 95, color: "bg-green-500" },
              { name: "YouTube", score: 45, color: "bg-red-500" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-900">
                  {item.name}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {item.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-gray-900">
              Health Factors
            </h4>
            <div className="space-y-2 text-sm">
              {[
                { color: "bg-green-500", label: "API connection status" },
                { color: "bg-orange-500", label: "Authentication validity" },
                { color: "bg-blue-500", label: "Permission scopes" },
                { color: "bg-yellow-500", label: "Content posting frequency" },
                { color: "bg-red-500", label: "YouTube API rate limits" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${f.color}`}></div>
                  <span className="text-gray-600">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Connection Status
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-900">
                    Platform
                  </th>
                  <th className="text-left py-2 font-medium text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-2 font-medium text-gray-900">
                    Last Sync
                  </th>
                  <th className="text-left py-2 font-medium text-gray-900">
                    API Health
                  </th>
                  <th className="text-left py-2 font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {connectionStatus.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                                        <div
                  className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center text-white text-xl`}
                >
                  {item.icon}
                </div>
                        <span className="font-medium text-gray-900">
                          {item.platform}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">{item.lastSync}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.health === "Healthy"
                              ? "bg-green-500"
                              : item.health === "Awaiting"
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span
                          className={`text-sm ${getHealthColor(item.health)}`}
                        >
                          {item.health}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Button>
                        {item.status === "Connected"
                          ? "Refresh"
                          : item.status === "Pending"
                          ? "Check Status"
                          : "Reconnect"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 mt-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Permission Settings</h2>
            <p className="text-gray-600 mt-1">Configure what Woxox can do with your connected accounts</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">Post on your behalf</h3>
              <p className="text-sm text-gray-500">Allow Woxox to publish content to your accounts</p>
            </div>
            <Switch
              checked={permissions.postOnBehalf}
              onChange={(e) => setPermissions({...permissions, postOnBehalf: e.target.checked})}
              color="primary"
            />
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">Read analytics data</h3>
              <p className="text-sm text-gray-500">Access performance metrics and insights</p>
            </div>
            <Switch
              checked={permissions.readAnalytics}
              onChange={(e) => setPermissions({...permissions, readAnalytics: e.target.checked})}
              color="primary"
            />
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">Manage followers</h3>
              <p className="text-sm text-gray-500">View and interact with your audience</p>
            </div>
            <Switch
              checked={permissions.manageFollowers}
              onChange={(e) => setPermissions({...permissions, manageFollowers: e.target.checked})}
              color="primary"
            />
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">Access direct messages</h3>
              <p className="text-sm text-gray-500">Read and respond to messages</p>
            </div>
            <Switch
              checked={permissions.accessDirectMessages}
              onChange={(e) => setPermissions({...permissions, accessDirectMessages: e.target.checked})}
              color="primary"
            />
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-medium text-gray-900">Automated responses</h3>
              <p className="text-sm text-gray-500">Enable AI-powered comment replies</p>
            </div>
            <Switch
              checked={permissions.automatedResponses}
              onChange={(e) => setPermissions({...permissions, automatedResponses: e.target.checked})}
              color="primary"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <Button variant="outlined" sx={{ borderColor: '#E5E7EB', color: '#374151' }}>
            Apply to All Accounts
          </Button>
        </div>
      </div>

      {/* Connect New Account */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Connect New Account</h2>
          <p className="text-gray-600 mt-1">Select a platform to connect a new social media account</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {connectPlatforms.map((platform) => (
            <div
            key={platform.name}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
            <div className={`w-8 h-8 rounded-full ${platform.color} flex items-center justify-center text-white text-lg flex-shrink-0`}>
                <i className={platform.icon}></i>
            </div>
            <span className="text-sm font-medium text-gray-900">{platform.name}</span>
            </div>
          ))}
        </div>
        
        <div className="rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Connection Process</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <span className="text-sm text-gray-600">Select the platform you want to connect</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <span className="text-sm text-gray-600">Authorize Woxox to access your account</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <span className="text-sm text-gray-600">Configure permissions and settings</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">4</div>
              <span className="text-sm text-gray-600">Start managing your account from Woxox</span>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Team Access Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Team Access Management</h2>
            <p className="text-gray-600 mt-1">Manage team member permissions for your social accounts</p>
          </div>
          <Button
            variant="outlined"
            startIcon={<i class="ri-user-add-line"></i>}
            sx={{ borderColor: '#E5E7EB', color: '#374151' }}
          >
            Add Team Member
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Team Member</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Instagram</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Facebook</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">X</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">LinkedIn</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-gray-900">{member.role}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Chip
                      label={member.permissions.instagram.level}
                      size="small"
                      sx={{
                        backgroundColor: member.permissions.instagram.color,
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <Chip
                      label={member.permissions.facebook.level}
                      size="small"
                      sx={{
                        backgroundColor: member.permissions.facebook.color,
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <Chip
                      label={member.permissions.x.level}
                      size="small"
                      sx={{
                        backgroundColor: member.permissions.x.color,
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <Chip
                      label={member.permissions.linkedin.level}
                      size="small"
                      sx={{
                        backgroundColor: member.permissions.linkedin.color,
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <Button
                      variant="text"
                      size="small"
                      sx={{ color: '#3B82F6' }}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
  );
};

export default SocialAccountsDashboard;
