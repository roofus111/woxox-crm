import Image from 'next/image'
import React from 'react'

const UserCard = ({ type }) => {
    return (
        <div className='rounded-2xl odd:bg-purple-200 even:bg-yellow-200 p-4 flex-1 min-w-[130px]'>
            <div className='flex items-center justify-between'>
                <span className='text-[10px] bg-white px-2 py-1 rounded-full text-green-600'>2025/25</span>
                <Image src='/more.png' alt='more' width={20} height={20} />
            </div>
            <h1 className='text-2xl font-semibold my-4'>1,234</h1>
            <h2 className='capitalize font-medium text-sm text-gray-500'>{type}</h2>
        </div>
    )
}

export default UserCard
