import type { APIRoute } from "astro";

const GALLERY_TAG = "gallery";
const CONCERT_TAG_PREFIX = "concert:"; // e.g. "concert:2026-02-10-stare-projekty"
const FALLBACK_GROUP = "misc";

type GalleryResource = {
  public_id: string;
  format: string;
  width: number;
  height: number;
  tags?: string[];
};

type GalleryResponse = Record<string, GalleryResource[]>;

type CloudinarySearchResponse = {
  resources: GalleryResource[];
  next_cursor?: string;
};

function getBasicAuth(params: { apiKey: string; apiSecret: string }) {
  const { apiKey, apiSecret } = params;
  const token = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  return `Basic ${token}`;
}

function pickConcertSlugFromTags(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return FALLBACK_GROUP;

  const concertTag = tags.find((t) => t.startsWith(CONCERT_TAG_PREFIX));
  if (!concertTag) return FALLBACK_GROUP;

  const slug = concertTag.slice(CONCERT_TAG_PREFIX.length).trim();
  return slug || FALLBACK_GROUP;
}

function groupByConcert(resources: GalleryResource[]): GalleryResponse {
  const grouped: GalleryResponse = {};

  for (const res of resources) {
    const slug = pickConcertSlugFromTags(res.tags);
    if (!grouped[slug]) grouped[slug] = [];
    grouped[slug].push(res);
  }

  for (const slug of Object.keys(grouped)) {
    grouped[slug].sort((a, b) => a.public_id.localeCompare(b.public_id));
  }

  const sorted: GalleryResponse = {};
  Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .forEach((slug) => {
      sorted[slug] = grouped[slug];
    });

  return sorted;
}

async function fetchAllCloudinaryResources(params: {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}): Promise<GalleryResource[]> {
  const { cloudName, apiKey, apiSecret } = params;

  const all: GalleryResource[] = [];
  let nextCursor: string | undefined;

  for (;;) {
    const payload = {
      // Search by tag
      expression: `tags:${GALLERY_TAG}`,
      sort_by: [{ public_id: "asc" }],
      max_results: 500,
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
      // Make sure tags are returned (usually are, but be explicit)
      with_field: ["tags"],
    };

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
      method: "POST",
      headers: {
        Authorization: getBasicAuth({ apiKey, apiSecret }),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Cloudinary search failed: ${res.status} ${res.statusText} ${text}`);
    }

    const data = (await res.json()) as CloudinarySearchResponse;
    all.push(...(data.resources ?? []));

    nextCursor = data.next_cursor;
    if (!nextCursor) break;
  }

  return all;
}

export const GET: APIRoute = async () => {
  const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return new Response(JSON.stringify({ error: "Missing Cloudinary environment variables." }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const resources = await fetchAllCloudinaryResources({ cloudName, apiKey, apiSecret });
    const grouped = groupByConcert(resources);

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
