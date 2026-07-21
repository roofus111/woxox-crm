'use client'

import { useEffect, useState, useMemo } from 'react';

const CDLeads = () => {
    const [leads, setLeads] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1,
        perPage: 3000
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filterRedFlag, setFilterRedFlag] = useState('all');

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/webhook/leads?page=${pagination.currentPage}&limit=${pagination.perPage}`);
            const result = await response.json();
            setLeads(result.data.leads);
            setPagination(result.data.pagination);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [pagination.currentPage, pagination.perPage]);

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const handleRefresh = () => {
        fetchLeads();
    };

    const getInsights = () => {
        const statusCounts = leads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {});

        const redLeadsCount = leads.filter(lead => {
            const noteContent = lead.notes?.[0]?.content?.toLowerCase() || '';
            return (
                (noteContent.includes('number') &&
                    (noteContent.includes('tamil nadu') ||
                        noteContent.includes('tamilnadu') ||
                        noteContent.includes('karnataka') ||
                        noteContent.includes('karanta'))
                ) ||
                noteContent.includes('not a lead for us') ||
                noteContent.includes('kerala consultancy')
            );
        }).length;

        return { statusCounts, redLeadsCount };
    };

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const noteContent = lead.notes?.[0]?.content?.toLowerCase() || '';
            const isRedFlagged = (
                (noteContent.includes('number') &&
                    (noteContent.includes('tamil nadu') ||
                        noteContent.includes('tamilnadu') ||
                        noteContent.includes('karnataka') ||
                        noteContent.includes('karanta'))
                ) ||
                noteContent.includes('not a lead for us') ||
                noteContent.includes('kerala consultancy')
            );

            const matchesSearch =
                lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.phone.includes(searchTerm);
            const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
            const matchesRedFlag = filterRedFlag === 'all' ||
                (filterRedFlag === 'red' && isRedFlagged) ||
                (filterRedFlag === 'normal' && !isRedFlagged);

            return matchesSearch && matchesStatus && matchesRedFlag;
        });
    }, [leads, searchTerm, filterStatus, filterRedFlag]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Phone', 'Status', 'Program', 'Country', 'Created At'];
        const csvData = filteredLeads.map(lead => [
            lead.name,
            lead.email,
            lead.phone,
            lead.status,
            lead.profile?.programOfInterest || '-',
            lead.profile?.countryOfInterest || '-',
            new Date(lead.createdAt).toLocaleDateString()
        ]);

        const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-export-${new Date().toISOString()}.csv`;
        a.click();
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Publisher Page - CollegeDunia (2504)</h1>
                <div className="flex gap-3">
                    {/* <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Export CSV
                    </button> */}
                    <button
                        onClick={handleRefresh}
                        className="p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm"
                        title="Refresh data"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="animate-spin duration-1000"
                        >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="mb-6 flex gap-4">
                <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded-lg flex-grow"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="all">All Status</option>
                    {Object.keys(getInsights().statusCounts).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
                <select
                    value={filterRedFlag}
                    onChange={(e) => setFilterRedFlag(e.target.value)}
                    className="px-4 py-2 border rounded-lg bg-white"
                >
                    <option value="all">All Leads</option>
                    <option value="red" className="text-red-600">Invaild</option>
                    <option value="normal">Valid Leads</option>
                </select>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Leads</h3>
                    <p className="text-2xl font-bold">{pagination.total}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Status Distribution</h3>
                    <div className="space-y-1">
                        {Object.entries(getInsights().statusCounts).map(([status, count]) => (
                            <div key={status} className="flex justify-between">
                                <span>{status}:</span>
                                <span className="font-semibold">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Invalid Leads</h3>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-red-600">{getInsights().redLeadsCount}</p>
                        <p className="text-gray-500 text-sm">leads</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Current Page</h3>
                    <p className="text-2xl font-bold">{pagination.currentPage} of {pagination.totalPages}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full mb-48">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-6 py-3 border-b cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('name')}
                            >
                                Sl.No {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 border-b text-left">Name</th>
                            <th className="px-6 py-3 border-b text-left">Email</th>
                            <th className="px-6 py-3 border-b text-left">Phone</th>
                            <th className="px-6 py-3 border-b text-left">State</th>
                            <th className="px-6 py-3 border-b text-left">District</th>
                            <th className="px-6 py-3 border-b text-left">Program & Country</th>
                            <th className="px-6 py-3 border-b text-left">Notes</th>
                            <th className="px-6 py-3 border-b text-left">Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.map((lead, index) => {
                            const noteContent = lead.notes?.[0]?.content?.toLowerCase() || '';
                            const isStateNumber = (
                                (noteContent.includes('number') &&
                                    (noteContent.includes('tamil nadu') ||
                                        noteContent.includes('tamilnadu') ||
                                        noteContent.includes('karnataka') ||
                                        noteContent.includes('karanta'))
                                ) ||
                                noteContent.includes('not a lead for us') ||
                                noteContent.includes('kerala consultancy')
                            );

                            // Check if lead is created within last 24 hours
                            const isNew = (new Date() - new Date(lead.createdAt)) < 24 * 60 * 60 * 1000;

                            return (
                                <tr key={lead._id}
                                    className={`hover:bg-gray-50 ${isStateNumber ? 'text-red-600' : ''}`}
                                >
                                    <td className="px-6 py-4 border-b">
                                        {(pagination.currentPage - 1) * pagination.perPage + index + 1}
                                    </td>
                                    <td className="px-6 py-4 border-b">{lead.name}</td>
                                    <td className="px-6 py-4 border-b">{lead.email}</td>
                                    <td className="px-6 py-4 border-b">{lead.phone}</td>
                                    <td className="px-6 py-4 border-b">{lead.additionalFields?.["profile.state"] || '-'}</td>
                                    <td className="px-6 py-4 border-b">{lead.additionalFields?.["profile.city"] || '-'}</td>
                                    <td className="px-6 py-4 border-b">{lead.additionalFields?.["profile.programOfInterest"] + " in " + lead.additionalFields?.["profile.countryOfInterest"] || '-'}</td>
                                    <td className="px-6 py-4 border-b">
                                        {lead.notes && lead.notes.length > 0 ? (
                                            <div className="group relative">
                                                <div className={`cursor-pointer ${isStateNumber ? 'text-red-600' : 'text-blue-600'}`}>
                                                    Latest Note ↗
                                                </div>
                                                <div className="hidden group-hover:block absolute z-10 bg-black text-white p-2 rounded shadow-lg min-w-[200px] max-w-[300px] left-0">
                                                    <p className="font-bold">{lead.notes[0].author}</p>
                                                    <p>{lead.notes[0].content}</p>
                                                    <p className="text-xs text-gray-300 mt-1">
                                                        {new Date(lead.notes[0].timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 border-b">
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    Showing {filteredLeads.length} of {pagination.total} results
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CDLeads;
