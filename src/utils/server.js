import NodeCache from "node-cache";
import cacheBustingString from "./cacheBustingString";

export const cache = new NodeCache({
    stdTTL: 600,
    checkperiod: 610,
});

export const getFromWordpress = async (url = "") => {
    if (cache.has(url)) {
        return cache.get(url);
    }

    const processedUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL}/wp-json/${cacheBustingString(url)}`;

    try {
        const res = await fetch(processedUrl);
        let data;
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch (jsonError) {
            throw new Error(`Invalid JSON response from ${processedUrl}`);
        }
        cache.set(url, data);
        return data;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`${error.code} ${error.message} on URL ${processedUrl}`);
        return process.exit(1);
    }
};

export default getFromWordpress;
