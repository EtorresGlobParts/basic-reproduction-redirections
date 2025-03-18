const testRegex = (redirect, slug) => {
    let dynamicPath;
    // Format the from property to support dynamic urls
    const from = `${redirect.from.replace(/\/$/, '')
        .replace(/:([a-zA-Z0-9_]+)(-[a-zA-Z0-9_]+)?/g, (_, name, s = "") => {
            dynamicPath = name;
            const suffix = s ? `\\${s}` : "";
            return `(?<${name}>[a-zA-Z0-9_\\/-]+)${suffix}`;
        })
        .replace(/\//g, "\\/")}\\/$`;

    const test = new RegExp(from).exec(slug);

    if (test) return { test, dynamicPath };
    return false;
};

const isDirectUrl = (path) => {
    try {
        const url = new URL(path)
        return url.protocol.includes("http")
    }
    catch {
        return false
    }
}

export const hasRedirection = async (slug, locale = "") => {
    try {
        const redirects = [
            {
                from: "^/hello-(world|mars)",
                to: "/resources/",
                is_regex: true,
                is_permanent: false,
            },
            {
                from: "/podcast/",
                to: "/podcasts/",
                is_regex: false,
                is_permanent: true,
            },
            {
                from: "/globalpedia/(.+)-peo",
                to: "/globalpedia/$1/eor/",
                is_regex: true,
                is_permanent: true,
            },
            {
                from: "/global-insights/talent-supply/",
                to: "/global-insights/",
                is_regex: false,
                is_permanent: true,
            },
            {
                from: "/book-a-demo-back-back/",
                to: "/book-demo/",
                is_regex: false,
                is_permanent: true,
            },
            {
                from: "/request-consultation-emea/",
                to: "/",
                is_regex: false,
                is_permanent: true,
            }, {
                from: "/home-2/",
                to: "/",
                is_regex: false,
                is_permanent: true,
            },
        ];

        if (redirects) {
            let dynamicPath = "";

            const match = redirects.reduce((acc, redirect) => {
                const { from } = redirect;

                if (redirect.is_regex) {
                    const regex = testRegex(redirect, slug)
                    // Extract the dynamic path
                    if (regex.test) {
                        dynamicPath = regex.dynamicPath;
                        acc.push({ ...redirect, regex: regex.test });
                    }
                }
                else {
                    // Check if the url matches exactly the slug
                    const isMatch = from === slug || from === `${slug}/`;
                    if (isMatch) acc.push(redirect);
                }
                return acc
            }, [])

            // If the current url matches any of the redirects it will consider the first one
            if (match.length) {
                if (isDirectUrl(match[0].to)) {
                    return {
                        redirect: {
                            destination: match[0].to,
                            permanent: match.is_permanent || false,
                        },
                    };
                }

                let direction = match[0].to.replace('*', '');
                const matchGroups = match[0]?.regex?.groups;

                if (matchGroups && dynamicPath) {
                    direction = direction.replace(`:${dynamicPath}`, matchGroups[dynamicPath])
                }

                if (direction.includes("$")) {
                    direction = direction.replace(/\$(\d+)/g, (placeholder, group) => {
                        const groupIndex = parseInt(group, 10);
                        return match[0].regex[groupIndex] || placeholder
                    })
                }

                return {
                    redirect: {
                        destination: `${(locale !== "en" ? `/${locale}` : "")}${direction}`,
                        permanent: match.is_permanent || false,
                    },
                };
            }
        }
        return false
    }
    catch (e) {
        return false
    }
}

export default hasRedirection;