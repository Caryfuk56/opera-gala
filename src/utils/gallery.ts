const GALLERY_TAG = "gallery";
const CONCERT_TAG_PREFIX = "concert:";
const FALLBACK_GROUP = "misc";

export type GalleryResource = {
  public_id: string;
  format: string;
  width: number;
  height: number;
  tags?: string[];
};

export type GalleryResponse = Record<string, GalleryResource[]>;

export type GalleryImage = {
  src: string;
  fullSrc?: string;
  alt: string;
  title: string;
};

export type GalleryControlLabels = {
  gallery: string;
  close: string;
  previous: string;
  next: string;
  openImage: string;
};

type CloudinarySearchResponse = {
  resources: GalleryResource[];
  next_cursor?: string;
};

export function formatConcertHeading(slug: string): { title: string; date: string | null } {
  const normalized = slug.replaceAll("_", " ").trim();
  const dateMatch = normalized.match(/^(\d{4})[- ](\d{2})[- ](\d{2})(?:\s+|[-_]|$)(.*)$/);

  if (!dateMatch) return { title: normalized, date: null };

  const [, yyyy, mm, dd, restRaw] = dateMatch;
  const rest = restRaw.trim();

  return {
    title: rest || normalized,
    date: `${dd}. ${mm}. ${yyyy}`,
  };
}

function getBasicAuth(params: { apiKey: string; apiSecret: string }) {
  const { apiKey, apiSecret } = params;
  const token = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  return `Basic ${token}`;
}

function pickConcertSlugFromTags(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return FALLBACK_GROUP;

  const concertTag = tags.find((tag) => tag.startsWith(CONCERT_TAG_PREFIX));
  if (!concertTag) return FALLBACK_GROUP;

  const slug = concertTag.slice(CONCERT_TAG_PREFIX.length).trim();
  return slug || FALLBACK_GROUP;
}

export function groupGalleryResourcesByConcert(resources: GalleryResource[]): GalleryResponse {
  const grouped: GalleryResponse = {};

  for (const resource of resources) {
    const slug = pickConcertSlugFromTags(resource.tags);
    grouped[slug] ??= [];
    grouped[slug].push(resource);
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

export async function fetchAllCloudinaryGalleryResources(params: {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}): Promise<GalleryResource[]> {
  const { cloudName, apiKey, apiSecret } = params;
  const all: GalleryResource[] = [];
  let nextCursor: string | undefined;

  for (;;) {
    const payload = {
      expression: `tags:${GALLERY_TAG}`,
      sort_by: [{ public_id: "asc" }],
      max_results: 500,
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
      with_field: ["tags"],
    };

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
      method: "POST",
      headers: {
        Authorization: getBasicAuth({ apiKey, apiSecret }),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Cloudinary search failed: ${response.status} ${response.statusText} ${text}`);
    }

    const data = (await response.json()) as CloudinarySearchResponse;
    all.push(...(data.resources ?? []));

    nextCursor = data.next_cursor;
    if (!nextCursor) break;
  }

  return all;
}

export async function fetchGroupedGallery(params: {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}): Promise<GalleryResponse> {
  const resources = await fetchAllCloudinaryGalleryResources(params);
  return groupGalleryResourcesByConcert(resources);
}
