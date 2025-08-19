// /app/api/tao-price/route.ts
import { TaoStatsClient } from "@taostats/sdk";

const client = new TaoStatsClient({
  apiKey: "tao-329fde6c-ca59-467c-a374-9a5500ec8e68:51e443b2",
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
