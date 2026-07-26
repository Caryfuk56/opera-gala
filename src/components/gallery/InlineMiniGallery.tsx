import { useState, useEffect, useRef } from "react";
import type { FC } from "react";
import GalleryOverlay from "./GalleryOverlay";
import ErrorDisplay from "../ui/ErrorDisplay";
import { buildCloudinaryUrl } from "../../utils/cloudinary";
import type { GalleryImage, GalleryLabels, GalleryResponse } from "../../types/gallery";

interface InlineMiniGalleryProps {
	tag: string;
	limit?: number;
	className?: string;
	title?: string;
	galleryHref: string;
	messages: {
		loading: string;
		error: string;
		empty: string;
		more: string;
	};
	labels: GalleryLabels;
}

const LoadingSpinner: FC<{ className?: string }> = ({ className }) => {
	return (
		<div
			className={`animate-spin rounded-full border-2 border-text-primary/30 border-t-text-primary ${className ?? ""}`}
			aria-hidden="true"
		/>
	);
};

const InlineMiniGallery: FC<InlineMiniGalleryProps> = ({
	tag,
	limit = 10,
	className = "",
	title,
	galleryHref,
	messages,
	labels,
}) => {
	const [images, setImages] = useState<GalleryImage[]>([]);
	const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [clickedIndex, setClickedIndex] = useState(0);
	const scrollRef = useRef<HTMLDivElement>(null);

	// Fetch images
	useEffect(() => {
		let isActive = true;

		async function load() {
			try {
				setStatus("loading");
				
				const res = await fetch("/api/gallery");
				if (!res.ok) throw new Error("Failed to fetch gallery");
				
				const targetSlug = tag.replace("concert:", "");
				
				const data = (await res.json()) as GalleryResponse;
				const resources = data[targetSlug] || [];
				
				if (!isActive) return;

				const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
				if (!cloudName) throw new Error("Missing Cloudinary Cloud Name");

				const mappedImages = resources.map((res) => ({
					src: buildCloudinaryUrl({
						cloudName,
						publicId: res.public_id,
						format: res.format,
						height: 300
					}),
					fullSrc: buildCloudinaryUrl({
						cloudName,
						publicId: res.public_id,
						format: res.format
					}),
					alt: title || targetSlug,
					title: title || targetSlug,
				}));

				setImages(mappedImages);
				setStatus("ready");
			} catch (err) {
				console.error(err);
				if (isActive) setStatus("error");
			}
		}

		load();
		return () => {
			isActive = false;
		};
	}, [tag, title]);

	// Check scroll state
	const checkScroll = () => {
		if (!scrollRef.current) return;
		const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
		setCanScrollLeft(scrollLeft > 0);
		// Use a small buffer (1px) for float calculation inaccuracies
		setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
	};

	useEffect(() => {
		checkScroll();
		window.addEventListener("resize", checkScroll);
		return () => window.removeEventListener("resize", checkScroll);
	}, [images, status]);

	const scroll = (direction: "left" | "right") => {
		if (!scrollRef.current) return;
		const container = scrollRef.current;
		const scrollAmount = container.clientWidth * 0.75; // Scroll 75% of view
		container.scrollBy({
			left: direction === "left" ? -scrollAmount : scrollAmount,
			behavior: "smooth",
		});
	};

	const openModal = (index: number) => {
		setClickedIndex(index);
		setIsOpen(true);
	};

	if (status === "loading") {
		return (
			<div className={`flex flex-col items-center gap-6 ${className}`}>
				{title && (
					<h2 className="text-center font-heading text-3xl font-bold lg:text-4xl">
						{title}
					</h2>
				)}
				<div className="flex h-48 w-full items-center justify-center rounded-lg bg-bg-secondary/20">
					<LoadingSpinner className="h-8 w-8" />
					<span className="sr-only">{messages.loading}</span>
				</div>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className={`flex flex-col items-center gap-6 ${className}`}>
				{title && (
					<h2 className="text-center font-heading text-3xl font-bold lg:text-4xl">
						{title}
					</h2>
				)}
				<ErrorDisplay message={messages.error} className="w-full" />
			</div>
		);
	}

	if (images.length === 0) {
		return (
			<div className={`flex flex-col items-center gap-6 ${className}`}>
				{title && (
					<h2 className="text-center font-heading text-3xl font-bold lg:text-4xl">
						{title}
					</h2>
				)}
				<div className="w-full rounded-lg bg-bg-secondary/10 p-8 text-center font-body text-text-secondary">
					{messages.empty}
				</div>
			</div>
		);
	}

	return (
		<>
			<div className={`flex flex-col gap-8 ${className}`}>
				{title && (
					<h2 className="text-center font-heading text-3xl font-bold lg:text-4xl">
						{title}
					</h2>
				)}
				
				<div className="relative flex items-center gap-4">
					{/* Left Arrow */}
					<button
						type="button"
						onClick={() => scroll("left")}
						disabled={!canScrollLeft}
						className={`z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full transition-all duration-300 ${
							canScrollLeft
								? "bg-accent text-bg-primary shadow-md hover:bg-accent/90 hover:scale-110 cursor-pointer"
								: "bg-bg-secondary/30 text-text-secondary/30 cursor-default"
						}`}
						aria-label={labels.scrollLeft}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</button>

					{/* Images Container Wrapper with Gradient Masks */}
					<div className="relative flex-1 overflow-hidden">
						{/* Left Gradient Mask */}
						<div 
							className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-bg-primary to-transparent transition-opacity duration-300 ${
								canScrollLeft ? "opacity-100" : "opacity-0"
							}`} 
						/>

						{/* Scroll Container */}
						<div
							ref={scrollRef}
							onScroll={checkScroll}
							className="no-scrollbar flex gap-4 overflow-x-auto overflow-y-hidden pb-4 pt-1"
							style={{ scrollSnapType: "x mandatory" }}
						>
							{images.slice(0, limit).map((img, idx) => (
								<div
									key={idx}
									className="relative aspect-[4/3] h-48 flex-none cursor-pointer overflow-hidden rounded-lg bg-bg-secondary/20 transition-transform duration-300 hover:scale-[1.02]"
									style={{ scrollSnapAlign: "start" }}
									onClick={() => openModal(idx)}
								>
									<img
										src={img.src}
										alt={img.alt}
										className="h-full w-full object-cover"
										loading="lazy"
									/>
									<div className="absolute inset-0 bg-black/0 transition-colors duration-300 hover:bg-black/10" />
								</div>
							))}
							
							{/* "More" Link Card */}
							<div
								className="flex aspect-[4/3] h-48 flex-none items-center justify-center rounded-lg bg-bg-secondary/20 p-6 text-center"
								style={{ scrollSnapAlign: "start" }}
							>
								<a
									href={galleryHref}
									className="group flex flex-col items-center gap-2 text-text-secondary transition-colors hover:text-text-primary"
								>
									<span className="font-heading text-lg font-medium">{messages.more}</span>
									<span className="text-2xl transition-transform duration-300 group-hover:translate-x-1">→</span>
								</a>
							</div>
						</div>

						{/* Right Gradient Mask */}
						<div 
							className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-bg-primary to-transparent transition-opacity duration-300 ${
								canScrollRight ? "opacity-100" : "opacity-0"
							}`} 
						/>
					</div>

					{/* Right Arrow */}
					<button
						type="button"
						onClick={() => scroll("right")}
						disabled={!canScrollRight}
						className={`z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full transition-all duration-300 ${
							canScrollRight
								? "bg-accent text-bg-primary shadow-md hover:bg-accent/90 hover:scale-110 cursor-pointer"
								: "bg-bg-secondary/30 text-text-secondary/30 cursor-default"
						}`}
						aria-label={labels.scrollRight}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</button>
				</div>
			</div>

			<GalleryOverlay
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				images={images}
				initialIndex={clickedIndex}
				galleryHref={galleryHref}
				ctaLabel={messages.more}
				showCtaSlide={true}
				labels={labels}
			/>
		</>
	);
};

export default InlineMiniGallery;
