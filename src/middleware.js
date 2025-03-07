import { NextResponse, userAgent } from "next/server";
import { hasRedirection } from "./utils/redirects";

const cache = new Map();

export async function middleware(request) {
	const pathn = request.nextUrl.pathname;
	const shouldExclude = pathn.match(/^\/(api|_next\/static|_next\/image|static|favicon\.ico|.*\.txt|.*\.xml)/);

	if (!shouldExclude) {
		const url = request.nextUrl.href;
		const parameters = request.nextUrl.search;

		// Regular expression to match locales in the URL
		const localisedRegex = /\/(es|fr|it|jp|nl|pt|pl|sv|ar|id|de|hi|he|kr|th|cn|hk|tw)(\/|$)/i;
		let locale = "en"; // Default value

		const match = url.match(localisedRegex);
		if (match && match[1]) {
			// Extract the locale from the matched part of the URL
			[, locale] = match;
		}

		// Call the redirection function
		const redirect = await hasRedirection(pathn, locale);

		if (redirect) {
			let destination = redirect?.redirect?.destination;
			if (destination && !destination.startsWith('http')) {
				destination = `${request.nextUrl.origin}${destination}${parameters}`;
			}

			return NextResponse.redirect(destination);
		}
	}

	const response = NextResponse.next();
	return response;
}