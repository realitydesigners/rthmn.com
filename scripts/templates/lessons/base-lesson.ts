export interface LessonMetadata {
    title: string;
    description: string;
    estimatedTime: string;
    order: number;
    slug?: string; // Optional, can be auto-generated
}

export abstract class BaseLesson {
    constructor(protected metadata: LessonMetadata) {}

    abstract getContent(): any[]; // The lesson content using LessonComponents

    getMetadata() {
        return {
            ...this.metadata,
            slug: this.metadata.slug || this.generateSlug(),
        };
    }

    private generateSlug(): string {
        return this.metadata.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
