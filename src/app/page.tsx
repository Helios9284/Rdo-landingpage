'use client';

import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { BASE_URL } from "../config/config";
import { TbPlaystationX } from "react-icons/tb";
import { GrStatusGood } from "react-icons/gr";
import { FaFire } from "react-icons/fa";
import { FaArrowDownShortWide } from "react-icons/fa6";
import { FaArrowUp, FaArrowDown, FaArrowRight } from "react-icons/fa";

interface SubnetStatusSnapshot {
  netuid: number;
  name: string;
  status: string;
}

interface StatusCounts {
  active: number;
  burning: number;
  dead: number;
  total: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [taoStatus, setTaoStatus] = useState<any[]>([]);
  const [subnetInfo, setSubnetInfo] = useState<any[]>([]);
  const [taoPrice, setTaoPrice] = useState<number | null>(null);

  const [currentStatusCounts, setCurrentStatusCounts] = useState<StatusCounts>({
    active: 0,
    burning: 0,
    dead: 0,
    total: 0
  });

  const isInitialLoad = useRef(true);

  const getStatus = (subnetName: string | null | undefined, netuid: number, subnetInfoData?: any[]) => {
    const infoData = subnetInfoData || subnetInfo;
    
    if (!subnetName || subnetName.toLowerCase() === 'unknown') {
      return { 
        status: 'Dead', 
        icon: <TbPlaystationX className="w-5 h-5" />,
        color: 'text-red-600 dark:text-red-400', 
        bgColor: 'bg-red-100 dark:bg-red-900' 
      };
    }
    
    const subnetDetails = infoData.find(info => info.netuid === netuid);
    const activeMinerCount = subnetDetails?.active_miners || 0;
    
    if (activeMinerCount === 1) {
      return { 
        status: 'Burning', 
        icon: <FaFire className="w-5 h-5" />,
        color: 'text-orange-600 dark:text-orange-400', 
        bgColor: 'bg-orange-100 dark:bg-orange-900' 
      };
    }
    
    return { 
      status: 'Active', 
      icon: <GrStatusGood className="w-5 h-5" />,
      color: 'text-green-600 dark:text-green-400', 
      bgColor: 'bg-green-100 dark:bg-green-900' 
    };
  };

  const createCurrentSnapshot = (taoStatusData: any[], subnetInfoData: any[]): SubnetStatusSnapshot[] => {
    return taoStatusData.map(subnet => ({
      netuid: subnet.netuid,
      name: subnet.name || "Unknown",
      status: getStatus(subnet.name, subnet.netuid, subnetInfoData).status
    }));
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [res, taoPriceRes, subnetInfoRes] = await Promise.all([
          fetch("/api/subnet-status"),
          fetch("/api/tao-price"),
          fetch("/api/subnet-info"),
        ]);
        
        const data = await res.json();
        const priceData = await taoPriceRes.json();
        console.log("Fetched TAO price data:", priceData);
        const subnetInfoData = await subnetInfoRes.json();

        setTaoStatus(data.data.data);
        setTaoPrice(priceData.data.data[0].price);
        setSubnetInfo(subnetInfoData.data.data);
        // setSubnetPool(subnetPoolData.data.data);

        // On initial load, create the baseline status
        if (isInitialLoad.current) {
          const currentSnapshot = createCurrentSnapshot(data.data.data, subnetInfoData.data.data);

          axios.post(`${BASE_URL}/save/statusHistory`, { snapshot: currentSnapshot })

          console.log("Current Snapshot:", currentSnapshot);

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

  return(
    <div>
      hello
    </div>
  )
}