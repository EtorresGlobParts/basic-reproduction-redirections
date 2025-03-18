import Page from "@/components/templates/Page";

export default function Template(data) {
    return <Page {...data} />;
}

export async function getStaticPaths() {
    // No need to prerender all paths in development
    return { paths: [], fallback: "blocking" };
}

export async function getStaticProps(ctx) {
    const pages = [
        {
            post_title: "Home",
            url: "https://staging.globalization-partners.com/",
            slug: "home",
        },
        {
            post_title: "Resources",
            url: "https://staging.globalization-partners.com/resources/",
            slug: "resources",
        },
        {
            post_title: "Podcasts",
            url: "https://staging.globalization-partners.com/podcasts/",
            slug: "podcasts",
        },
        {
            post_title: "Globalpedia EOR",
            url: "https://staging.globalization-partners.com/globalpedia/$1/eor/",
            slug: "globalpedia-eor",
        },
        {
            post_title: "Global Insights",
            url: "https://staging.globalization-partners.com/global-insights/",
            slug: "global-insights",
        },
        {
            post_title: "Book a Demo",
            url: "https://staging.globalization-partners.com/book-demo/",
            slug: "book-a-demo",
        },
        {
            post_title: "Request Consultation EMEA",
            url: "https://staging.globalization-partners.com/",
            slug: "request-consultation-emea",
        },
    ];

    const { params } = ctx;

    // Valida que el slug exista en la lista de páginas
    const matchedPage = pages.find(page => page.slug === (Array.isArray(params.slug) ? params.slug.join("/") : params.slug));

    if (!matchedPage) {
        return {
            notFound: true, // Devuelve un 404 si no encuentra el slug
        };
    }

    return {
        props: {
            page: matchedPage,
        },
        revalidate: 3600, // En segundos (cada hora)
    };
}
