'use client'

import React, { useState } from 'react';

const EmployeeDetails = () => {
    const [activeTab, setActiveTab] = useState('Time off');

    // Mock data for all tabs
    const mockData = {
        personalDetails: {
            basic: {
                email: 'royal.parvej@company.com',
                phone: '+33 755 853 221',
                address: '24 Rue de la République, 75001 Paris, France',
                birthday: '1990-05-15',
                nationality: 'French',
                maritalStatus: 'Married'
            },
            emergency: {
                name: 'Marie Parvej',
                relationship: 'Spouse',
                phone: '+33 755 853 222'
            },
            education: [
                {
                    degree: "Master's in Business Administration",
                    institution: 'Paris Business School',
                    year: '2012-2014'
                },
                {
                    degree: "Bachelor's in Economics",
                    institution: 'University of Paris',
                    year: '2008-2012'
                }
            ]
        },
        jobInformation: {
            position: 'Senior Marketing Manager',
            department: 'Marketing',
            reportingTo: 'Sarah Wilson',
            employmentType: 'Full-time',
            startDate: '2020-03-15',
            location: 'Paris Office',
            salary: {
                base: '75,000 EUR',
                bonus: '10%',
                reviews: 'Annual'
            }
        },
        salaryDetails: {
            current: {
                basic: 75000,
                allowances: 5000,
                bonus: 7500,
                total: 87500
            },
            history: [
                {
                    date: '2023-01-01',
                    type: 'Annual Increment',
                    previous: 70000,
                    new: 75000,
                    percentage: '7.14%'
                },
                {
                    date: '2022-01-01',
                    type: 'Annual Increment',
                    previous: 65000,
                    new: 70000,
                    percentage: '7.69%'
                }
            ]
        },
        payHistory: [
            {
                month: 'April 2024',
                basic: 6250,
                allowances: 416.67,
                deductions: 1200,
                netPay: 5466.67,
                status: 'Paid',
                paymentDate: '2024-04-30'
            },
            {
                month: 'March 2024',
                basic: 6250,
                allowances: 416.67,
                deductions: 1200,
                netPay: 5466.67,
                status: 'Paid',
                paymentDate: '2024-03-31'
            }
        ],
        documents: [
            {
                name: 'Employment Contract',
                type: 'PDF',
                uploadDate: '2020-03-15',
                size: '2.5 MB',
                status: 'Verified'
            },
            {
                name: 'ID Card',
                type: 'JPG',
                uploadDate: '2020-03-15',
                size: '1.2 MB',
                status: 'Verified'
            },
            {
                name: 'Resume',
                type: 'PDF',
                uploadDate: '2020-03-15',
                size: '890 KB',
                status: 'Verified'
            }
        ],
        performance: {
            currentRating: 4.5,
            reviews: [
                {
                    period: '2023 Annual Review',
                    rating: 4.5,
                    reviewer: 'Sarah Wilson',
                    date: '2023-12-15',
                    strengths: ['Leadership', 'Innovation', 'Communication'],
                    improvements: ['Technical Skills'],
                    comments: 'Excellent performance in team leadership and project management.'
                },
                {
                    period: '2023 Mid-Year Review',
                    rating: 4.2,
                    reviewer: 'Sarah Wilson',
                    date: '2023-06-15',
                    strengths: ['Project Management', 'Team Collaboration'],
                    improvements: ['Documentation', 'Technical Skills'],
                    comments: 'Good progress in team management and project delivery.'
                }
            ],
            goals: [
                {
                    title: 'Launch Q2 Marketing Campaign',
                    status: 'In Progress',
                    dueDate: '2024-06-30',
                    progress: 65
                },
                {
                    title: 'Team Training Program',
                    status: 'Completed',
                    dueDate: '2024-03-31',
                    progress: 100
                }
            ]
        }
    };


    const renderTabContent = () => {
        switch (activeTab) {
            case 'Personal details':
                return (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <i className="ri-mail-line w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Email</div>
                                        <div>{mockData.personalDetails.basic.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <i className="ri-phone-line w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Phone</div>
                                        <div>{mockData.personalDetails.basic.phone}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <i className="ri-map-pin-line w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm text-gray-500">Address</div>
                                        <div>{mockData.personalDetails.basic.address}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <div className="text-sm text-gray-500">Name</div>
                                        <div>{mockData.personalDetails.emergency.name}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <div className="text-sm text-gray-500">Phone</div>
                                        <div>{mockData.personalDetails.emergency.phone}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Education</h3>
                            <div className="space-y-4">
                                {mockData.personalDetails.education.map((edu, index) => (
                                    <div key={index} className="flex items-start space-x-3">
                                        <i className="ri-graduation-cap-line w-5 h-5 text-gray-400" />
                                        <div>
                                            <div className="font-medium">{edu.degree}</div>
                                            <div className="text-sm text-gray-500">{edu.institution}</div>
                                            <div className="text-sm text-gray-500">{edu.year}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'Job Information':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center space-x-3">
                                <i className="ri-briefcase-line w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-500">Position</div>
                                    <div className="font-medium">{mockData.jobInformation.position}</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <i className="ri-building-line w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-500">Department</div>
                                    <div className="font-medium">{mockData.jobInformation.department}</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <i className="ri-calendar-line w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-500">Start Date</div>
                                    <div className="font-medium">{mockData.jobInformation.startDate}</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <i className="ri-map-pin-line w-5 h-5 text-gray-400" />
                                <div>
                                    <div className="text-sm text-gray-500">Location</div>
                                    <div className="font-medium">{mockData.jobInformation.location}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Salary details':
                return (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Current Salary</h3>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-500">Basic</div>
                                    <div className="text-lg font-semibold">€{mockData.salaryDetails.current.basic}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-500">Allowances</div>
                                    <div className="text-lg font-semibold">€{mockData.salaryDetails.current.allowances}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-500">Bonus</div>
                                    <div className="text-lg font-semibold">€{mockData.salaryDetails.current.bonus}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-500">Total</div>
                                    <div className="text-lg font-semibold">€{mockData.salaryDetails.current.total}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Salary History</h3>
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-600">
                                        <th className="pb-4">Date</th>
                                        <th className="pb-4">Type</th>
                                        <th className="pb-4">Previous</th>
                                        <th className="pb-4">New</th>
                                        <th className="pb-4">Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockData.salaryDetails.history.map((item, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="py-4">{item.date}</td>
                                            <td className="py-4">{item.type}</td>
                                            <td className="py-4">€{item.previous}</td>
                                            <td className="py-4">€{item.new}</td>
                                            <td className="py-4">{item.percentage}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'Pay history':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-600">
                                    <th className="pb-4">Month</th>
                                    <th className="pb-4">Basic</th>
                                    <th className="pb-4">Allowances</th>
                                    <th className="pb-4">Deductions</th>
                                    <th className="pb-4">Net Pay</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4">Payment Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockData.payHistory.map((payment, index) => (
                                    <tr key={index} className="border-t">
                                        <td className="py-4">{payment.month}</td>
                                        <td className="py-4">€{payment.basic}</td>
                                        <td className="py-4">€{payment.allowances}</td>
                                        <td className="py-4">€{payment.deductions}</td>
                                        <td className="py-4">€{payment.netPay}</td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="py-4">{payment.paymentDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'Documents':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="grid grid-cols-1 gap-4">
                            {mockData.documents.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <i className="ri-file-text-line w-8 h-8 text-gray-400" />
                                        <div>
                                            <div className="font-medium">{doc.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {doc.type} • {doc.size} • Uploaded on {doc.uploadDate}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                            {doc.status}
                                        </span>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <i className="ri-download-line w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'Performance':
                return (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Current Performance</h3>
                                <div className="flex items-center space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <i
                                            key={star}
                                            className={`ri-star-line w-5 h-5 ${star <= mockData.performance.currentRating
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                    <span className="ml-2 font-medium">
                                        {mockData.performance.currentRating} / 5
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="font-medium">Current Goals</h4>
                                {mockData.performance.goals.map((goal, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-medium">{goal.title}</div>
                                            <span
                                                className={`px-2 py-1 rounded-full text-sm ${goal.status === 'Completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}
                                            >
                                                {goal.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-2">
                                            Due: {goal.dueDate}
                                        </div>
                                        <div className="relative pt-1">
                                            <div className="flex mb-2 items-center justify-between">
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-semibold">
                                                        {goal.progress}%
                                                    </span>
                                                    {' complete'}
                                                </div>
                                            </div>
                                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                                <div
                                                    style={{ width: `${goal.progress}%` }}
                                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold mb-6">Performance Reviews</h3>
                            <div className="space-y-6">
                                {mockData.performance.reviews.map((review, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <div className="font-medium">{review.period}</div>
                                                <div className="text-sm text-gray-500">
                                                    Reviewed by {review.reviewer} on {review.date}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <i
                                                        key={star}
                                                        className={`ri-star-line w-4 h-4 ${star <= review.rating
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <div className="font-medium mb-2">Strengths</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {review.strengths.map((strength, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                                                        >
                                                            {strength}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-medium mb-2">Areas for Improvement</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {review.improvements.map((improvement, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                                                        >
                                                            {improvement}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="font-medium mb-2">Comments</div>
                                            <p className="text-gray-600">{review.comments}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'Time off':
                // Time off content remains the same as in the previous version
                return (
                    <div className="space-y-6">
                        {/* Time off stats */}
                        <div className="grid grid-cols-5 gap-4">
                            {timeOffStats.map((stat, index) => (
                                <div
                                    key={index}
                                    className={`${stat.bgColor} rounded-lg p-4 flex flex-col`}
                                >
                                    <div className="mb-2">{stat.icon}</div>
                                    <div className="font-semibold">{stat.title}</div>
                                    <div className="text-sm text-gray-600">{stat.subtitle}</div>
                                </div>
                            ))}
                        </div>

                        {/* Time off tables remain the same */}
                    </div>
                );

            default:
                return null;
        }
    };

    const navItems = [
        'Personal details',
        'Job Information',
        'Time off',
        'Salary details',
        'Pay history',
        'Documents',
        'Performance'
    ];

    const timeOffStats = [
        {
            icon: <i class="ri-time-line w-5 h-5 text-purple-600" />,
            title: '06 days available',
            subtitle: 'To book time off',
            bgColor: 'bg-purple-50'
        },
        {
            icon: <i class="ri-time-line w-5 h-5 text-orange-600" />,
            title: '2 pending requests',
            subtitle: 'Awaiting admin approval',
            bgColor: 'bg-orange-50'
        },
        {
            icon: <i class="ri-calendar-line w-5 h-5 text-blue-600" />,
            title: '15 days per year',
            subtitle: 'In the contract',
            bgColor: 'bg-blue-50'
        },
        {
            icon: <i class="ri-download-line w-5 h-5 text-gray-600" />,
            title: '0 days upcoming',
            subtitle: '0 days taken',
            bgColor: 'bg-gray-50'
        },
        {
            icon: <i class="ri-gift-line w-5 h-5 text-green-600" />,
            title: '0 days extra leave',
            subtitle: 'Carryover Days / Allowances',
            bgColor: 'bg-green-50'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Employees</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900">Employee details</span>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <i className="ri-search-line w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64"
                        />
                    </div>
                    <i className="ri-bell-line w-6 h-6 text-gray-600" />
                    <div className="flex items-center space-x-2">
                        <img
                            src="/api/placeholder/32/32"
                            alt="User avatar"
                            className="w-8 h-8 rounded-full"
                        />
                        <i className="ri-arrow-down-s-line w-4 h-4 text-gray-600" />
                    </div>
                </div>
            </div>

            {/* Employee Info */}
            <div className="flex items-center space-x-4 mb-6">
                <img
                    src="/api/placeholder/48/48"
                    alt="Royal Parvej"
                    className="w-12 h-12 rounded-full"
                />
                <div>
                    <h2 className="text-xl font-semibold">Royal Parvej</h2>
                    <div className="flex items-center space-x-2">
                        <img
                            src="/api/placeholder/16/16"
                            alt="France flag"
                            className="w-4 h-4"
                        />
                        <span className="text-gray-600">France - Employee</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 mb-6">
                <ul className="flex space-x-6">
                    {navItems.map((item) => (
                        <li
                            key={item}
                            className={`pb-4 cursor-pointer ${activeTab === item
                                ? 'border-b-2 border-purple-600 text-purple-600'
                                : 'text-gray-600'
                                }`}
                            onClick={() => setActiveTab(item)}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Content Section */}
            {renderTabContent()}
        </div>
    );
};

export default EmployeeDetails;
