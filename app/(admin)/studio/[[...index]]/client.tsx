"use client";

import config from "@/sanity.config";
import dynamic from "next/dynamic";
import React from "react";

const NextStudio = dynamic(
	() => import("next-sanity/studio").then((mod) => mod.NextStudio),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-screen w-screen items-center justify-center" />
		),
	},
);

export default function StudioClient() {
	return <NextStudio config={config} />;
}
