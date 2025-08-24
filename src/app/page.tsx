'use client';
import {SubnetStatus, SubnetCount} from "@/components"

export default function Home() {
  return (
    <main>
      <div className="w-full flex justify-center p-10">
        <h1 className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text text-3xl">Bittensor Subnet Dashboard</h1>
      </div>
      <div className="flex flex-col p-10 space-y-10">
        <div className="flex">
          <div className="w-1/2">
            <SubnetCount />
          </div>
        </div>
        <SubnetStatus />
      </div>
      
    </main>
  );
}