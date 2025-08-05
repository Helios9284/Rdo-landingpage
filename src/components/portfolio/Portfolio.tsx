'use client';

export const Portfolio = () => {
    const TradeItem = [
        { id: '1',  coin: 'BTC',  amount: '0.25 BTC', price: '$47,800', status: '+2.4%' },
        { id: '2',  coin: 'ETH',  amount: '2.5 ETH', price: '$3,180', status: '-1.2%' },
        { id: '3',  coin: 'ADA',  amount: '1000 ADA', price: '$0.51', status: '+5.8%' },
        { id: '4',  coin: 'SOL',  amount: '0.1 BTC', price: '$48,200', status: '+3.1%' },
    ];
    return (
        <div className="recent-trader flex flex-col p-8 border-[0.5px] rounded-xl border-gray-400 w-full space-y-8">
            <h1 className="text-white text-2xl font-bold">Portfolio</h1>
            <span className="text-amber-300 font-bold text-2xl">$94,740</span>
            <div className="flex flex-col space-y-4 w-full">
                {TradeItem.map((trade) => (
                    <div key={trade.id} className="bg-gray-700 border-[0.5px] rounded-xl border-gray-700 flex justify-between items-center text-center p-4">
                        <div className="flex flex-col justify-center align-middle space-y-2">
                            <span className="font-bold text-white text-xl">{trade.coin}</span>
                            <span className="text-gray-400 text-sm">{trade.amount}</span>
                        </div>
                        <div className="flex flex-col justify-center align-middle space-y-2">
                            <span className="text-white text-xl font-bold">{trade.price}</span>
                            <span className="text-gray-400 text-sm">{trade.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}