import { NextResponse } from "next/server";

export const runtime = "edge"; // faster response, optional

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("q");

  if (!address) {
    return NextResponse.json({ error: "Missing ?q=address" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", address);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "fema-flood-map/1.0 (contact: youremail@example.com)",
    },
    next: { revalidate: 60 }, // cache lightly
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
  }

  const results: any[] = await res.json();
  if (results.length === 0) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  const { lat, lon, display_name } = results[0];
  return NextResponse.json({
    lat: parseFloat(lat),
    lon: parseFloat(lon),
    label: display_name,
  });
}
