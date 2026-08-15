import type { APIRoute } from "astro";
import { fetchGroupedGallery } from "../../utils/gallery";

export const GET: APIRoute = async () => {
  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [
      !cloudName && "PUBLIC_CLOUDINARY_CLOUD_NAME",
      !apiKey && "CLOUDINARY_API_KEY",
      !apiSecret && "CLOUDINARY_API_SECRET",
    ].filter(Boolean);

    if (import.meta.env.DEV) {
      console.warn(`Gallery API was not loaded. Missing environment variables: ${missing.join(", ")}`);
    }

    return new Response(JSON.stringify({
      error: "Missing Cloudinary environment variables.",
      missing,
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const grouped = await fetchGroupedGallery({ cloudName, apiKey, apiSecret });

    return new Response(JSON.stringify(grouped), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }
};
