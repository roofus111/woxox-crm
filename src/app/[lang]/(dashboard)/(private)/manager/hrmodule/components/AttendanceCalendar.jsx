import React, { useState, useEffect } from 'react';
import { Tooltip, FormControl, InputLabel, Select, MenuItem, Typography } from "@mui/material";
import axios from 'axios';

const AttendanceCalendar = ({ employeeId }) => {
    const [selectedYear, setSelectedYear] = useState(2025);
    const [attendanceData, setAttendanceData] = useState(null);
    const [error, setError] = useState(null);

    // Function to get color based on attendance level
    const getAttendanceColor = (level) => {
        switch (level) {
            case 0: return '#d4d2d2';
            case 1: return '#0e4429';
            case 2: return '#006d32';
            case 3: return '#26a641';
            case 4: return '#39d353';
            default: return '#161b22';
        }
    };

    const sundayColor = '#ff6666'; // Offred color for Sundays
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDateForCell = (month, day, occurrence) => {
        const monthMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
        const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        const monthIndex = monthMap[month];
        const firstDayOfMonth = new Date(selectedYear, monthIndex, 1);
        const offset = firstDayOfMonth.getDay(); // How many days to go back to hit Sunday
        const startDate = new Date(selectedYear, monthIndex, 1 - offset);
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + (occurrence - 1) * 7 + dayMap[day]);
        return cellDate;
    };

    // Create an empty mapping (all attendance levels set to 0)
    const createEmptyMapping = () => {
        const mapping = {};
        months.forEach(month => {
            mapping[month] = {};
            days.forEach(day => {
                mapping[month][day] = {};
                for (let occurrence = 1; occurrence <= 6; occurrence++) {
                    mapping[month][day][occurrence] = 0;
                }
            });
        });
        return mapping;
    };

    useEffect(() => {
        if (!employeeId) return;

        const token = localStorage.getItem("token");

        const fetchAttendance = async () => {
            try {
                const startDate = new Date(selectedYear, 0, 1).toISOString();
                const endDate = new Date(selectedYear, 11, 31).toISOString();

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/employee/${employeeId}?startDate=${startDate}&endDate=${endDate}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = response.data;

                // Initialize mapping: mapping[month][day][occurrence] = 0
                const mapping = createEmptyMapping();

                // Process attendance records (assumed to be in selectedYear)
                data.attendance.forEach(record => {
                    const recordDate = new Date(record.date);
                    const recordMonthIndex = recordDate.getMonth();
                    const recordMonthAbbr = months[recordMonthIndex];
                    const dayIndex = recordDate.getDay();
                    const dayAbbr = days[dayIndex];

                    // Calculate the week occurrence in the month
                    const firstCellDate = getDateForCell(recordMonthAbbr, dayAbbr, 1);
                    if (recordDate < firstCellDate) return;
                    const diffDays = Math.floor((recordDate - firstCellDate) / (1000 * 60 * 60 * 24));
                    const occurrence = Math.floor(diffDays / 7) + 1;

                    const level = record.status === 'Present' ? 4 : 0;
                    if (mapping[recordMonthAbbr] && mapping[recordMonthAbbr][dayAbbr]) {
                        mapping[recordMonthAbbr][dayAbbr][occurrence] = level;
                    }
                });

                setAttendanceData(mapping);
            } catch (err) {
                console.error(err);
                // Instead of setting an error, set an empty mapping so that the calendar renders with correct dates but no attendance.
                setAttendanceData(createEmptyMapping());
            }
        };

        fetchAttendance();
    }, [employeeId, selectedYear]);

    if (!attendanceData) return <div>Loading...</div>;

    return (
        <div className="w-full">
            {/* Year selection and heading */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-3">
                <FormControl variant="outlined" size="small">
                    <InputLabel id="year-select-label"></InputLabel>
                    <Select
                        labelId="year-select-label"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        label="Year"
                    >
                        {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027].map((yr) => (
                            <MenuItem key={yr} value={yr}>
                                {yr}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            {/* Scrollable container with hint text for small devices */}
            <div className="relative">
                <div className="md:hidden text-xs text-gray-500 italic mb-1 text-center">
                    Swipe left-right to view all months
                </div>
                <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="bg-white border border-gray-200 p-3 rounded-lg" style={{ minWidth: '900px' }}>
                        {/* Month labels */}
                        <div className="flex text-gray-400 text-xs mb-1">
                            <div className="w-8"></div>
                            {months.map(month => (
                                <div key={month} className="flex-1 text-center">{month}</div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div>
                            {days.map(day => (
                                <div key={day} className="flex mb-1 items-center">
                                    <div className="w-8 text-gray-400 text-xs sticky left-0 bg-white z-10">{day}</div>
                                    {months.map(month => (
                                        <div key={`${day}-${month}`} className="flex-1 flex justify-center">
                                            {[1, 2, 3, 4, 5, 6].map(occurrence => {
                                                const cellDate = getDateForCell(month, day, occurrence);
                                                const tooltipTitle = `${cellDate.toLocaleString('default', { month: 'short' })} ${cellDate.getDate()} (${day})`;
                                                const monthMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
                                                const currentMonthIndex = monthMap[month];
                                                const cellAttendanceLevel = cellDate.getMonth() === currentMonthIndex
                                                    ? attendanceData[month][day][occurrence]
                                                    : 0;
                                                const cellColor = day === 'Sun'
                                                    ? sundayColor
                                                    : getAttendanceColor(cellAttendanceLevel);
                                                return (
                                                    <Tooltip key={`${day}-${month}-${occurrence}`} title={tooltipTitle}>
                                                        <div className="w-2 h-2 m-[1.5px] rounded-xs" style={{ backgroundColor: cellColor }} />
                                                    </Tooltip>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-2 text-xs text-gray-400">
                            <div className="mb-1 sm:mb-0">Learn how we count Attendance</div>
                            <div className="flex items-center">
                                <span className="mr-1">Less</span>
                                {[0, 1, 2, 3, 4].map(level => (
                                    <div key={`legend-${level}`} className="w-2 h-2 mx-0.5 rounded-xs" style={{ backgroundColor: getAttendanceColor(level) }} />
                                ))}
                                <span className="ml-1">More</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceCalendar;
