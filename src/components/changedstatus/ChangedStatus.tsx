'use client';
import { useState, useEffect} from "react";
import axios from "axios";
import { BASE_URL } from "../../config/config";

export const ChangedStatus = () => {

    const [changedStatus, setChangedStatus] = useState<any[]>([]);

    useEffect(() => {
        async function fetchChangedStatus() {
            try {
                const response = await axios.get(`${BASE_URL}/save/getChangedSubnet`);
                setChangedStatus(response.data.data);
            } catch (error) {
                console.error("Error fetching changed status:", error);
            }
        }
        fetchChangedStatus();

    }, []);
    console.log("Rendering ChangedStatus with data:", changedStatus);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'text-green-600 font-semibold';
            case 'burning':
                return 'text-orange-600 font-semibold';
            case 'dead':
                return 'text-red-600 font-semibold';
            default:
                return 'text-gray-600 font-semibold';
        }
    };

    return (
        <div className="bg-gray-100  rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text text-xl">
              Changed Subnet History
            </h2>
          </div>
          <table className="min-w-full bg-white  shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-50 ">
              <tr className="">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  NO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  <div className="flex items-center space-x-3 justify-center">
                    <span>Net UID</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  <div className="flex items-center space-x-3 justify-center">
                    <span>Subnet Name</span>
                  </div>
                </th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  <div className="flex items-center space-x-3 justify-center">
                    <span>Subnet Status</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                  <div className="flex items-center space-x-3 justify-center">
                    <span>Changed Time</span>
                  </div>
                </th>
              </tr>
            </thead>
            {changedStatus.length === 0 ? (          
                <tr>
                    <td 
                        colSpan={5} 
                        className="px-6 py-12 text-center text-amber-600 text-sm"
                    >
                        <div className="flex flex-col items-center space-y-2">
                            <div className="text-lg font-medium">No Changes Found</div>
                            <div className="text-gray-500">
                                There are no subnet status changes to display
                            </div>
                        </div>
                    </td>
                </tr>            
            ) : (
                <tbody className="bg-white divide-gray-200">
                {changedStatus.map((item, index) => (
                    <tr key={item._id} className="hover:bg-gray-50 ">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="flex justify-center">
                                {item.netuid}
                            </span>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.newname || item.oldname}</td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <span className="flex justify-center">
                                {item.newname || item.oldname}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex justify-center">
                            <span className={getStatusColor(item.oldstatus)}>
                                {item.oldstatus || 'Unknown'}
                            </span>
                            <span className="text-gray-400 mx-2">→</span>
                            <span className={getStatusColor(item.newstatus)}>
                                {item.newstatus || 'Unknown'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"><span className="flex justify-center">{item.createdAt}</span></td>
                    </tr>
                ))}
                </tbody>
            )}
          </table>
        </div>
    );
}