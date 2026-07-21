"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import moment from "moment/moment";
import axios from "axios";
import {
  Box,
  Typography,
  Avatar,
  FormControl,
  InputLabel,
  IconButton,
  Select,
  MenuItem
} from "@mui/material";

// Helper function: Returns a "random" color based on the account's _id.
// This ensures the same account always gets the same color.
const getAvatarColor = (id) => {
  const colors = [
    "#F44336",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#03A9F4",
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFEB3B",
    "#FFC107",
    "#FF9800",
    "#FF5722"
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const Transaction = () => {
  const { id } = useParams(); // current account id from URL
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);

  // States for collapsible sections
  const [isAccountDetailsOpen, setIsAccountDetailsOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  // Fetch current account details
  useEffect(() => {
    const fetchAccountDetails = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/account/getbankaccounts/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Assuming API returns: { success: true, data: { ...account details... } }
        console.log("sanam", response.data.data);

        setAccount(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load account details");
        setLoading(false);
        console.error(err);
      }
    };

    if (id) {
      fetchAccountDetails();
    }
  }, [id]);

  // Fetch all accounts for the dropdown
  useEffect(() => {
    const fetchAllAccounts = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/account/getbankaccounts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let accountsData = response.data.data;
        if (!Array.isArray(accountsData)) {
          accountsData = [accountsData];
        }
        setAllAccounts(accountsData);
      } catch (err) {
        console.error("Failed to fetch accounts for switching", err);
      }
    };

    fetchAllAccounts();
  }, []);

  // When an account is selected from the dropdown, navigate to its page
  const handleSwitchAccount = (e) => {
    const newAccountId = e.target.value;
    router.push(`/manager/expense/transactions/${newAccountId}`);
  };

  if (loading) return <div>Loading account details...</div>;
  if (error) return <div>{error}</div>;

  const accountData = {
    accountNumber: account.accountNumber,
    ifscCode: account.ifscCode,
    accountType: account.accountType,
    accountHolder: account.accountHolder || account.accountName,
    branch: account.branch || account.branchName,
    bankName: account.bankName,
    status: account.status || (account.isActive ? "Active" : "Inactive")
  };

  const financialSummary = account.financialSummary || {
    totalReceived: account.totalReceived || 0,
    totalSent: account.totalSent || 0,
    balance: account.balance || 0
  };

  const transactionHistory = account.transactionHistory || [];

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl">
      {/* Switch Account Dropdown */}
      <Box className="p-4 flex justify-end">
        <FormControl size="small">
          <InputLabel id="switch-account-label">Account</InputLabel>
          <Select
            labelId="switch-account-label"
            label="Account"
            value={id}
            onChange={handleSwitchAccount}
          >
            {allAccounts
              .filter((acc) => acc.isActive)  // Only include active accounts
              .map((acc) => (
                <MenuItem key={acc._id} value={acc._id}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: getAvatarColor(acc._id),
                        width: 24,
                        height: 24,
                        color: "white",
                        mr: 1
                      }}
                    >
                      {acc.accountName ? acc.accountName[0] : "A"}
                    </Avatar>
                    {acc.accountName}
                  </Box>
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      {/* Account Details Section */}
      <div className="border-b -mt-8">
        <div
          className="flex items-center justify-between px-6 py-4 cursor-pointer"
          onClick={() => setIsAccountDetailsOpen(!isAccountDetailsOpen)}
        >
          <div className="flex items-center">
            {isAccountDetailsOpen ? (
              <i className="ri-arrow-down-line w-5"></i>
            ) : (
              <i className="ri-arrow-up-line w-5"></i>
            )}
            <h2 className="text-xl font-semibold ml-2 mt-2 mb-2">
              Account Details
            </h2>
          </div>
        </div>

        {isAccountDetailsOpen && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-y-4">
                  <div className="ml-7">
                    <p className="text-sm text-gray-500">ACCOUNT NUMBER</p>
                    <p className="font-medium">{accountData.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">IFSC CODE</p>
                    <p className="font-medium">{accountData.ifscCode}</p>
                  </div>
                  <div className="ml-7">
                    <p className="text-sm text-gray-500">ACCOUNT TYPE</p>
                    <p className="font-medium">{accountData.accountType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ACCOUNT HOLDER</p>
                    <p className="font-medium">{accountData.accountHolder}</p>
                  </div>
                  <div className="ml-7">
                    <p className="text-sm text-gray-500">BRANCH</p>
                    <p className="font-medium">{accountData.branch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">BANK NAME</p>
                    <p className="font-medium">{accountData.bankName}</p>
                  </div>
                </div>
              </div>

              <div className="border p-4 rounded-3xl mr-12">
                <h3 className="font-semibold mb-3">Financial Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Received:</span>
                    <span className="font-medium text-green-600">
                      ₹{financialSummary.totalReceived.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sent:</span>
                    <span className="font-medium text-red-600">
                      ₹{financialSummary.totalSent.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Balance:</span>
                      <span>
                        ₹{financialSummary.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 ml-7">
              <p className="text-sm text-gray-500">STATUS</p>
              <div className="flex items-center mt-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                <p className="font-medium">{accountData.status}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction History Section */}
      <div>
        <div
          className="flex items-center justify-between px-6 py-4 cursor-pointer"
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        >
          <div className="flex items-center">
            {isHistoryOpen ? (
              <i className="ri-arrow-down-line w-5"></i>
            ) : (
              <i className="ri-arrow-up-line w-5"></i>
            )}
            <h2 className="text-xl font-semibold ml-2">Transaction History</h2>
          </div>
        </div>

        {isHistoryOpen && (
          <div className="px-6 pb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionHistory.map((transaction, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {moment
                            .utc(transaction.timestamp)
                            .utcOffset(330)
                            .format("LL")}
                        </div>
                        <div className="text-sm text-gray-500">
                          {moment
                            .utc(transaction.timestamp)
                            .utcOffset(330)
                            .format("LT")}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.newState.type === "income"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {transaction.newState.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <span
                          className={
                            transaction.newState.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.newState.type === "income" ? "+" : "-"}₹
                          {(transaction.newState.amount ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {transaction.newState.description}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {transaction.newState.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        <IconButton>
                          <i className="ri-arrow-right-line"></i>
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transaction;
