import cs from "./cs";
import en from "./en";

export type Lang = "cs" | "en";
export type Translations = typeof cs;

const translations: Record<Lang, Translations> = { cs, en };
const supportedLangs: Lang[] = ["cs", "en"];

export function getI18n(lang: string | undefined) {
	const resolved: Lang = supportedLangs.includes(lang as Lang)
		? (lang as Lang)
		: "cs";
	const alternateLang: Lang = resolved === "cs" ? "en" : "cs";

	return {
		lang: resolved,
		alternateLang,
		t: translations[resolved],
	};
}

export function getPath(lang: string, slug: string = "") {
	return `/${lang}${slug ? `/${slug}` : ""}`;
}

export function getNavItems(lang: string) {
	const { t } = getI18n(lang);
	return [
		{ label: t.nav.program, href: getPath(lang, "program") },
		{ label: t.nav.about, href: getPath(lang, "about") },
		{ label: t.nav.artists, href: getPath(lang, "artists") },
		{ label: t.nav.gallery, href: getPath(lang, "gallery") },
		{ label: t.nav.practicalInfo, href: getPath(lang, "practical-info") },
		{ label: t.nav.contact, href: getPath(lang, "contact") },
	];
}

export function getAlternateUrl(
	pathname: string,
	currentLang: string,
	alternateLang: string,
): string {
	const segments = pathname.split("/").filter(Boolean);
	if (segments[0] === currentLang) {
		segments[0] = alternateLang;
	}
	return "/" + segments.join("/");
}

export function getStaticLangPaths() {
	return supportedLangs.map((lang) => ({ params: { lang } }));
}
