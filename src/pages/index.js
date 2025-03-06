import Template, { getStaticProps as getPageStaticProps } from "./[...slug]";

export default Template;

export async function getStaticProps() {
	const props = await getPageStaticProps({ params: { slug: "home" } });
	return props;
}
