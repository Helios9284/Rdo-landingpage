'use client';
import {useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/config";


export const SubnetStatus = () => {

    interface StatusCounts {
        active: number;
        burning: number;
        dead: number;
        total: number;
    }

    interface SubnetStatusSnapshot {
        netuid: number;
        name: string;
        status: string;
    }

    interface SubnetStatus {
        netuid: number;
        name: string;
        status: string;
        activeValidators: number;
        activeMiners: number;
    }

    const [taoStatus, setTaoStatus] = useState<any[]>([]);
    const [subnetInfo, setSubnetInfo] = useState<any[]>([]);
    const [subnetStatus, setSubnetStatus] = useState<SubnetStatus[]>([]);
    const isInitialLoad = useRef(true);
    const [loading, setLoading] = useState(true);

    const [currentStatusCounts, setCurrentStatusCounts] = useState<StatusCounts>({
        active: 0,
        burning: 0,
        dead: 0,
        total: 0
    });

    const getStatus = (subnetName: string | null | undefined, netuid: number, subnetInfoData?: any[]) => {
        const infoData = subnetInfoData || subnetInfo;
        
        if (!subnetName || subnetName.toLowerCase() === 'unknown') {
        return { 
            status: 'Dead', 
        };
        }
        const subnetDetails = infoData.find(info => info.netuid === netuid);
            const activeMinerCount = subnetDetails?.active_miners || 0;

            if (activeMinerCount === 1) {
            return { 
                status: 'Burning', 
            };
            }
            
            return { 
            status: 'Active', 
            };
    };

    const createCurrentSnapshot = (taoStatusData: any[], subnetInfoData: any[]): SubnetStatusSnapshot[] => {
        return taoStatusData.map(subnet => {
            // Find matching subnet info by netuid
            const matchingSubnetInfo = subnetInfoData.find(info => info.netuid === subnet.netuid);
            
            return {
                netuid: subnet.netuid,
                name: subnet.name || "Unknown",
                status: getStatus(subnet.name, subnet.netuid, subnetInfoData).status,
                activeValidators: matchingSubnetInfo?.active_validators || 0,
                activeMiners: matchingSubnetInfo?.active_miners || 0
            };
        });
    };

    useEffect(() => {
        async function fetchData() {
        try {
            const [res, subnetInfoRes] = await Promise.all([
            fetch("/api/subnet-status"),
            fetch("/api/subnet-info"),
            ]);
            
            const data = await res.json();
            const subnetInfoData = await subnetInfoRes.json();

            setTaoStatus(data.data.data);
            console.log("Fetched Subnet Status Data:", data.data.data);
            setSubnetInfo(subnetInfoData.data.data);
            console.log("Fetched Subnet setSubnetInfo:", subnetInfoData.data.data);
            // setSubnetPool(subnetPoolData.data.data);

            // On initial load, create the baseline status
            if (isInitialLoad.current) {
                const currentSnapshot = createCurrentSnapshot(data.data.data, subnetInfoData.data.data);
                const response = await axios.post(`${BASE_URL}/save/statusHistory`, { snapshot: currentSnapshot });
                console.log("Saved current snapshot:", response.data);
            isInitialLoad.current = false;
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setLoading(false);
        }
        }
        fetchData();
    }, []);
    
    return (
        <div className="w-full bg-gray-900 text-gray-100 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Subnet Status</h2>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Subnet A:</span>
                    <span className="text-green-500 font-semibold">Active</span>
                </div>
                <div className="flex justify-between">
                    <span>Subnet B:</span>
                    <span className="text-red-500 font-semibold">Inactive</span>
                </div>
                <div className="flex justify-between">
                    <span>Subnet C:</span>
                    <span className="text-yellow-500 font-semibold">Degraded</span>
                </div>
            </div>
        </div>
    );
}