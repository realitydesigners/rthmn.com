export class LessonBuilder {
    private lesson: any = {};

    constructor(title: string) {
        this.lesson = {
            title,
            content: [],
        };
    }

    setDescription(description: string) {
        this.lesson.description = description;
        return this;
    }

    setEstimatedTime(time: string) {
        this.lesson.estimatedTime = time;
        return this;
    }

    setOrder(order: number) {
        this.lesson.order = order;
        return this;
    }

    addContent(content: any) {
        this.lesson.content.push(content);
        return this;
    }

    build() {
        return this.lesson;
    }
}
