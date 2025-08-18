'use client';
import { useEffect, useState } from "react";
import { TbPlaystationX } from "react-icons/tb";
import { GrStatusGood } from "react-icons/gr";
import { FaFire } from "react-icons/fa";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [taoStatus, setTaoStatus] = useState<any[]>([]);
  const [subnetInfo, setSubnetInfo] = useState<any[]>([]);
  const [taoPrice, setTaoPrice] = useState<number | null>(null);
  const [showUSD, setShowUSD] = useState(false); // false = TAO, true = USD
  const [showAlphaUSD, setShowAlphaUSD] = useState(false); // false = TAO, true = USD


  useEffect(() => {
    async function fetchPrice() {
      try {
        // Fetch subnet status
        const res = await fetch("/api/subnet-status");
        const data = await res.json();
        setTaoStatus(data.data.data);
        
        // Fetch TAO price - Fixed: use correct response variable
        const taoPriceRes = await fetch("/api/tao-price");
        const priceData = await taoPriceRes.json();
        setTaoPrice(priceData.data.data[0].price);

        const subnetInfoRes = await fetch("/api/subnet-info");
        const subnetData = await subnetInfoRes.json();
        console.log("Fetched Subnet Info:", subnetData.data.data);
        setSubnetInfo(subnetData.data.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPrice();
  }, []);

  // Optional: Log state changes
  useEffect(() => {
    console.log("Updated taoStatus state:", taoStatus);
    console.log("TAO Price:", taoPrice);
    console.log("Subnet Info:", subnetInfo);
  }, [taoStatus, taoPrice, subnetInfo]);

  const findSubnetInfo = (netuid: number) => {
    return subnetInfo.find(info => info.netuid === netuid);
  };
  console.log("findSubnetInfo:", findSubnetInfo);

  const getStatus = (subnetName: string | null | undefined, netuid: number) => {
    // First check if subnet is dead (unknown/null name)
    if (!subnetName || subnetName.toLowerCase() === 'unknown') {
      return { 
        status: 'Dead', 
        icon: <TbPlaystationX className="w-5 h-5" />,
        color: 'text-red-600 dark:text-red-400', 
        bgColor: 'bg-red-100 dark:bg-red-900' 
      };
    }
    
    // Find subnet details to check active miner count
    const subnetDetails = findSubnetInfo(netuid);
    const activeMinerCount = subnetDetails?.active_miners || 0;
    
    // Check for burning condition: active miners = 1 and subnet status would normally be active
    if (activeMinerCount === 1) {
      return { 
        status: 'Burning', 
        icon: <FaFire className="w-5 h-5" />,
        color: 'text-orange-600 dark:text-orange-400', 
        bgColor: 'bg-orange-100 dark:bg-orange-900' 
      };
    }
    
    // Default to active status
    return { 
      status: 'Active', 
      icon: <GrStatusGood className="w-5 h-5" />,
      color: 'text-green-600 dark:text-green-400', 
      bgColor: 'bg-green-100 dark:bg-green-900' 
    };
  };

  // Function to format price based on currency selection
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

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Subnet Status Dashboard</h1>
      
      {taoStatus.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No subnet data available</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  NO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subnet Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subnet Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Net UID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Alpha Price</span>
                    <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                      <button 
                        onClick={() => setShowUSD(false)}
                        className={`w-15 px-3 py-1 text-xs hover:cursor-pointer font-medium transition-colors ${
                          !showUSD 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                        }`}
                      >
                        TAO
                      </button>
                      <button 
                        onClick={() => setShowUSD(true)}
                        className={`w-15 px-3 py-1 text-xs hover:cursor-pointer font-medium transition-colors ${
                          showUSD 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                        }`}
                      >
                        $
                      </button>
                    </div>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>REG PRICE</span>
                    <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                      <button 
                        onClick={() => setShowAlphaUSD(false)}
                        className={`w-15 px-3 py-1 text-xs hover:cursor-pointer font-medium transition-colors ${
                          !showAlphaUSD 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                        }`}
                      >
                        TAO
                      </button>
                      <button 
                        onClick={() => setShowAlphaUSD(true)}
                        className={`w-15 px-3 py-1 text-xs hover:cursor-pointer font-medium transition-colors ${
                          showAlphaUSD 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                        }`}
                      >
                        $
                      </button>
                    </div>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Active Validator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Active Miner
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {taoStatus.map((subnet, index) => {
                const subnetDetails = findSubnetInfo(subnet.netuid);
                const statusInfo = getStatus(subnet.name, subnet.netuid);
                
                return (
                  <tr key={`subnet-${index}-${subnet.netuid}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {index + 1}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {subnet.netuid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatPrice(subnet.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {subnetDetails ? formatRegPrice(subnetDetails.neuron_registration_cost/(1000000000) || "N/A") : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {subnetDetails ? (subnetDetails.active_validators || "0") : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {subnetDetails ? (subnetDetails.active_miners || "0") : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}