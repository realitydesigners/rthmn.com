"use client";

import { CourseTemplate } from "@/components/PageBuilder/templates/CourseTemplate";
import {
	DarkTemplate,
	LightTemplate,
	VideoTemplate,
} from "@/components/PageBuilder/templates/Templates";
import { PortableText } from "@portabletext/react";
import type { PortableTextComponents } from "@portabletext/react";
import React from "react";

const templateStyles = {
	dark: "w-full bg-black",
	light: "w-full bg-neutral-200",
};

const templateComponents = {
	dark: DarkTemplate as PortableTextComponents,
	light: LightTemplate as PortableTextComponents,
	video: VideoTemplate as PortableTextComponents,
	course: CourseTemplate as PortableTextComponents,
};

const CourseBlock = ({ block }) => {
	const { content, layout } = block;
	const theme = layout || "dark";
	const styles = templateStyles[theme];

	return (
		<div className={`relative w-full ${styles}`}>
			<PortableText value={content} components={templateComponents[theme]} />
		</div>
	);
};

export default CourseBlock;
