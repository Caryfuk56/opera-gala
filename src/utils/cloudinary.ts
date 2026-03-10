export function buildCloudinaryUrl(params: {
	cloudName: string;
	publicId: string;
	format: string;
	width?: number;
	height?: number;
}) {
	const { cloudName, publicId, format, width, height } = params;
	const transforms = ["f_auto", "q_auto"];
	if (width) transforms.push(`w_${width}`);
	if (height) transforms.push(`h_${height}`);
	
	const transformString = transforms.join(",");
	return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}.${format}`;
}
