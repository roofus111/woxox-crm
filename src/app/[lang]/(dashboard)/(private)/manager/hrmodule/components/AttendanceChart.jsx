import Image from 'next/image';
import React from 'react'

import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    {
        name: 'Mon',
        present: 60,
        absent: 40,
    },
    {
        name: 'Tue',
        present: 70,
        absent: 30,
    },
    {
        name: 'Wed',
        present: 80,
        absent: 20,
    },
    {
        name: 'Thu',
        present: 90,
        absent: 10,
    },
    {
        name: 'Fri',
        present: 50,
        absent: 40,
    },
    {
        name: 'Sat',
        present: 75,
        absent: 25,
    },
];


const AttendanceChart = () => {
    return (
        <div>
            <div className=''>
                <h1>Attendence</h1>
                <Image src="/moreDark.png" alt='at' width={20} height={20} />
            </div>
        </div>
    )
}

export default AttendanceChart
