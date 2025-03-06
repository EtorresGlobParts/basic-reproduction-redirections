import Page from "@/components/templates/Page";
import hasRedirection from "@/utils/redirects";
import getFromWordpress from "@/utils/server";
import { useRouter } from "next/router";

export default function Template(data) {
    const router = useRouter();
    const activeLocale = router.locale;
    const { page } = data;

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

    /*
        Instead of creating post children thank you pages in the CMS,
        we just remove the /thank-you/ part from the slug in next to
        get the parent post -> check if post has gated content -> if so,
        set the isResourcesThankYouPage flag in the data -> if not, return 404
    */
    const isResourcesThankYouPage = slug.includes("/resources/") && slug.endsWith("/thank-you");
    if (isResourcesThankYouPage) {
        slug = slug.replace("/thank-you", "");
    }

    const [page, options] = await Promise.all([getFromWordpress(`together/post?slug=${slug}`), getFromWordpress(`together/options`)]);

    if ((!page?.post_title && !page?.name && !page?.templateType) || page.post_status === "draft" || page.post_status === "future") {
        // Try to match to a redirect
        const redirect = await hasRedirection(slug, locale);
        if (redirect) return redirect
    }

    // Return 404 if page is empty, a draft, or doesn't exist (except for slug "404-2").
    if (page?.post_status === "draft" || page.post_status === "future" || ((!page || !Object.keys(page).length) && params.slug[0] !== "404-2")) {
        return {
            notFound: true,
        };
    }

    if (page?.post_type === "news") {
        if (page?.other_information?.press_release_language && locale !== page?.other_information?.press_release_language) {
            return {
                redirect: {
                    destination: `/${locale !== "en" ? locale : ""}${locale !== "en" ? "/news/" : "news/"}`,
                    permanent: true,
                },
            };
        }
    }

    // Trying to access a resource thank you page for page that doesn't contain gated content
    if (isResourcesThankYouPage && page?.gated_resource !== true) {
        return {
            notFound: true,
        };
    }

    let globalpediaIndex = null;
    if (page?.api_data_controls?.add_globalpedia) {
        globalpediaIndex = await getFromWordpress(`together/post_previews?post_type=globalpedia_index`);
    }

    let caseStudiesIndex = null;
    if (page?.api_data_controls?.add_case_studies) {
        caseStudiesIndex = await getFromWordpress(`together/post_previews?post_type=case-studies`);
    }

    // Pre-fetch pagination data:
    let blogData = [];
    if (slug.includes("/blog") || page?.post_type === "category") {
        blogData = await getFromWordpress(`together/blog_index`);
    }

    let globalpediaData = [];
    if (slug.includes("/globalpedia")) {
        globalpediaData = await getFromWordpress(`together/globalpedia_index`);
    }

    let caseStudiesData = [];
    if (slug.includes("/case-studies")) {
        caseStudiesData = await getFromWordpress(`together/case_studies_index`);
    }

    let resourcesData = [];
    if (slug.includes("/resources")) {
        resourcesData = await getFromWordpress(`together/resources_index`);
    }

    let eventsData = [];
    if (slug.includes("/events")) {
        eventsData = await getFromWordpress(`together/events_index`);
    }

    let podcastsData = [];
    if (slug.includes("/podcasts")) {
        podcastsData = await getFromWordpress(`together/podcast_index`);
    }

    let sitemapData = [];
    if (slug.includes("/sitemap")) {
        sitemapData = await getFromWordpress(`together/sitemap-data`);
    }

    return {
        props: {
            page,
            options,
            globalpediaIndex,
            caseStudiesIndex,
            isResourcesThankYouPage,
            prefetchedData: {
                blogData,
                globalpediaData,
                caseStudiesData,
                resourcesData,
                eventsData,
                podcastsData,
                sitemapData
            }
        },
        revalidate: 3600, // In seconds (every hour)
    };
}