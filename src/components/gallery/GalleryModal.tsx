import { useState } from "react";
import type { FC } from "react";
import GalleryOverlay from "./GalleryOverlay";
import type { GalleryImage, GalleryLabels } from "../../types/gallery";

interface GalleryModalProps {
	images: GalleryImage[];
	galleryHref?: string;
	ctaLabel?: string;
	showCtaSlide?: boolean;
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

const GalleryModal: FC<GalleryModalProps> = ({ images, galleryHref, ctaLabel, showCtaSlide = true, labels }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [loadedThumbs, setLoadedThumbs] = useState<Record<number, boolean>>({});

	const open = (index: number) => {
		setCurrentIndex(index);
		setIsOpen(true);
	};

	const close = () => {
		setIsOpen(false);
	};

	return (
		<>
			{/* Thumbnail grid */}
			<div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
				{images.map((image, index) => (
					<button
						key={image.src}
						type="button"
						onClick={() => open(index)}
						className={`group relative overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
							index === 0
								? "col-span-2 row-span-2 aspect-[4/3] sm:aspect-auto"
								: "aspect-square"
						}`}
					>
						{!loadedThumbs[index] && (
							<div className="absolute inset-0 bg-bg-secondary/60">
								<div className="absolute inset-0 animate-pulse bg-bg-secondary/80" />
								<div className="absolute inset-0 flex items-center justify-center">
									<LoadingSpinner className="h-8 w-8" />
								</div>
							</div>
						)}
						<img
							src={image.src}
							alt={image.alt}
							loading="lazy"
							decoding="async"
							onLoad={() => {
								setLoadedThumbs((prev) => ({ ...prev, [index]: true }));
							}}
							className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
								loadedThumbs[index] ? "opacity-100" : "opacity-0"
							}`}
						/>
						<div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
					</button>
				))}
			</div>

			{/* Modal Overlay */}
			<GalleryOverlay
				isOpen={isOpen}
				onClose={close}
				images={images}
				initialIndex={currentIndex}
				galleryHref={galleryHref}
				ctaLabel={ctaLabel}
				showCtaSlide={showCtaSlide}
				labels={labels}
			/>
		</>
	);
};

export default GalleryModal;
