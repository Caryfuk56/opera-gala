import { defineCollection, z } from "astro:content";

const pages = defineCollection({
	type: "content",
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string().optional(),
		sections: z.array(z.object({
			title: z.string().optional(),
			content: z.string(),
			image: image().optional(),
			imageAlt: z.string().optional(),
			imageCaption: z.string().optional(),
			variant: z.enum(["plain", "image-left", "image-right"]),
			background: z.enum(["light", "dark", "parallax"]).default("light"),
		})).optional(),
	}),
});

const partners = defineCollection({
	type: "data",
	schema: z.array(z.object({
		name: z.string(),
		imgPath: z.string(),
		url: z.string().url(),
		dimensions: z.object({
			width: z.string(),
			height: z.string(),
		}).optional(),
	})),
});

export const collections = {
	pages,
	partners,
};
