// /app/api/tao-price/route.ts
import { TaoStatsClient } from "@taostats/sdk";

const client = new TaoStatsClient({
  apiKey: "tao-addcd408-ff30-492c-9152-db45046f7586:2cbbe390",
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
