'use client';


export const News = () => {
    return (
        <div className="flex flex-col p-8 border-[0.5px] rounded-xl border-gray-400 w-full space-y-8">
            <h1 className="text-2xl text-white font-bold">
                Market News
            </h1>
            <div className="flex flex-col space-y-4">
                <div className=" flex flex-col space-x-2 bg-gray-700 rounded-xl border-l-[5px] border-l-green-600 p-4">
                    <p className="text-white font-bold text-lg">Bitcoin reaches new monthly high as institutional <br></br> adoption grows</p>
                    <p className="text-gray-400 text-sm">2 hours ago</p>
                </div>
                <div className=" flex flex-col space-x-2 bg-gray-700 rounded-xl border-l-[5px] border-l-amber-600 p-4">
                    <p className="text-white font-bold text-lg">Ethereum upgrade show promising scalabiltiy <br></br> improvements</p>
                    <p className="text-gray-400 text-sm">4 hours ago</p>
                </div>
                <div className=" flex flex-col space-x-2 bg-gray-700 rounded-xl border-l-[5px] border-l-red-600 p-4">
                    <p className="text-white font-bold text-lg">Regulatory uncertailty creates market volatility</p>
                    <p className="text-gray-400 text-sm">6 hours ago</p>
                </div>
            </div>
            <div className="flex flex-col space-y-4">
                <button className="rounded-xl hover:bg-amber-500 hover:cursor-pointer bg-amber-400 text-lg font-bold w-full py-4 text-gray-900"> Trade Ready & Alert</button>
                <button className="rounded-xl hover:cursor-pointer hover:text-white hover:bg-gray-600 bg-gray-700 text-lg font-bold w-full py-4 text-gray-100"> Russian oligarch paid 3 BTC worth of BTC</button>
                <button className="rounded-xl hover:cursor-pointer hover:text-white hover:bg-gray-800 bg-gray-900 text-lg font-bold w-full py-4 text-gray-100 border-[0.5px] border-gray-200">SDO Club Blog</button>
            </div>
        </div>
    )
}