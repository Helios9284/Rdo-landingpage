'use client';

import { time } from "console";

export const Recent = () => {
    const TradeItem = [
        { id: '1', status: 'Buy', coin: 'BTC', time: '14:30', amount: '0.25 BTC', price: '$47,800', statusText: 'completed' },
        { id: '2', status: 'Sell', coin: 'ETH', time: '13:45', amount: '2.5 ETH', price: '$3,180', statusText: 'completed' },
        { id: '3', status: 'Buy', coin: 'ADA', time: '12:20', amount: '1000 ADA', price: '$0.51', statusText: 'pending' },
        { id: '4', status: 'Sell', coin: 'BTC', time: '11:15', amount: '0.1 BTC', price: '$48,200', statusText: 'completed' },
    ];
    return (
        <div className="recent-trader flex flex-col p-8 border-[0.5px] rounded-xl border-gray-400 w-full space-y-8">
            <h1 className="text-white text-2xl font-bold">Recent Trades</h1>
            <div className="flex flex-col space-y-4 w-full">
                {TradeItem.map((trade) => (
                    <div key={trade.id} className="bg-gray-700 border-[0.5px] rounded-xl border-gray-700 flex justify-between items-center text-center p-4">
                        <div className="flex space-x-4 items-center">
                            <span className={`bg-${trade.status == 'Buy' ? 'green' : 'red'}-900 rounded-xl text-${trade.status == 'Buy' ? 'green' : 'red'}-400 text-xl py-2 px-8`}>{trade.status}</span>
                            <div className="flex flex-col justify-center align-middle space-y-2">
                                <span className="font-bold text-white text-xl">{trade.coin}</span>
                                <span className="text-gray-400 text-sm">{trade.time}</span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center align-middle space-y-2">
                            <span className="text-white text-xl font-bold">{trade.amount}</span>
                            <span className="text-gray-400 text-sm">{trade.price}</span>
                        </div>
                        <span className={`bg-${trade.statusText == 'completed' ? 'green' : 'red'}-900 text-${trade.statusText == 'completed' ? 'green' : 'amber'}-400 rounded-xl p-3`}>{trade.statusText}</span>
                    </div>
                ))}
            </div>
            <div></div>
        </div>
    )
}