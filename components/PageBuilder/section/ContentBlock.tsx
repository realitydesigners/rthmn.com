import { CourseTemplate } from "@/components/PageBuilder/templates/CourseTemplate";
import { PortableText } from "@portabletext/react";

const ContentBlock = ({ block }) => {
	const { content } = block;

	return (
		<div className="relative w-full">
			<PortableText value={content} components={CourseTemplate} />
		</div>
	);
};

export default ContentBlock;
