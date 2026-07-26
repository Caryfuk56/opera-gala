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

export type GalleryLabels = {
	dialog: string;
	close: string;
	previous: string;
	next: string;
	scrollLeft: string;
	scrollRight: string;
};
