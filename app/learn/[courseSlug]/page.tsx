import { getCourse } from "@/lib/sanity/lib/queries";
import { notFound } from "next/navigation";
import CourseClient from "./client";

export const revalidate = 60;

type Props = {
	params: Promise<{
		courseSlug: string;
	}>;
};

export default async function CoursePage(props: Props) {
	const resolvedParams = await props.params;
	const { courseSlug } = resolvedParams;

	if (!courseSlug) {
		console.log("Missing courseSlug parameter");
		notFound();
	}

	try {
		const course = await getCourse(courseSlug);

		if (!course) {
			console.log("Course not found for slug:", courseSlug);
			notFound();
		}

		return <CourseClient course={course} />;
	} catch (error) {
		console.error("Error fetching course:", error);
		notFound();
	}
}
