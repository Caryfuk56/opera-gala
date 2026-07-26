import type { FC } from "react";
import GalleryModal from "./GalleryModal";
import type { GalleryLabels, GalleryResponse } from "../../types/gallery";
import { buildCloudinaryUrl } from "../../utils/cloudinary";

type Props = {
	title: string;
	data: GalleryResponse | null;
	cloudName?: string;
	emptyMessage: string;
	errorMessage: string;
	labels: GalleryLabels;
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

const GalleryPage: FC<Props> = ({ title, data, cloudName, emptyMessage, errorMessage, labels }) => {
	const concertSlugs = data ? Object.keys(data) : [];

	if (!data || !cloudName) {
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
								<GalleryModal images={images} showCtaSlide={false} labels={labels} />
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default GalleryPage;
