import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col p-10 space-y-8">
      <div className="dashboard"></div>
      <div className="flex flex-col space-y-8 border-[0.5px] border-gray-400 rounded-2xl p-8">
        <h1 className="text-3xl text-white font-bold ">Quick Trade</h1>
        <div className="button-group space-x-4 flex flex-col md:flex-row">
          <div className="flex-col space-y-4 md:flex-1/2">
            <div className="flex space-x-4">
              <button className="w-full bg-green-500 hover:bg-green-400 text-white text-2xl rounded-xl py-3">Buy BTC</button>
              <button className="w-full bg-amber-500 hover:bg-amber-400 text-white text-2xl rounded-xl py-3">Sell BTC</button>
            </div>
            <div className="flex space-x-4">
              <button className="w-full bg-green-500 hover:bg-green-400 text-white text-2xl rounded-xl py-3">Buy ADA</button>
              <button className="w-full bg-amber-500 hover:bg-amber-400 text-white text-2xl rounded-xl py-3">Sell ADA</button>
            </div>
            <div className="flex space-x-4"></div>
          </div>
          <div className="flex-col space-y-4 md:flex-1/2">
            <div className="flex space-x-4">
              <button className="w-full bg-green-500 hover:bg-green-400 text-white text-2xl rounded-xl py-3">Buy ETH</button>
              <button className="w-full bg-amber-500 hover:bg-amber-400 text-white text-2xl rounded-xl py-3">Sell ETH</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
