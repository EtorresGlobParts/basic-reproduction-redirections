import React from "react";

export default function Page(data) {
	return (
		<div id="page-content">
			<h1>
				{data?.page?.post_title}
			</h1> 
			{data?.page?.url}
		</div>
	);
}
