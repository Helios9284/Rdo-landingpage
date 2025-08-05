import Image from "next/image";
import React from "react";
import {Recent, Portfolio, News, Chart} from "@/components"

export default function Home() {
  return (
    <div className="flex flex-col p-10 space-y-8">
      <div className="dashboard">
        <Chart />
      </div>
      <div className="flex flex-col space-y-8 border-[0.5px] border-gray-400 rounded-2xl p-8">
        <h1 className="text-3xl text-white font-bold ">Quick Trade</h1>
        <div className="button-group space-x-4 flex flex-col md:flex-row">
          <div className="flex-col space-y-4 md:flex-1/2 ">
            <div className="flex space-x-4">
              <button className="w-full hover:cursor-pointer bg-green-500 hover:bg-green-400 text-white text-2xl rounded-xl py-3">Buy BTC</button>
              <button className="w-full hover:cursor-pointer bg-blue-500 hover:bg-blue-400 text-white text-2xl rounded-xl py-3">Sell BTC</button>
            </div>
            <div className="flex space-x-4">
              <button className="w-full hover:cursor-pointer bg-green-500 hover:bg-green-400 text-white text-2xl rounded-xl py-3">Buy ADA</button>
              <button className="w-full hover:cursor-pointer bg-blue-500 hover:bg-blue-400 text-white text-2xl rounded-xl py-3">Sell ADA</button>
            </div>
            <div className="flex space-x-4"></div>
          </div>
          <div className="flex-col space-y-4 md:flex-1/2">
            <div className="flex space-x-4">
              <button className="w-full hover:cursor-pointer bg-green-500 hover:bg-green-400 text-white text-2xl rounded-xl py-3">Buy ETH</button>
              <button className="w-full hover:cursor-pointer bg-blue-500 hover:bg-blue-400 text-white text-2xl rounded-xl py-3">Sell ETH</button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="flex md:flex-2/3">
          <Recent />
        </div>
        <div className="flex flex-col space-y-4 md:flex-1/3">
          <Portfolio />
          <div className="flex space-y-4 md:flex-1/3">
            <News />
          </div>
        </div>
        
      </div>
    </div>
  );
}
