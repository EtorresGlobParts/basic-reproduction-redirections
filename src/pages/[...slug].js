import Page from "@/components/templates/Page";
import getFromWordpress from "@/utils/server";

export default function Template(data) {
    return <Page {...data} />;
}

export async function getStaticPaths() {
    // No need to prerender all paths in development
    if (process.env.VERCEL_ENV !== "production") {
        return { paths: [], fallback: "blocking" };
    }

    const data = await getFromWordpress(`together/paths`);
    return { paths: data, fallback: "blocking" };
}

export async function getStaticProps(ctx) {
    const { params, locale } = ctx;

    let slug = typeof params.slug !== "string" ? `/${params.slug.join("/")}` : params.slug;
    // If slug includes a space, redirect to the same slug but with a dash instead
    if (slug?.includes(" ")) {
        return {
            redirect: {
                destination: `/${(locale !== "en" ? locale : "") + slug.replace(/\s+/g, "-")}`,
                permanent: true,
            },
        };
    }

    const [page, options] = await Promise.all([getFromWordpress(`together/post?slug=${slug}`), getFromWordpress(`together/options`)]);
    // Return 404 if page is empty, a draft, or doesn't exist (except for slug "404-2").
    if (page?.post_status === "draft" || page.post_status === "future" || ((!page || !Object.keys(page).length) && params.slug[0] !== "404-2")) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            page,
            options
        },
        revalidate: 3600, // In seconds (every hour)
    };
}