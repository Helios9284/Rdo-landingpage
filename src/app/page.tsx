'use client';
import { useEffect, useState, useRef } from "react";
import { TbPlaystationX } from "react-icons/tb";
import { GrStatusGood } from "react-icons/gr";
import { FaFire } from "react-icons/fa";
import { FaArrowDownShortWide } from "react-icons/fa6";
import { FaArrowUp, FaArrowDown, FaArrowRight } from "react-icons/fa";

interface StatusChange {
  id: string;
  netuid: number;
  subnetName: string;
  oldStatus: string;
  newStatus: string;
  timestamp: Date;
}

interface StatusCounts {
  active: number;
  burning: number;
  dead: number;
  total: number;
}

interface StatusTransitionCounts {
  'Active → Dead': number;
  'Active → Burning': number;
  'Burning → Active': number;
  'Burning → Dead': number;
  'Dead → Active': number;
  'Dead → Burning': number;
}

interface SubnetStatusSnapshot {
  netuid: number;
  name: string;
  status: string;
}

interface StatusHistoryFile {
  lastUpdate: string;
  subnets: SubnetStatusSnapshot[];
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [taoStatus, setTaoStatus] = useState<any[]>([]);
  const [subnetInfo, setSubnetInfo] = useState<any[]>([]);
  const [taoPrice, setTaoPrice] = useState<number | null>(null);
  const [subnetPool, setSubnetPool] = useState<any[]>([]);
  const [showUSD, setShowUSD] = useState(false);
  const [showAlphaUSD, setShowAlphaUSD] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  
  // Status change detection with JSON file
  const [statusChangeAlerts, setStatusChangeAlerts] = useState<StatusChange[]>([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const [lastStatusCheck, setLastStatusCheck] = useState<Date | null>(null);
  const [jsonFileStatus, setJsonFileStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  
  // Navigation analytics
  const [currentStatusCounts, setCurrentStatusCounts] = useState<StatusCounts>({
    active: 0,
    burning: 0,
    dead: 0,
    total: 0
  });
  
  const [statusTransitionCounts, setStatusTransitionCounts] = useState<StatusTransitionCounts>({
    'Active → Dead': 0,
    'Active → Burning': 0,
    'Burning → Active': 0,
    'Burning → Dead': 0,
    'Dead → Active': 0,
    'Dead → Burning': 0
  });

  const isInitialLoad = useRef(true);
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // JSON file operations using browser File API and local storage fallback
  const JSON_FILE_NAME = 'subnet_status_history.json';

  const downloadJsonFile = (data: StatusHistoryFile) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = JSON_FILE_NAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const saveStatusToLocalStorage = (data: StatusHistoryFile) => {
    try {
      const jsonString = JSON.stringify(data);
      // Store in memory variable since localStorage is not available
      // (window as any).subnetStatusHistory = jsonString;
      localStorage.setItem('subnetStatusHistory', jsonString);
      console.log('Status history saved to memory');
    } catch (error) {
      console.error('Error saving to memory:', error);
    }
  };

  const loadStatusFromLocalStorage = (): StatusHistoryFile | null => {
    try {
      // const stored = (window as any).subnetStatusHistory;
      const stored = localStorage.getItem('subnetStatusHistory');
      console.log('Loading status history from memory-----------------------:', stored);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error loading from memory:', error);
      return null;
    }
  };

  const createCurrentSnapshot = (taoStatusData: any[], subnetInfoData: any[]): SubnetStatusSnapshot[] => {
    return taoStatusData.map(subnet => ({
      netuid: subnet.netuid,
      name: subnet.name || "Unknown",
      status: getStatus(subnet.name, subnet.netuid, subnetInfoData).status
    }));
  };

  const compareStatuses = (
    currentSnapshots: SubnetStatusSnapshot[], 
    previousSnapshots: SubnetStatusSnapshot[]
  ): StatusChange[] => {
    const changes: StatusChange[] = [];
    const previousMap = new Map(previousSnapshots.map(s => [s.netuid, s]));

    currentSnapshots.forEach(current => {
      const previous = previousMap.get(current.netuid);
      if (previous && previous.status !== current.status) {
        changes.push({
          id: `${current.netuid}-${Date.now()}`,
          netuid: current.netuid,
          subnetName: current.name,
          oldStatus: previous.status,
          newStatus: current.status,
          timestamp: new Date()
        });
      }
    });

    return changes;
  };

  const updateTransitionCounts = (changes: StatusChange[]) => {
    const newCounts = { ...statusTransitionCounts };
    
    changes.forEach(change => {
      const transitionKey = `${change.oldStatus} → ${change.newStatus}` as keyof StatusTransitionCounts;
      if (transitionKey in newCounts) {
        newCounts[transitionKey]++;
      }
    });
    
    setStatusTransitionCounts(newCounts);
  };

  const findSubnetInfo = (netuid: number) => {
    return subnetInfo.find(info => info.netuid === netuid);
  };

  const findSubnetPool = (netuid: number) => {
    return subnetPool.find(pool => pool.netuid === netuid);
  };

  const calculateBurnRate = (subnet: any) => {
    const pool = findSubnetPool(subnet.netuid);
    if (!pool) return "N/A";
    
    const burnedTAO = parseFloat(subnet.recycled_lifetime || 0) / 1e9;
    const totalAlpha = parseFloat(pool.total_alpha || 0) / 1e9;
    
    if (totalAlpha === 0) return "0.00%";
    
    return `${((burnedTAO / totalAlpha) * 100).toFixed(2)}%`;
  };

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

  // Initial data fetch
  useEffect(() => {
    async function fetchData() {
      try {
        const [res, taoPriceRes, subnetInfoRes, subnetPoolRes] = await Promise.all([
          fetch("/api/subnet-status"),
          fetch("/api/tao-price"),
          fetch("/api/subnet-info"),
          fetch("/api/subnet-pool")
        ]);
        
        const data = await res.json();
        const priceData = await taoPriceRes.json();
        const subnetInfoData = await subnetInfoRes.json();
        const subnetPoolData = await subnetPoolRes.json();

        setTaoStatus(data.data.data);
        setTaoPrice(priceData.data.data[0].price);
        setSubnetInfo(subnetInfoData.data.data);
        setSubnetPool(subnetPoolData.data.data);

        // On initial load, create the baseline status
        if (isInitialLoad.current) {
          const currentSnapshot = createCurrentSnapshot(data.data.data, subnetInfoData.data.data);
          const historyData: StatusHistoryFile = {
            lastUpdate: new Date().toISOString(),
            subnets: currentSnapshot
          };
          
          saveStatusToLocalStorage(historyData);
          setJsonFileStatus('ready');
          setLastStatusCheck(new Date());
          isInitialLoad.current = false;
          
          console.log('Initial subnet status saved:', historyData);
        }

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setJsonFileStatus('error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 5-minute status check and comparison
  useEffect(() => {
    if (isInitialLoad.current || jsonFileStatus !== 'ready') {
      return;
    }

    const performStatusCheck = async () => {
      try {
        console.log('Performing 5-minute status check...');
        
        // Fetch current data
        const [res, subnetInfoRes] = await Promise.all([
          fetch("/api/subnet-status"),
          fetch("/api/subnet-info")
        ]);
        
        const currentData = await res.json();
        const currentSubnetInfo = await subnetInfoRes.json();
        
        // Read previous status from memory storage
        const previousHistory = loadStatusFromLocalStorage();
        
        // Create current snapshot
        const currentSnapshot = createCurrentSnapshot(currentData.data.data, currentSubnetInfo.data.data);
        
        // Compare with previous status if available
        if (previousHistory && previousHistory.subnets.length > 0) {
          const statusChanges = compareStatuses(currentSnapshot, previousHistory.subnets);
          
          if (statusChanges.length > 0) {
            console.log(`Found ${statusChanges.length} status changes:`, statusChanges);
            
            // Add alerts for status changes
            setStatusChangeAlerts(prev => [...statusChanges, ...prev].slice(0, 50));
            
            // Update transition counts
            updateTransitionCounts(statusChanges);
          } else {
            console.log('No status changes detected');
          }
        }
        
        // Always update the storage with current status
        const newHistoryData: StatusHistoryFile = {
          lastUpdate: new Date().toISOString(),
          subnets: currentSnapshot
        };
        
        saveStatusToLocalStorage(newHistoryData);
        setLastStatusCheck(new Date());
        
        console.log('Status updated:', newHistoryData);
        
        // Update current data in state
        setTaoStatus(currentData.data.data);
        setSubnetInfo(currentSubnetInfo.data.data);
        
      } catch (error) {
        console.error('Error during status check:', error);
      }
    };

    // Set up 5-minute interval
    statusCheckInterval.current = setInterval(performStatusCheck, 5 * 60 * 1000); // 5 minutes

    // Cleanup function
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, [jsonFileStatus, statusTransitionCounts]);

  // Calculate current status counts
  useEffect(() => {
    if (taoStatus.length > 0 && subnetInfo.length > 0) {
      const counts = { active: 0, burning: 0, dead: 0, total: taoStatus.length };
      
      taoStatus.forEach(subnet => {
        const status = getStatus(subnet.name, subnet.netuid).status;
        switch (status) {
          case 'Active':
            counts.active++;
            break;
          case 'Burning':
            counts.burning++;
            break;
          case 'Dead':
            counts.dead++;
            break;
        }
      });
      
      setCurrentStatusCounts(counts);
    }
  }, [taoStatus, subnetInfo]);

  // Function to dismiss an alert
  const dismissAlert = (alertId: string) => {
    setStatusChangeAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Function to clear all alerts
  const clearAllAlerts = () => {
    setStatusChangeAlerts([]);
  };

  // Function to reset transition counts
  const resetTransitionCounts = () => {
    setStatusTransitionCounts({
      'Active → Dead': 0,
      'Active → Burning': 0,
      'Burning → Active': 0,
      'Burning → Dead': 0,
      'Dead → Active': 0,
      'Dead → Burning': 0
    });
  };

  // Manual status check function
  const performManualStatusCheck = async () => {
    setLoading(true);
    try {
      const [res, subnetInfoRes] = await Promise.all([
        fetch("/api/subnet-status"),
        fetch("/api/subnet-info")
      ]);
      
      const currentData = await res.json();
      const currentSubnetInfo = await subnetInfoRes.json();
      
      const previousHistory = loadStatusFromLocalStorage();
      console.log('Performing manual status check...');
      const currentSnapshot = createCurrentSnapshot(currentData.data.data, currentSubnetInfo.data.data);
      
      if (previousHistory && previousHistory.subnets.length > 0) {
        const statusChanges = compareStatuses(currentSnapshot, previousHistory.subnets);
        console.log(`Found ${statusChanges.length} status changes:`, statusChanges);
        
        if (statusChanges.length > 0) {
          setStatusChangeAlerts(prev => [...statusChanges, ...prev].slice(0, 50));
          updateTransitionCounts(statusChanges);
        }
      }
      
      const newHistoryData: StatusHistoryFile = {
        lastUpdate: new Date().toISOString(),
        subnets: currentSnapshot
      };
      
      saveStatusToLocalStorage(newHistoryData);
      setTaoStatus(currentData.data.data);
      setSubnetInfo(currentSubnetInfo.data.data);
      setLastStatusCheck(new Date());
      
    } catch (error) {
      console.error('Manual status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to download current status as JSON file
  const downloadCurrentStatus = () => {
    const currentSnapshot = createCurrentSnapshot(taoStatus, subnetInfo);
    const historyData: StatusHistoryFile = {
      lastUpdate: new Date().toISOString(),
      subnets: currentSnapshot
    };
    downloadJsonFile(historyData);
  };

  // Function to load status from uploaded JSON file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data: StatusHistoryFile = JSON.parse(content);
        console.log('Parsed file content:----------', data);
        
        if (data.subnets && Array.isArray(data.subnets)) {
          saveStatusToLocalStorage(data);
          setJsonFileStatus('ready');
          console.log('Status history loaded from file:', data);
          alert('Status history loaded successfully!');
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        console.error('Error parsing uploaded file:', error);
        alert('Error: Invalid JSON file format');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
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

  const statusOrder = ['Active', 'Burning', 'Dead'];

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedTaos = [...taoStatus].sort((a, b) => {
    if (sortConfig.key === 'status') {
      const statusA = getStatus(a.name, a.netuid).status;
      const statusB = getStatus(b.name, b.netuid).status;
      const orderIndexA = statusOrder.indexOf(statusA);
      const orderIndexB = statusOrder.indexOf(statusB);
      
      if (sortConfig.direction === 'ascending') {
        return orderIndexA - orderIndexB;
      } else {
        return orderIndexB - orderIndexA;
      }
    }
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Pagination state and logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(sortedTaos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = sortedTaos.slice(startIndex, endIndex);

  // Pagination functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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

  const getStatusChangeColor = (oldStatus: string, newStatus: string) => {
    if (newStatus === 'Active') return 'border-green-500 bg-green-50 dark:bg-green-900';
    if (newStatus === 'Dead') return 'border-red-500 bg-red-50 dark:bg-red-900';
    return 'border-orange-500 bg-orange-50 dark:bg-orange-900';
  };

  const getTransitionIcon = (transition: string) => {
    if (transition.includes('→ Active')) return <FaArrowUp className="w-4 h-4 text-green-500" />;
    if (transition.includes('→ Dead')) return <FaArrowDown className="w-4 h-4 text-red-500" />;
    return <FaArrowRight className="w-4 h-4 text-orange-500" />;
  };

  const getTotalTransitions = () => {
    return Object.values(statusTransitionCounts).reduce((sum, count) => sum + count, 0);
  };

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-950">Subnet Status Dashboard</h1>
        <div className="flex items-center space-x-4">
          {lastStatusCheck && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last check: {lastStatusCheck.toLocaleTimeString()}
            </div>
          )}
          
          {/* File Operations */}
          {/* <div className="flex space-x-2">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="json-upload"
            />
            <label
              htmlFor="json-upload"
              className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 cursor-pointer"
            >
              Load JSON
            </label>
            <button
              onClick={downloadCurrentStatus}
              className="px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
            >
              Save JSON
            </button>
          </div> */}
          
          <button
            onClick={performManualStatusCheck}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            Manual Check
          </button>
          <div className={`px-3 py-1 rounded text-xs font-medium ${
            jsonFileStatus === 'ready' ? 'bg-green-100 text-green-800' :
            jsonFileStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            Status: {jsonFileStatus}
          </div>
        </div>
      </div>
      
      {/* Navigation/Analytics Section */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Status Counts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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

        {/* Status Transition Counts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Status Transitions ({getTotalTransitions()})
            </h2>
            <button
              onClick={resetTransitionCounts}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Reset
            </button>
          </div>
          <div className="space-y-3">
            {Object.entries(statusTransitionCounts).map(([transition, count]) => (
              <div
                key={transition}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getTransitionIcon(transition)}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {transition}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Status Change Alerts */}
      {statusChangeAlerts.length > 0 && showAlerts && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Status Changes ({statusChangeAlerts.length})
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAlerts(false)}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Hide Alerts
              </button>
              <button
                onClick={clearAllAlerts}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {statusChangeAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-3 border-l-4 rounded-r ${getStatusChangeColor(alert.oldStatus, alert.newStatus)} relative`}
              >
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Subnet {alert.netuid} ({alert.subnetName}): Status changed from{' '}
                  <span className="font-bold">{alert.oldStatus}</span> to{' '}
                  <span className="font-bold">{alert.newStatus}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {alert.timestamp.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show alerts button when hidden */}
      {!showAlerts && statusChangeAlerts.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowAlerts(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Show Recent Changes ({statusChangeAlerts.length})
          </button>
        </div>
      )}
      
      {/* Subnet Table */}
      {sortedTaos.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No subnet data available</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  NO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Subnet Name</span>
                    <button className="hover:cursor-pointer text-green-200" onClick={() => requestSort('name')}>
                      <FaArrowDownShortWide className="w-5 h-5" />
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Subnet Status</span>
                    <button className="hover:cursor-pointer text-green-200" onClick={() => requestSort('status')}>
                      <FaArrowDownShortWide className="w-5 h-5" />
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Burning tao(24h)</span>
                    <button className="hover:cursor-pointer text-green-200" onClick={() => requestSort('status')}>
                      <FaArrowDownShortWide className="w-5 h-5" />
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center space-x-3">
                    <span>Net UID</span>
                    <button className="hover:cursor-pointer text-green-200" onClick={() => requestSort('netuid')}>
                      <FaArrowDownShortWide className="w-5 h-5" />
                    </button>
                  </div>
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
                    <button className="hover:cursor-pointer text-green-200" onClick={() => requestSort('price')}>
                      <FaArrowDownShortWide className="w-5 h-5" />
                    </button>
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
          
          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-xl text-sm font-medium ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600'
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
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600'
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
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}