'use client';
import {useState, useEffect, useRef, use } from "react";
import { TbPlaystationX } from "react-icons/tb";
import { GrStatusGood } from "react-icons/gr";
import { FaFire } from "react-icons/fa";
import { FaArrowDownShortWide } from "react-icons/fa6";
import { FaArrowUp, FaArrowDown, FaArrowRight } from "react-icons/fa";
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
    const [showUSD, setShowUSD] = useState(false);
    const [showAlphaUSD, setShowAlphaUSD] = useState(false);

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
            setSubnetInfo(subnetInfoData.data.data);
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

    useEffect(() => {
        
        async function updateSubnetStatus() {
            try {
                const subnetStatuses = await axios.get(`${BASE_URL}/save/getHistory`);
                console.log("Fetched subnet statuses:", subnetStatuses.data.data);
                setSubnetStatus(subnetStatuses.data.data);
                
            } catch (err) {
                console.error("Failed to update status history:", err);
            }
        }
        updateSubnetStatus();

    }, []);    
    return (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr className="">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  NO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Subnet Name</span>
                    {/* <button className="hover:cursor-pointer text-green-200" onClick={() => requestSort('name')}>
                      <FaArrowDownShortWide className="w-5 h-5" />
                    </button> */}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Subnet Status</span>
                    {/* <button className="hover:cursor-pointer text-green-200" onClick={() => requestSort('status')}>
                      <FaArrowDownShortWide className="w-5 h-5" />
                    </button> */}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Burning tao(24h)</span>
                    {/* <button className="hover:cursor-pointer text-green-200" onClick={() => requestSort('status')}>
                      <FaArrowDownShortWide className="w-5 h-5" />
                    </button> */}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Net UID</span>
                    {/* <button className="hover:cursor-pointer text-green-200" onClick={() => requestSort('netuid')}>
                      <FaArrowDownShortWide className="w-5 h-5" />
                    </button> */}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Alpha Price</span>
                    <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                      <button 
                        onClick={() => setShowUSD(false)}
                        className={`w-15 px-3 py-1 text-xs hover:cursor-pointer font-medium transition-colors ${
                          !showUSD 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100  text-gray-700  hover:bg-amber-200 '
                        }`}
                      >
                        TAO
                      </button>
                      <button 
                        onClick={() => setShowUSD(true)}
                        className={`w-15 px-3 py-1 text-xs hover:cursor-pointer font-medium transition-colors ${
                          showUSD 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100  text-gray-700  hover:bg-amber-200 '
                        }`}
                      >
                        $
                      </button>
                    </div>
                    {/* <button className="hover:cursor-pointer text-green-200" onClick={() => requestSort('price')}>
                      <FaArrowDownShortWide className="w-5 h-5" />
                    </button> */}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>REG PRICE</span>
                    <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                      <button 
                        onClick={() => setShowAlphaUSD(false)}
                        className={`w-15 px-3 py-1 text-xs hover:cursor-pointer font-medium transition-colors ${
                          !showAlphaUSD 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100  text-gray-700  hover:bg-amber-200 '
                        }`}
                      >
                        TAO
                      </button>
                      <button 
                        onClick={() => setShowAlphaUSD(true)}
                        className={`w-15 px-3 py-1 text-xs hover:cursor-pointer font-medium transition-colors ${
                          showAlphaUSD 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100  text-gray-700  hover:bg-amber-200 '
                        }`}
                      >
                        $
                      </button>
                    </div>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Active Validator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  Active Miner
                </th>
              </tr>
            </thead>
            {/* <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentPageData.map((subnet, index) => {
                const subnetDetails = findSubnetInfo(subnet.netuid);
                const statusInfo = getStatus(subnet.name, subnet.netuid);
                const globalIndex = startIndex + index + 1;
                
                const handleRowClick = () => {
                  window.open(`https://taostats.io/subnets/${subnet.netuid}/chart`, '_blank');
                };

                return (
                  <tr 
                    key={`subnet-${index}-${subnet.netuid}`} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={handleRowClick}
                    title={`View ${subnet.name || 'Subnet ' + subnet.netuid} dashboard on TaoStats`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {globalIndex}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {subnet.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`inline-flex items-center justify-center px-3 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span className="ml-2 text-xs font-semibold">
                          {statusInfo.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {subnetDetails?.recycled_24_hours ? (subnetDetails.recycled_24_hours / 1e9).toFixed(4) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 ">
                      {subnet.netuid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 ">
                      {formatPrice(subnet.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 ">
                      {subnetDetails ? formatRegPrice(subnetDetails.neuron_registration_cost/(1000000000) || "N/A") : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 ">
                      {subnetDetails ? (subnetDetails.active_validators || "0") : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 ">
                      {subnetDetails ? (subnetDetails.active_miners || "0") : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody> */}
          </table>
          {/* <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-xl text-sm font-medium ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800  dark:hover:bg-gray-700 dark:border-gray-600'
                }`}
              >
                Previous
              </button>
              <div className="flex space-x-1">
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800  dark:hover:bg-gray-700 dark:border-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-xl text-sm font-medium ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800  dark:hover:bg-gray-700 dark:border-gray-600'
                }`}
              >
                Next
              </button>
            </div>
          </div> */}
        </div>
    );
}