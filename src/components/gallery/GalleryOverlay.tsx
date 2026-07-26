import { useEffect, useRef, useState, useCallback } from "react";
import type { FC } from "react";
import type { GalleryImage, GalleryLabels } from "../../types/gallery";

interface GalleryOverlayProps {
	isOpen: boolean;
	onClose: () => void;
	images: GalleryImage[];
	initialIndex: number;
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

const GalleryOverlay: FC<GalleryOverlayProps> = ({
	isOpen,
	onClose,
	images,
	initialIndex,
	galleryHref,
	ctaLabel,
	showCtaSlide = true,
	labels,
}) => {
	const [currentIndex, setCurrentIndex] = useState(initialIndex);
	const [hoverZone, setHoverZone] = useState<"left" | "right" | null>(null);
	const [isModalImageLoaded, setIsModalImageLoaded] = useState(false);
	const touchStartX = useRef<number | null>(null);
	const modalRef = useRef<HTMLDivElement>(null);

	const lastImageIndex = images.length - 1;
	const isOnCtaSlide = showCtaSlide && currentIndex > lastImageIndex;

	// Reset index when opening
	useEffect(() => {
		if (isOpen) {
			setCurrentIndex(initialIndex);
			setIsModalImageLoaded(false);
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen, initialIndex]);

	const goPrev = useCallback(() => {
		setCurrentIndex((prev) => Math.max(0, prev - 1));
	}, []);

	const goNext = useCallback(() => {
		setCurrentIndex((prev) => {
			if (prev >= lastImageIndex) return lastImageIndex + 1;
			return prev + 1;
		});
	}, [lastImageIndex]);

	// Keyboard navigation
	useEffect(() => {
		if (!isOpen) return;

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowLeft") goPrev();
			if (e.key === "ArrowRight") goNext();
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose, goPrev, goNext]);

	// Focus trap
	useEffect(() => {
		if (isOpen && modalRef.current) {
			modalRef.current.focus();
		}
	}, [isOpen]);

	// Reset loading state on slide change
	useEffect(() => {
		if (!isOpen) return;
		if (isOnCtaSlide) return;
		setIsModalImageLoaded(false);
	}, [isOpen, currentIndex, isOnCtaSlide]);

	function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const width = rect.width;

		if (x < width * 0.25) {
			setHoverZone("left");
		} else if (x > width * 0.75) {
			setHoverZone("right");
		} else {
			setHoverZone(null);
		}
	}

	function handleTouchStart(e: React.TouchEvent) {
		touchStartX.current = e.touches[0].clientX;
	}

	function handleTouchEnd(e: React.TouchEvent) {
		if (touchStartX.current === null) return;
		const deltaX = e.changedTouches[0].clientX - touchStartX.current;
		touchStartX.current = null;

		if (Math.abs(deltaX) < 50) return;

		if (deltaX < 0) {
			goNext();
		} else {
			goPrev();
		}
	}

	function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
		if (e.target === e.currentTarget) onClose();
	}

	const canGoPrev = currentIndex > 0;
	const canGoNext = showCtaSlide ? currentIndex <= lastImageIndex : currentIndex < lastImageIndex;

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
			onClick={handleOverlayClick}
			onMouseMove={handleMouseMove}
			onMouseLeave={() => setHoverZone(null)}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			role="dialog"
			aria-modal="true"
			aria-label={labels.dialog}
			ref={modalRef}
			tabIndex={-1}
		>
			{/* Close button */}
			<button
				type="button"
				onClick={onClose}
				className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/80 transition-colors hover:bg-black/60 hover:text-white"
				aria-label={labels.close}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>

			{/* Left navigation zone */}
			{canGoPrev && hoverZone === "left" && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						goPrev();
					}}
					className="absolute left-0 top-0 z-10 flex h-full w-1/4 cursor-w-resize items-center justify-start pl-4 sm:pl-8"
					aria-label={labels.previous}
				>
					<span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/50">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</span>
				</button>
			)}

			{/* Right navigation zone */}
			{canGoNext && hoverZone === "right" && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						goNext();
					}}
					className="absolute right-0 top-0 z-10 flex h-full w-1/4 cursor-e-resize items-center justify-end pr-4 sm:pr-8"
					aria-label={labels.next}
				>
					<span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/50">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</span>
				</button>
			)}

			{/* Content area */}
			<div className="relative mx-auto max-h-[85vh] max-w-[90vw] sm:max-w-[80vw]">
				{isOnCtaSlide ? (
					<div className="flex min-h-[40vh] flex-col items-center justify-center rounded-lg bg-bg-secondary/90 px-10 py-16 shadow-2xl backdrop-blur-md sm:min-h-[50vh] sm:px-20">
						<h3 className="text-center font-heading text-2xl font-bold text-text-primary sm:text-3xl lg:text-4xl">
							{ctaLabel}
						</h3>
						{galleryHref && ctaLabel && (
							<a
								href={galleryHref}
								className="mt-8 inline-flex items-center justify-center rounded px-6 py-3 text-sm font-medium text-text-primary shadow-md transition-all duration-200 cta-primary"
							>
								{ctaLabel}
							</a>
						)}
					</div>
				) : (
					<div className="relative">
						{!isModalImageLoaded && (
							<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-bg-secondary/80 shadow-2xl">
								<div className="absolute inset-0 animate-pulse rounded-lg bg-bg-secondary/90" />
								<LoadingSpinner className="relative h-12 w-12" />
							</div>
						)}
						<img
							src={images[currentIndex]?.fullSrc ?? images[currentIndex]?.src}
							alt={images[currentIndex]?.alt || ""}
							onLoad={() => setIsModalImageLoaded(true)}
							className={`max-h-[85vh] rounded-lg object-contain shadow-2xl ${
								isModalImageLoaded ? "opacity-100" : "opacity-0"
							}`}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default GalleryOverlay;
