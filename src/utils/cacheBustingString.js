export default function cacheBustingString(url = "") {
	const date = new Date();
	const dateStr =
		process.env.NODE_ENV === "production"
			? `${date.getMonth()}-${date.getDay()}-${date.getHours()}-${date.getMinutes().toString()}`
			: date.getTime().toString().slice(0, 9);

	if (!url.length) {
		return dateStr;
	}

	return `${url}${url.includes("?") ? `&v=${dateStr}` : `?v=${dateStr}`}`;
}
