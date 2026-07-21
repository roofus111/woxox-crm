import React from 'react'
import { RiSearchLine, RiMessage2Line, RiNotification2Line } from 'react-icons/ri'
import Image from 'next/image'

const Navbar = () => {
    return (
        <div className='flex items-center justify-between p-4'>
            {/* search bar */}
            <div className='hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2'>
                <RiSearchLine size={14} />
                <input type="text" placeholder='Search...' className='w-[200px] p-2 bg-transparent outline-none' />
            </div>
            {/* icons and profile */}
            <div className='flex items-center gap-6 justify-end w-full'>
                <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer'>
                    <RiMessage2Line size={20} />
                </div>
                <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative'>
                    <RiNotification2Line size={20} />
                    <div className='absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs'>1</div>
                </div>
                <div className='flex flex-col gap-1'>
                    <span className='text-xs leading-3 font-medium'>Akai</span>
                    <span className='text-[10px] text-gray-500 text-right'>Admin</span>
                </div>
                <Image src="/profile.png" alt="logo" width={36} height={36} className='rounded-full' />
            </div>
        </div>
    )
}

export default Navbar
