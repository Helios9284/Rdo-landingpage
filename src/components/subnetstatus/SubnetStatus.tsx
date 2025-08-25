'use client';
import {useState, useEffect, useRef, use } from "react";
import { TbPlaystationX } from "react-icons/tb";
import { GrStatusGood } from "react-icons/gr";
import { FaFire } from "react-icons/fa";
import { FaArrowDownShortWide, FaArrowUpShortWide } from "react-icons/fa6";
import axios from "axios";
import { BASE_URL } from "../../config/config";

export const SubnetStatus = () => {


    interface SubnetStatusSnapshot {
        netuid: number;
        name: string;
        status: string;
    }

    interface SubnetStatus {
        netuid: number;
        name: string;
        status: string;
        activevalidator: number;
        activeminer: number;
        burning_tao_24h?: number;
        alphaprice?: number;
        regprice?: number;
    }

    const [subnetInfo, setSubnetInfo] = useState<any[]>([]);
    const [subnetStatus, setSubnetStatus] = useState<SubnetStatus[]>([]);
    const isInitialLoad = useRef(true);
    const [loading, setLoading] = useState(true);
    const [showUSD, setShowUSD] = useState(false);
    const [showAlphaUSD, setShowAlphaUSD] = useState(false);
    const [taoPrice, setTaoPrice] = useState<number | null>(null);
    const [sortConfig, setSortConfig] = useState<{key: string, direction: 'ascending' | 'descending'}>({ 
        key: 'netuid', 
        direction: 'ascending' 
    });

    const getStatus = (subnetName: string | null | undefined, netuid: number, subnetStatus?: any[]) => {
        const infoData = subnetStatus || subnetInfo;
        
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

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Enhanced sorting function that works with the actual data
    const getSortedData = () => {
        const statusOrder = { 'Active': 0, 'Burning': 1, 'Dead': 2 };
        
        return [...subnetStatus].sort((a, b) => {
            let aValue, bValue;
            
            switch (sortConfig.key) {
                case 'name':
                    aValue = (a.name || '').toLowerCase();
                    bValue = (b.name || '').toLowerCase();
                    break;
                    
                case 'status':
                    const statusA = getStatus(a.name, a.netuid).status;
                    const statusB = getStatus(b.name, b.netuid).status;
                    aValue = statusOrder[statusA as keyof typeof statusOrder] ?? 999;
                    bValue = statusOrder[statusB as keyof typeof statusOrder] ?? 999;
                    break;
                    
                case 'netuid':
                    aValue = a.netuid;
                    bValue = b.netuid;
                    break;
                    
                case 'activevalidator':
                    aValue = a.activevalidator || 0;
                    bValue = b.activevalidator || 0;
                    break;
                    
                case 'activeminer':
                    aValue = a.activeminer || 0;
                    bValue = b.activeminer || 0;
                    break;
                    
                case 'burning_tao_24h':
                    aValue = a.burning_tao_24h || 0;
                    bValue = b.burning_tao_24h || 0;
                    break;
                    
                case 'alpha_price':
                    aValue = a.alphaprice || 0;
                    bValue = b.alphaprice || 0;
                    break;
                    
                case 'reg_price':
                    aValue = a.regprice || 0;
                    bValue = b.regprice || 0;
                    break;
                    
                default:
                    aValue = a[sortConfig.key as keyof SubnetStatus];
                    bValue = b[sortConfig.key as keyof SubnetStatus];
            }
            
            // Handle string comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                if (sortConfig.direction === 'ascending') {
                    return aValue.localeCompare(bValue);
                } else {
                    return bValue.localeCompare(aValue);
                }
            }
            
            // Handle numeric comparison
            const aNum = aValue ?? 0;
            const bNum = bValue ?? 0;
            if (aNum < bNum) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aNum > bNum) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    };

    // Get the sort icon for column headers
    const getSortIcon = (columnKey: string) => {
        if (sortConfig.key !== columnKey) {
            return <FaArrowDownShortWide className="w-5 h-5 text-gray-400" />;
        }
        
        return sortConfig.direction === 'ascending' ? 
            <FaArrowDownShortWide className="w-5 h-5 text-green-400" /> : 
            <FaArrowUpShortWide className="w-5 h-5 text-green-400" />;
    };

    const createCurrentSnapshot = (taoStatusData: any[], subnetInfoData: any[]): SubnetStatusSnapshot[] => {
        return taoStatusData.map(subnet => {
            const matchingSubnetInfo = subnetInfoData.find(info => info.netuid === subnet.netuid);
            
            return {
                netuid: subnet.netuid,
                name: subnet.name || "Unknown",
                alpha_price: subnet.price || 0,
                reg_price: matchingSubnetInfo.neuron_registration_cost || 0,
                status: getStatus(subnet.name, subnet.netuid, subnetInfoData).status,
                activeValidators: matchingSubnetInfo?.active_validators || 0,
                activeMiners: matchingSubnetInfo?.active_miners || 0
            };
        });
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const totalPages = Math.ceil(subnetStatus.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    useEffect(() => {
        async function fetchData() {
            try {
                const [res, subnetInfoRes, taoPriceRes] = await Promise.all([
                    fetch("/api/subnet-status"),
                    fetch("/api/subnet-info"),
                    fetch("/api/tao-price"),
                ]);
                
                const data = await res.json();
                const subnetInfoData = await subnetInfoRes.json();
                const priceData = await taoPriceRes.json();
                setSubnetInfo(subnetInfoData.data.data);
                setTaoPrice(priceData.data.data[0].price);

                if (isInitialLoad.current) {
                    const currentSnapshot = createCurrentSnapshot(data.data.data, subnetInfoData.data.data);
                    await axios.post(`${BASE_URL}/save/statusHistory`, { snapshot: currentSnapshot });
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
                setSubnetStatus(subnetStatuses.data.data);
                console.log("Fetched subnet status history:", subnetStatuses.data.data);
            } catch (err) {
                console.error("Failed to update status history:", err);
            }
        }
        updateSubnetStatus();
    }, []);  

    // Get sorted data for rendering
    const sortedSubnets = getSortedData();
    const currentPageData = sortedSubnets.slice(startIndex, startIndex + itemsPerPage);

    const goToPrevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    const goToNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };

    // Generate page numbers for pagination buttons
    const getPageNumbers = () => {
      const pageNumbers = [];
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    };

    const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };

    const formatPrice = (subnetPrice: string | number) => {
      if (!subnetPrice || !taoPrice) return "N/A";
      const price = typeof subnetPrice === 'string' ? parseFloat(subnetPrice) : subnetPrice;
      if (showUSD) {
        const usdPrice = price * taoPrice;
        return `$${usdPrice.toFixed(2)}`;
      } else {
        return `${price} TAO`;
      }
    };

    const formatRegPrice = (subnetPrice: string | number) => {
      if (!subnetPrice || !taoPrice) return "N/A";
      const price = typeof subnetPrice === 'string' ? parseFloat(subnetPrice) : subnetPrice;
      if (showAlphaUSD) {
        const usdPrice = price * taoPrice;
        return `$${usdPrice.toFixed(2)}`;
      } else {
        return `${price} TAO`;
      }
    };
      
    return (
        <div className="overflow-x-auto space-y-10">
          <div className="flex justify-center">
            <span className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text text-3xl items-center">
              <span className="text-4xl">Tao Price:</span>
              {taoPrice}
            </span>
          </div>
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden outline-[0.5px] outline-gray-300 ">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Subnet Name</span>
                    <button 
                      className="hover:cursor-pointer transition-colors" 
                      onClick={() => requestSort('name')}
                      title={`Sort by name ${sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? 'descending' : 'ascending') : 'ascending'}`}
                    >
                      {getSortIcon('name')}
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Subnet Status</span>
                    <button 
                      className="hover:cursor-pointer transition-colors" 
                      onClick={() => requestSort('status')}
                      title={`Sort by status ${sortConfig.key === 'status' ? (sortConfig.direction === 'ascending' ? 'descending' : 'ascending') : 'ascending'}`}
                    >
                      {getSortIcon('status')}
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Burning tao(24h)</span>
                    <button 
                      className="hover:cursor-pointer transition-colors" 
                      onClick={() => requestSort('burning_tao_24h')}
                      title={`Sort by burning TAO ${sortConfig.key === 'burning_tao_24h' ? (sortConfig.direction === 'ascending' ? 'descending' : 'ascending') : 'ascending'}`}
                    >
                      {getSortIcon('burning_tao_24h')}
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Net UID</span>
                    <button 
                      className="hover:cursor-pointer transition-colors" 
                      onClick={() => requestSort('netuid')}
                      title={`Sort by Net UID ${sortConfig.key === 'netuid' ? (sortConfig.direction === 'ascending' ? 'descending' : 'ascending') : 'ascending'}`}
                    >
                      {getSortIcon('netuid')}
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Alpha Price</span>
                    <div className="flex rounded-lg overflow-hidden border border-blue-400 ">
                      <button 
                        onClick={() => setShowUSD(false)}
                        className={`w-15 px-3 py-1 text-xs hover:cursor-pointer font-medium transition-colors ${
                          !showUSD 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        TAO
                      </button>
                      <button 
                        onClick={() => setShowUSD(true)}
                        className={`w-15 px-3 py-1 text-xs hover:cursor-pointer font-medium transition-colors ${
                          showUSD 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-300'
                        }`}
                      >
                        $
                      </button>
                    </div>
                    <button 
                      className="hover:cursor-pointer transition-colors" 
                      onClick={() => requestSort('alpha_price')}
                      title={`Sort by Alpha Price ${sortConfig.key === 'alpha_price' ? (sortConfig.direction === 'ascending' ? 'descending' : 'ascending') : 'ascending'}`}
                    >
                      {getSortIcon('alpha_price')}
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>REG PRICE</span>
                    <div className="flex rounded-lg overflow-hidden border border-blue-400 ">
                      <button 
                        onClick={() => setShowAlphaUSD(false)}
                        className={`w-15 px-3 py-1 text-xs hover:cursor-pointer font-medium transition-colors ${
                          !showAlphaUSD 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-amber-200'
                        }`}
                      >
                        TAO
                      </button>
                      <button 
                        onClick={() => setShowAlphaUSD(true)}
                        className={`w-15 px-3 py-1 text-xs hover:cursor-pointer font-medium transition-colors ${
                          showAlphaUSD 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-300'
                        }`}
                      >
                        $
                      </button>
                    </div>
                    <button 
                      className="hover:cursor-pointer transition-colors" 
                      onClick={() => requestSort('reg_price')}
                      title={`Sort by Registration Price ${sortConfig.key === 'reg_price' ? (sortConfig.direction === 'ascending' ? 'descending' : 'ascending') : 'ascending'}`}
                    >
                      {getSortIcon('reg_price')}
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Active Validator</span>
                    <button 
                      className="hover:cursor-pointer transition-colors" 
                      onClick={() => requestSort('activevalidator')}
                      title={`Sort by Active Validators ${sortConfig.key === 'activevalidator' ? (sortConfig.direction === 'ascending' ? 'descending' : 'ascending') : 'ascending'}`}
                    >
                      {getSortIcon('activevalidator')}
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Active Miner</span>
                    <button 
                      className="hover:cursor-pointer transition-colors" 
                      onClick={() => requestSort('activeminer')}
                      title={`Sort by Active Miners ${sortConfig.key === 'activeminer' ? (sortConfig.direction === 'ascending' ? 'descending' : 'ascending') : 'ascending'}`}
                    >
                      {getSortIcon('activeminer')}
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-300">
              {currentPageData.map((subnet, index) => {
                const statusInfo = getStatus(subnet.name, subnet.netuid);
                const globalIndex = startIndex + index + 1;
                
                const handleRowClick = () => {
                  window.open(`https://taostats.io/subnets/${subnet.netuid}/chart`, '_blank');
                };

                return (
                  <tr 
                    key={`subnet-${index}-${subnet.netuid}`} 
                    className="hover:bg-gray-200 cursor-pointer transition-colors"
                    onClick={handleRowClick}
                    title={`View ${subnet.name || 'Subnet ' + subnet.netuid} dashboard on TaoStats`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {globalIndex}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subnet.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span className="ml-2 text-xs font-semibold">
                          {statusInfo.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subnet.burning_tao_24h ? subnet.burning_tao_24h.toFixed(4) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subnet.netuid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subnet.alphaprice ? formatPrice(subnet.alphaprice) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subnet.regprice ? formatRegPrice(subnet.regprice/(1000000000)) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subnet.activevalidator || "0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subnet.activeminer || "0"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-xl text-sm font-medium ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed '
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 cursor-pointer'
                }`}
              >
                Previous
              </button>

              {/* Page Number Buttons */}
              <div className="flex space-x-1">
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-gray-700'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 cursor-pointer'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-xl text-sm font-medium ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 cursor-pointer'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
    );
};