'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {userHeaderList, useNavigationList} from "@/hooks"
import { CiUser } from "react-icons/ci";
import { IoIosLogOut, IoMdNotifications, IoMdClose, IoMdAlert   } from "react-icons/io";
import { it } from 'node:test';

export const Header = () =>{
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [profileOpen, setprofileOpen] = useState(false)
    const { headerList } = userHeaderList();
    const {navigationList} = useNavigationList();

    const profileItem = [
        { id: '1', name: 'Profile', path: '/profile' },
        { id: '2', name: "Log out", path: '/'}
      ];

    return(
        <header className="relative w-full  md:bg-[#000000] p-4 md:px-6 border-b-[0.5px] border-[#1a1a1a] bg-gray-900 ">
            <div className="mx-auto flex items-center justify-between">
                <div className='flex space-x-16'>
                    <p className="text-gray-200 font-semibold font-cleanow text-sm md:text-xl text-shadow-[-3px_3px_#054642] ">
                        <span className='font-bold text-gray-50 text-3xl'>RDO</span>
                    </p>
                    {/* <nav className="hidden md:flex items-center space-x-8 md:pr-5">
                        {headerList.map(({text, href, id}) => (
                            <Link
                                key={id}
                                href={href}
                                className={`text-gray-300 hover:text-white transition-colors ${pathname === href ? 'text-white border-b-2 border-[#f7c709]' : ''
                                }`}
                            >
                                {text}
                            </Link>
                        ))}
                        
                    </nav> */}
                </div>
                <div className='flex space-x-4'>
                    <Link href = "/login" className=' text-white border-gray-100 border-[0.5px] px-4 py-2 rounded-xl font-bold'>Sign In</Link>
                    <Link href = "/signup" className=' bg-gray-100 text-gray-900 font-bold px-4 py-2 rounded-xl'>Sign Up</Link>
                    <button  className='hover:text-gray-200 hover:cursor-pointer text-white' 
                        onClick={() => setNotificationOpen(!notificationOpen)}><IoMdNotifications size = "2em"/>
                    </button>
                </div>
                
                <div className='flex items-center space-x-5 md:hidden'>
                    <button  className='hover:text-white hover:cursor-pointer text-gray-900' 
                    onClick={() => setNotificationOpen(!notificationOpen)}><IoMdNotifications size = "1.5em"/></button>
                    <div className='rounded-[8px] bg-gray-200 p-2' onClick={() => setprofileOpen(!profileOpen)}>
                        <Link href = "/profile" className='hover:text-white text-white bg-blue-600 p-3 rounded-full w-[6px] h-[6px] flex justify-center items-center'>Ts</Link>
                    </div>
                    
                </div>
                <button
                    className="md:hidden text-gray-900 md:text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    {mobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                    </svg>
                </button>
        
                
            </div>
            {mobileMenuOpen && (
            <div className="md:hidden bg-gray-100 md:bg-[#000C26] py-4 px-4 text-[14px]">
                <nav className="flex flex-col space-y-4">
                {navigationList.map(({text, href, id}) => (
                    <Link
                    key={id}
                    href={href}
                    className={`text-gray-900 md:text-gray-300 hover:bg-gray-300 md:hover:bg-gray-800 cursor-pointer transition-colors 
                        ${pathname === href ? `rounded-r-2xl p-2 text-gray-700 md:text-white border-l-2 border-[#60EBEB] bg-gray-800' ${id === 1 ? 'text-[#60EBEB]' : 'text-gray-700 md:text-white'}` : 'p-2 rounded-2xl' }
                        `}
                    onClick={() => setMobileMenuOpen(false)}
                    >
                    {text}
                    </Link>
                ))}
                </nav>
            </div>
            )}
            {notificationOpen && (
                <div className='absolute z-50 top-17 right-0 transform  h-screen  w-full md:w-1/5 bg-gray-900 translate-y-[0.5px] border-l-[0.5px] border-gray-700'>
                    <div className='flex justify-between md:p-8'>
                        <h1 className='text-[15px] font-bold md:text-2xl'>Notifications</h1>
                        <button className='hover:cursor-pointer' onClick={()=> setNotificationOpen(false)}><IoMdClose className='text-gray-300 hover:text-gray-100' size="1.2em" /></button>
                    </div>
                    <div className='flex flex-col p-4 space-y-5'>
                        <div className='flex p-2 bg-[#000C26] border-[0.5px] border-gray-400 rounded-[10px] items-center space-x-2'>
                            <IoMdAlert className='text-blue-500' size= "2em"/>
                            <span className='text-gray-100'>Your Vault was rebalanced</span>
                        </div>
                        <div className='flex p-2 bg-[#000C26] border-[0.5px] border-gray-400 rounded-[10px] items-center space-x-2'>
                            <IoMdAlert className='text-blue-500' size= "2em"/>
                            <span className='text-gray-100'>New Vault Open for Subscriptions</span>
                        </div>
                    </div>

                </div>
            )}
            {profileOpen && (
                <div className="md:hidden bg-gray-100 md:bg-[#000C26] py-4 px-4 text-[14px] space-y-2">
                    <div className='flex space-x-1 text-gray-700 items-center border-b-[0.5px] border-gray-300'>
                        <div className='hover:text-white text-white bg-blue-600 p-4 rounded-full w-[20px] h-[20px] flex justify-center items-center'>TS</div>
                        <div className='flex flex-col'>
                            <p className='font-bold text-[14px]'>Taylor Smith</p>
                            <p className='text-[12px]'>taylor.smith@example.com</p>
                        </div>
                    </div>
                    
                    <nav className="flex flex-col space-y-4">
                    {profileItem.map((items) => (
                        <Link
                        key = {items.id}
                        href={items.path}
                        className="text-gray-900 md:text-gray-300 hover:bg-gray-300 cursor-pointer transition-colors p-2 rounded-2xl"
                        onClick={() => setMobileMenuOpen(false)}
                        >
                        {items.name}
                        </Link>
                    ))}
                    </nav>
                </div>
            )}
        </header>
    )
}