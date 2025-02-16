import { Block, H1, H2, Text, Callout, Quiz } from '../components/LessonComponents';
import { PortableTextBuilder } from '../components/PortableTextBuilder';

export const WhatIsRealityDesign = new PortableTextBuilder('What is Reality Design?')
    .setDescription('Understanding the fundamental nature of reality and our role as conscious creators')
    .setEstimatedTime('45 minutes')
    .setOrder(1)
    .addContent(
        Block({
            key: 'intro_block',
            children: [
                H1({ text: 'What is Reality Design?' }),
                Callout({
                    title: 'Key Concepts',
                    points: [
                        'The nature of consciousness and reality',
                        'Understanding your role as a reality architect',
                        'The observer effect and quantum consciousness',
                        'Principles of conscious creation',
                        'The interconnected nature of all things',
                    ],
                }),
                Text({
                    text: `Reality Design is the art and science of consciously participating in the creation 
                    of your experienced reality. It starts with understanding that consciousness is fundamental 
                    to the universe, and that we are not passive observers but active participants in the 
                    unfolding of reality.`,
                }),
                Text({
                    text: `Unlike traditional perspectives that view reality as fixed and external, Reality 
                    Design recognizes that consciousness shapes the fabric of existence itself. Through 
                    understanding the principles of quantum mechanics, ancient wisdom traditions, and modern 
                    consciousness research, we can begin to grasp our role as reality architects.`,
                }),
                H2({ text: 'The Nature of Consciousness' }),
                Text({
                    text: `Consciousness is not a byproduct of the brain, but rather the fundamental ground 
                    of being from which all experience emerges. This understanding shifts our perspective 
                    from being trapped within reality to being the conscious creators of it.`,
                }),
                Quiz({
                    question: 'What is the fundamental nature of consciousness according to Reality Design?',
                    options: ['A byproduct of brain activity', 'The ground of all being', 'An evolutionary adaptation', 'A social construct'],
                    correctAnswer: 1,
                    explanation: `Reality Design recognizes consciousness as the fundamental ground of being 
                    from which all experience emerges, not merely a product of physical processes.`,
                }),
                Callout({
                    title: 'Next Steps',
                    type: 'tip',
                    points: [
                        'Begin observing how your consciousness affects your daily experience',
                        'Practice intentional focus and attention',
                        'Explore the quantum nature of reality through meditation',
                        'Notice the interconnections between all aspects of life',
                        'Start experimenting with conscious reality creation',
                    ],
                }),
            ],
        })
    )
    .build();
