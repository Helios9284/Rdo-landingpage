// /app/api/tao-price/route.ts
import { TaoStatsClient } from "@taostats/sdk";

const client = new TaoStatsClient({
  apiKey: "tao-c17078e1-32f3-43a6-96ca-f1bd9a2a570c:6c318a82",
});

export async function GET() {
  try {
    const price = await client.taoPrices.getTaoPriceHistory();
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
