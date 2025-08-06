'use client';
import React from "react";
import { BsFlag, BsArrowLeft } from "react-icons/bs";
import { ArrowLeft, ArrowRight, RefreshCw, Maximize2, Copy } from 'lucide-react'
import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
const data = [
  { time: '09:00', price: 44800 },
  { time: '10:00', price: 45100 },
  { time: '11:00', price: 44500 },
  { time: '12:00', price: 45500 },
  { time: '13:00', price: 46000 },
  { time: '14:00', price: 46800 },
  { time: '15:00', price: 47500 },
  { time: '16:00', price: 48200 },
]
export default function Home() {

  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className="flex flex-col w-full  space-y-20">
      <div className="middle py-10 flex  border-b-[0.5px] border-[#1a1a1a]">
        <div className="flex px-5 md:px-20 justify-between w-full ">
          <div className="flex flex-col space-y-8 items-start">
            <div className=" flex space-x-3 align-middle items-center">
              <BsArrowLeft size = "1em" />
              <span className="text-gray-400 text-sm ">Back</span>
            </div>
            <div className="flex flex-col space-y-4">
              <h2 className="font-bold text-gray-100 text-sm md:text-xl">RDO Landing Page</h2>
              <span className="text-sm text-gray-400">6.9k Forks</span>
            </div>
          </div>
          <div className="flex space-x-4 pl-10 py-10 md:p-10 items-center justify-end">
            <span className="flex items-center align-middle  rounded-xl border-[0.5px] border-gray-500 text-gray-50 font-bold px-2 py-1">
              <BsFlag size = "1em" />
            </span>
            <button className="bg-gray-200 rounded-xl p-2 text-gray-900 text-ls">Open In</button>
          </div>
        </div>
      </div>
      <div className="dashboard px-5  md:px-20">
          <div className="flex flex-col shadow-sm border border-[#1a1a1a] rounded-t-xl h-fit">
            <div className="w-full bg-[#0f0f0f] rounded-t-xl px-4 py-2 flex items-center justify-between ">
              <div className="flex items-center gap-2 text-gray-400">
                <ArrowLeft size={14} />
                <ArrowRight size={14} />
                <RefreshCw size={14} />
              </div>
              <div className="bg-[#1f1f1f] rounded-full px-4 py-1 text-gray-300 text-sm w-1/2 text-center">
                /
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Copy size={14} />
                <Maximize2 size={14} />
              </div>
            </div>
            <nav className="w-full px-6 py-4 flex justify-between items-center bg-black text-white">
              <div className="flex items-center gap-2">
                <div className="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  R
                </div>
                <span className="text-sm md:text-lg font-semibold">RDO</span>
              </div>

              {/* Center Nav */}
              <ul className="hidden flex items-center gap-2 md:gap-8 text-gray-300 text-sm">
                <li className="hover:text-white cursor-pointer">Trade</li>
                <li className="hover:text-white cursor-pointer">Portfolio</li>
                <li className="hover:text-white cursor-pointer">Market</li>
              </ul>

              {/* Right Side */}
              <div className="flex items-center gap-4">
                <button onClick={() => setDarkMode(!darkMode)}>
                  {darkMode ? <Sun className="w-4 h-4 text-gray-300" /> : <Moon className="w-4 h-4 text-gray-300" />}
                </button>
                <button className="text-sm text-gray-300 hover:text-white">Log in</button>
                <button className="bg-white text-black rounded-full px-4 py-1 text-sm font-semibold hover:opacity-90 transition">
                  Get Started →
                </button>
              </div>
            </nav>
            {/* <div className="bg-black text-white p-6 rounded-xl shadow-md w-full px-5 md:px-30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm md:text-xl font-bold">BTC/USD</h2>
                <span className="text-yellow-400 text-sm md:text-lg font-semibold">$48,200</span>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid stroke="#333" vertical={false} />
                  <XAxis dataKey="time" stroke="#888" />
                  <YAxis stroke="#888" domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#222', borderColor: '#444' }}
                    labelStyle={{ color: '#aaa' }}
                    itemStyle={{ color: '#ffd700' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#FFD700"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div> */}
          </div>
      </div>
    </div>
  );
}
