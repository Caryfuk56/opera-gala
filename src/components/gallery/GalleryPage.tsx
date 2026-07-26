import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import GalleryModal from "./GalleryModal";

type GalleryResource = {
	public_id: string;
	format: string;
	width: number;
	height: number;
};

type GalleryResponse = Record<string, GalleryResource[]>;

type Props = {
	title: string;
	emptyMessage: string;
	loadingMessage: string;
	errorMessage: string;
};

function formatConcertHeading(slug: string): { title: string; date: string | null } {
	const normalized = slug.replaceAll("_", " ").trim();

	const dateMatch = normalized.match(/^(\d{4})[- ](\d{2})[- ](\d{2})(?:\s+|[-_]|$)(.*)$/);
	if (!dateMatch) return { title: normalized, date: null };

	const [, yyyy, mm, dd, restRaw] = dateMatch;
	const rest = restRaw.trim();
	return {
		title: rest ? rest : normalized,
		date: `${dd}. ${mm}. ${yyyy}`,
	};
}

const LoadingSpinner: FC<{ className?: string }> = ({ className }) => {
	return (
		<div
			className={`animate-spin rounded-full border-2 border-text-primary/30 border-t-text-primary ${className ?? ""}`}
			aria-hidden="true"
		/>
	);
};

const GallerySkeleton: FC = () => {
	return (
		<div className="mt-10 space-y-16" aria-hidden="true">
			{Array.from({ length: 2 }).map((_, sectionIdx) => (
				<div key={sectionIdx}>
					<div className="h-8 w-64 animate-pulse rounded bg-bg-secondary/70" />
					<div className="mt-2 h-4 w-32 animate-pulse rounded bg-bg-secondary/50" />
					<div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
						{Array.from({ length: 8 }).map((__, idx) => (
							<div
								key={idx}
								className={`${idx === 0 ? "col-span-2 row-span-2 aspect-[4/3] sm:aspect-auto" : "aspect-square"} relative overflow-hidden rounded-lg bg-bg-secondary/60`}
							>
								<div className="absolute inset-0 animate-pulse bg-bg-secondary/80" />
								<div className="absolute inset-0 flex items-center justify-center">
									<LoadingSpinner className="h-10 w-10" />
								</div>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
};

import { buildCloudinaryUrl } from "../../utils/cloudinary";

const GalleryPage: FC<Props> = ({ title, emptyMessage, loadingMessage, errorMessage }) => {
	const [data, setData] = useState<GalleryResponse | null>(null);
	const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

	useEffect(() => {
		let isActive = true;

		async function load() {
			try {
				setStatus("loading");
				const res = await fetch("/api/gallery");
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const json = (await res.json()) as GalleryResponse;
				if (!isActive) return;
				setData(json);
				setStatus("ready");
			} catch (err) {
				console.error("Failed to load gallery data.", err);
				if (!isActive) return;
				setStatus("error");
			}
		}

		load();
		return () => {
			isActive = false;
		};
	}, []);

	const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME as string | undefined;

	const concertSlugs = useMemo(() => {
		if (!data) return [];
		return Object.keys(data);
	}, [data]);

	if (status === "loading") {
		return (
			<section className="container py-24">
				<h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
					{title}
				</h1>
				<p className="sr-only">{loadingMessage}</p>
				<GallerySkeleton />
			</section>
		);
	}

	if (status === "error" || !data || !cloudName) {
		return (
			<section className="container py-24">
				<h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
					{title}
				</h1>
				<p className="mt-6 font-body text-base text-text-secondary">{errorMessage}</p>
			</section>
		);
	}

	if (concertSlugs.length === 0) {
		return (
			<section className="container py-24">
				<h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
					{title}
				</h1>
				<p className="mt-6 font-body text-base text-text-secondary">{emptyMessage}</p>
			</section>
		);
	}

	return (
		<section className="bg-bg-primary py-16 lg:py-24">
			<div className="container">
				<h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl lg:text-5xl">
					{title}
				</h1>

				<div className="mt-12 space-y-16">
					{concertSlugs.map((concertSlug) => {
						const resources = data[concertSlug] ?? [];
						const heading = formatConcertHeading(concertSlug);
						const images = resources.map((res) => {
							const src = buildCloudinaryUrl({
								cloudName,
								publicId: res.public_id,
								format: res.format,
								width: 600,
							});
							const fullSrc = buildCloudinaryUrl({
								cloudName,
								publicId: res.public_id,
								format: res.format,
							});
							return {
								src,
								fullSrc,
								alt: concertSlug,
								title: concertSlug,
							};
						});

						return (
							<div key={concertSlug}>
								<div>
									<h2 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
										{heading.title}
									</h2>
									{heading.date && (
										<p className="mt-2 font-body text-sm text-text-secondary">{heading.date}</p>
									)}
								</div>
								<GalleryModal images={images} showCtaSlide={false} />
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default GalleryPage;
