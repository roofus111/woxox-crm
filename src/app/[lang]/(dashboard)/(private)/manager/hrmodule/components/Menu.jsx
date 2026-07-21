import Link from 'next/link';
import React from 'react'
import {
    RiHome3Line, RiUserLine, RiParentLine, RiBookLine, RiBuilding2Line,
    RiBookletLine, RiFileList3Line, RiTaskLine, RiFileChartLine,
    RiCalendarCheckLine, RiCalendarEventLine, RiMessage2Line,
    RiMegaphoneLine, RiUser3Line, RiSettings3Line, RiLogoutBoxRLine
} from 'react-icons/ri'

const menuItems = [
    {
        title: "MENU",
        items: [
            {
                icon: RiHome3Line,
                label: "Home",
                href: "/",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: RiUserLine,
                label: "Teachers",
                href: "/list/teachers",
                visible: ["admin", "teacher"],
            },
            {
                icon: RiUserLine,
                label: "Students",
                href: "/list/students",
                visible: ["admin", "teacher"],
            },
            {
                icon: RiParentLine,
                label: "Parents",
                href: "/list/parents",
                visible: ["admin", "teacher"],
            },
            {
                icon: RiBookLine,
                label: "Subjects",
                href: "/list/subjects",
                visible: ["admin"],
            },
            {
                icon: RiBuilding2Line,
                label: "Classes",
                href: "/list/classes",
                visible: ["admin", "teacher"],
            },
            {
                icon: RiBookletLine,
                label: "Lessons",
                href: "/list/lessons",
                visible: ["admin", "teacher"],
            },
            {
                icon: RiFileList3Line,
                label: "Exams",
                href: "/list/exams",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: RiTaskLine,
                label: "Assignments",
                href: "/list/assignments",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: RiFileChartLine,
                label: "Results",
                href: "/list/results",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: RiCalendarCheckLine,
                label: "Attendance",
                href: "/list/attendance",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: RiCalendarEventLine,
                label: "Events",
                href: "/list/events",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: RiMessage2Line,
                label: "Messages",
                href: "/list/messages",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: RiMegaphoneLine,
                label: "Announcements",
                href: "/list/announcements",
                visible: ["admin", "teacher", "student", "parent"],
            },
        ],
    },
    {
        title: "OTHER",
        items: [
            {
                icon: RiUser3Line,
                label: "Profile",
                href: "/profile",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: RiSettings3Line,
                label: "Settings",
                href: "/settings",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: RiLogoutBoxRLine,
                label: "Logout",
                href: "/logout",
                visible: ["admin", "teacher", "student", "parent"],
            },
        ],
    },
];

const Menu = () => {
    return (
        <div className='mt-4 text-sm'>
            {menuItems.map(i => (
                <div className='flex flex-col gap-2' key={i.title}>
                    <span className='text-gray-400 hidden lg:block font-light my-4'>{i.title}</span>
                    {i.items.map(item => (
                        <Link href={item.href} key={item.label} className='flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2'>
                            <item.icon size={20} />
                            <span className='hidden lg:block'>{item.label}</span>
                        </Link>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default Menu
