import type { ImageMetadata } from "astro";
import partners from "../content/partners/partners.json";

type PartnerDefinition = {
  name: string;
  imgPath: string;
  url: string;
  dimensions?: {
    width: string;
    height: string;
  };
};

export type Partner = PartnerDefinition & {
  image: ImageMetadata;
  dimensions: {
    width: string;
    height: string;
  };
};

const DEFAULT_DIMENSIONS = {
  width: "auto",
  height: "4rem",
};

const partnerImages = import.meta.glob<{ default: ImageMetadata }>("/src/assets/*", {
  eager: true,
});

function resolvePartnerImage(imgPath: string): ImageMetadata {
  const key = imgPath.startsWith("/") ? imgPath : `/${imgPath}`;
  const image = partnerImages[key]?.default;

  if (!image) {
    throw new Error(`Partner image was not found: ${imgPath}`);
  }

  return image;
}

export function getPartners(): Partner[] {
  return (partners as PartnerDefinition[]).map((partner) => ({
    ...partner,
    image: resolvePartnerImage(partner.imgPath),
    dimensions: partner.dimensions ?? DEFAULT_DIMENSIONS,
  }));
}
