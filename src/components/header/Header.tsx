'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useNavigationList} from "@/hooks"
import {  IoMdNotifications, IoMdClose, IoMdAlert   } from "react-icons/io";

export const Header = () =>{
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const {navigationList} = useNavigationList();
    const [loading, setLoading] = useState(true);
    const [taoPrice, setTaoPrice] = useState(null);

    useEffect(() => {
        async function fetchPrice() {
        try {
            const res = await fetch("/api/tao-price");
            const data= await res.json();
            setTaoPrice(data.data.data[0].price);
        } catch (err) {
            console.error("Failed to fetch TAO price:", err);
        } finally {
            setLoading(false);
        }
        }

        fetchPrice();
    }, []);


    return(
        <header className="relative w-full  md:bg-[#000000] p-4 md:px-6 border-b-[0.5px] border-[#1a1a1a] bg-gray-900 ">
            <div className="mx-auto flex items-center justify-between">
                <div className='flex space-x-16'>
                    <p className="text-gray-200 font-semibold font-cleanow text-sm md:text-xl text-shadow-[-3px_3px_#054642] ">
                        <span className='font-bold text-gray-50 text-4xl'>Y S</span>
                    </p>
                    <p className='font-bold text-gray-50 text-3xl'>💰 TAO Price: {taoPrice}</p>
                </div>
                <div className='flex space-x-4'>
                    <Link href = "/login" className=' text-white border-gray-100 border-[0.5px] px-4 py-2 rounded-xl font-bold text-sm md:text-ls'>Sign In</Link>
                    <Link href = "/signup" className=' bg-gray-100 text-gray-900 font-bold px-4 py-2 rounded-xl text-sm md:text-ls'>Sign Up</Link>
                    <button  className='hover:text-gray-200 hover:cursor-pointer text-white' 
                        onClick={() => setNotificationOpen(!notificationOpen)}><IoMdNotifications size = "2em"/>
                    </button>
                </div>
                
            </div>
            {mobileMenuOpen && (
            <div className="md:hidden bg-gray-100 md:bg-[#000C26] py-4 px-4 text-[14px]">
                <nav className="flex flex-col space-y-4">
                {navigationList.map(({text, href, id}) => (
                    <link
                    key={id}
                    // href={href}
                    className={`text-gray-900 md:text-gray-300 hover:bg-gray-300 md:hover:bg-gray-800 cursor-pointer transition-colors 
                        ${pathname === href ? `rounded-r-2xl p-2 text-gray-700 md:text-white border-l-2 border-[#60EBEB] bg-gray-800' ${id === 1 ? 'text-[#60EBEB]' : 'text-gray-700 md:text-white'}` : 'p-2 rounded-2xl' }
                        `}
                    onClick={() => setMobileMenuOpen(false)}
                    >
                    {text}
                    </link>
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
            
        </header>
    )
}