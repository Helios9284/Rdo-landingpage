// /app/api/tao-price/route.ts
import { TaoStatsClient } from "@taostats/sdk";

const client = new TaoStatsClient({
  apiKey: "tao-88165374-6e17-4be3-b77b-506b4f4280a2:8f4dbd4c",
});

export async function GET() {
  try {
    // const params = {
    //   netuid: 1, // Replace with the desired subnet ID
    // };
    const price = await client.subnets.getCurrentSubnetPools();
    return new Response(JSON.stringify(price), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to fetch TAO price:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch TAO price" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
