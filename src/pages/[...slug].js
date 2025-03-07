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
    const [page, options] = await Promise.all([getFromWordpress(`together/post?slug=${slug}`), getFromWordpress(`together/options`)]);
  
    return {
        props: {
            page,
            options
        },
        revalidate: 3600, // In seconds (every hour)
    };
}