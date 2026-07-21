'use client'

import React from 'react'
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';
import { RiMoreLine } from 'react-icons/ri';
import { BsGenderAmbiguous } from 'react-icons/bs';

const data = [
    {
        name: 'Total',
        count: 106,
        fill: 'white',
    },
    {
        name: 'employee',
        count: 53,
        fill: '#8884d8',
    },
    {
        name: 'employee',
        count: 53,
        fill: '#83a6ed',
    },
];


const CountCharts = () => {
    return (
        <div className='bg-white rounded-xl w-full h-full p-4'>
            {/* title */}
            <div className='flex items-center justify-between'>
                <h1 className='text-lg font-semibold'>Students</h1>
                <RiMoreLine size={20} className="text-gray-700" />
            </div>
            {/* chart */}
            <div className='relative w-full h-[75%]'>
                <ResponsiveContainer>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="100%" barSize={32} data={data}>
                        <RadialBar
                            background
                            dataKey="count"
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
                <BsGenderAmbiguous
                    size={50}
                    className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-600'
                />
            </div>
            {/* bottom */}
            <div className='flex justify-center gap-16'>
                <div className='flex flex-col gap-1'>
                    <div className='w-5 h-5 bg-blue-200 rounded-full' />
                    <h1 className='font-bold'>1,234</h1>
                    <h2 className='text-gray-300 text-xs'>Employee (55%)</h2>
                </div>
                <div className='flex flex-col gap-1'>
                    <div className='w-5 h-5 bg-yellow-200 rounded-full' />
                    <h1 className='font-bold'>1,234</h1>
                    <h2 className='text-gray-300 text-xs'>Employee (45%)</h2>
                </div>

            </div>
        </div>
    )
}

export default CountCharts
