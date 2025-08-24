'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/config";
import { FaFire } from "react-icons/fa";
import { TbPlaystationX } from "react-icons/tb";
import { GrStatusGood } from "react-icons/gr";

export const SubnetCount = () => {
    interface StatusCounts {
        active: number;
        burning: number;
        dead: number;
        total: number;
    }
    const [subnetStatus, setSubnetStatus] = useState<any[]>([]);
    const [currentStatusCounts, setCurrentStatusCounts] = useState<StatusCounts>({active: 0, burning: 0, dead: 0, total: 0});
    useEffect(() => {
        async function updateSubnetStatus() {
            try {
                const subnetStatuses = await axios.get(`${BASE_URL}/save/getHistory`);
                console.log("Fetched subnet statuses:", subnetStatuses.data.data);
                setSubnetStatus(subnetStatuses.data.data);
                const counts = {active: 0, burning: 0, dead: 0, total: subnetStatuses.data.data.length};
                try {
                    subnetStatuses.data.data.forEach((item: any) => {
                        switch (item.status) {
                            case 'Active':
                                counts.active += 1;
                                break;
                            case 'Burning':
                                counts.burning += 1;
                                break;
                            case 'Dead':
                                counts.dead += 1;
                                break;
                        }
                    });
                    setCurrentStatusCounts(counts);
                } catch (err) {
                    console.error("Error counting statuses:", err);
                }
            } catch (err) {
                console.error("Failed to update status history:", err);
            }
        }
        updateSubnetStatus();
    }, []); 

    return (
        <div className="bg-gray-100  shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 ">
            Current Status Overview
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <GrStatusGood className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200 mt-2">
                {currentStatusCounts.active}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {currentStatusCounts.total > 0 ? ((currentStatusCounts.active / currentStatusCounts.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FaFire className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Burning</span>
              </div>
              <p className="text-2xl font-bold text-orange-800 dark:text-orange-200 mt-2">
                {currentStatusCounts.burning}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                {currentStatusCounts.total > 0 ? ((currentStatusCounts.burning / currentStatusCounts.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <TbPlaystationX className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Dead</span>
              </div>
              <p className="text-2xl font-bold text-red-800 dark:text-red-200 mt-2">
                {currentStatusCounts.dead}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {currentStatusCounts.total > 0 ? ((currentStatusCounts.dead / currentStatusCounts.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Subnets</span>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-2">
                {currentStatusCounts.total}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                100%
              </p>
            </div>
          </div>
        </div>
    );
}