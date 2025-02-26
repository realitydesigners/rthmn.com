# Course Generation System

This system allows for efficient, scalable generation of educational courses in Sanity CMS. It's designed to handle multiple courses, chapters, and lessons while maintaining consistency and type safety.

## Architecture

The system is structured into several components:

### Base Classes & Interfaces

- `BaseLesson`: Abstract class that all lessons extend
- `CourseStructure`: Interface defining the structure of a course

### Directory Structure

```
scripts/
├── generateCourse.ts         # Main script to generate courses
├── templates/
│   ├── courses/              # Course definitions
│   │   ├── base-course.ts    # Base course structure
│   │   └── forex-foundations-course.ts  # Example course
│   ├── lessons/              # Lesson implementations
│   │   ├── base-lesson.ts    # Base lesson structure
│   │   └── what-is-forex-trading.ts    # Example lesson
│   ├── components/           # Reusable content components
│   │   └── LessonComponents.ts  # Components for building lessons
│   └── utils/                # Utility functions
│       └── lesson-discovery.ts  # Automatic lesson discovery
```

## Creating a New Course

1. Create a new course file in `templates/courses/`
2. Create lesson files in `templates/lessons/`
3. Run the generator

### Example Course Definition

```typescript
// templates/courses/my-new-course.ts
import { CourseStructure } from './base-course';
import { MyFirstLesson } from '../lessons/my-first-lesson';
import { registerLessons } from '../utils/lesson-discovery';

const introLessons = registerLessons([
    MyFirstLesson,
    // Add other lessons
]);

export const myNewCourse: CourseStructure = {
    metadata: {
        title: 'My New Course',
        description: 'A description of my course',
        difficulty: 'beginner',
        icon: 'FaBook',
        order: 1,
    },
    chapters: [
        {
            metadata: {
                title: 'Introduction',
                description: 'An introduction to the topic',
                order: 1,
            },
            lessons: introLessons,
        },
        // Add more chapters
    ],
};
```

### Example Lesson Implementation

```typescript
// templates/lessons/my-first-lesson.ts
import { BaseLesson, LessonMetadata } from './base-lesson';
import { Block, H1, Text, Callout } from '../components/LessonComponents';

const metadata: LessonMetadata = {
    title: 'My First Lesson',
    description: 'An introduction to the course',
    estimatedTime: '15 minutes',
    order: 1,
};

export class MyFirstLesson extends BaseLesson {
    constructor() {
        super(metadata);
    }

    getContent() {
        return [
            Block({
                children: [
                    H1({ text: this.metadata.title }),
                    Text({ text: 'Welcome to the lesson!' }),
                    // Add more content
                ],
            }),
        ];
    }
}
```

## Running the Generator

Generate a single course:

```bash
bun scripts/generateCourse.ts
```

Generate multiple courses:

```typescript
// In generateCourse.ts
generateCourses([
    myFirstCourse,
    mySecondCourse,
    // Add more courses
]);
```

## Extending the System

### Adding New Components

Add new component functions to `LessonComponents.ts`:

```typescript
export const Table = (props: { headers: string[]; rows: string[][]; key?: string }) => ({
    _type: 'table',
    _key: props.key || generateKey(),
    headers: props.headers,
    rows: props.rows,
});
```

### Automated Lesson Discovery

The system supports automatic discovery of lessons based on directory structure:

```typescript
// Auto-discover all lessons in the 'introduction' directory
const introLessons = await discoverLessons('introduction');
```

## Benefits of This Architecture

1. **Modularity**: Each lesson and course is a separate module
2. **Type Safety**: TypeScript interfaces ensure correct structure
3. **Maintainability**: Clear separation of concerns
4. **Scalability**: Designed to handle many courses efficiently
5. **Consistency**: Enforced structure through base classes
6. **Error Handling**: Better error management and recovery

## Best Practices

1. Keep lesson content focused and modular
2. Maintain consistent naming conventions
3. Use descriptive metadata
4. Place related lessons in their own directories
5. Write comprehensive descriptions for courses and chapters
