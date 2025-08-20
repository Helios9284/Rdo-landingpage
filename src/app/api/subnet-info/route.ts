// /app/api/tao-price/route.ts
import { TaoStatsClient } from "@taostats/sdk";

const client = new TaoStatsClient({
  apiKey: "tao-8074a94c-aee2-4da2-871f-c373c4243a83:9cb4ff64",
});

export async function GET() {
  try {
    const price = await client.subnets.getSubnets();
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
