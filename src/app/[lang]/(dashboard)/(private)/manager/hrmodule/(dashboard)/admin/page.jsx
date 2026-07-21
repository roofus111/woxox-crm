import React from 'react'
import UserCard from '../../components/UserCard'
import CountCharts from '../../components/CountCharts'
const page = () => {
    return (
        <div className='p-4 flex flex-col gap-4 md:flex-row'>
            {/* left */}

            <div className='w-full lg:w-2/3 flex flex-col gap-8'>
                <div className='flex gap-4 justify-between flex-wrap'>
                    <UserCard type="staff" />
                    <UserCard type="staff" />
                    <UserCard type="staff" />
                    <UserCard type="staff" />
                </div>
                {/* middle charts */}
                <div className='flex gap-4 flex-col lg:flex-row'>
                    {/* count charts */}
                    <div className='w-full lg:w-1/3 h-[450px]'>
                        <CountCharts />
                    </div>
                    {/* attendance chart */}
                    <div className='w-full lg:w-2/3 h-[450px]'></div>
                </div>
                {/* bottom charts */}
            </div>
            {/* right */}

            <div className='w-full lg:w-1/3'></div>

        </div>
    )
}

export default page
