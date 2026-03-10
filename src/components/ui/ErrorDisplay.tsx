import type { FC } from "react";

interface ErrorDisplayProps {
	title?: string;
	message: string;
	className?: string;
}

const ErrorDisplay: FC<ErrorDisplayProps> = ({
	title = "Chyba",
	message,
	className = "",
}) => {
	return (
		<div
			className={`rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20 ${className}`}
			role="alert"
		>
			<h3 className="mb-2 font-heading text-lg font-bold text-red-800 dark:text-red-200">
				{title}
			</h3>
			<p className="font-body text-red-700 dark:text-red-300">{message}</p>
		</div>
	);
};

export default ErrorDisplay;
