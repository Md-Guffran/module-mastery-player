import { Module } from '@/types/course';

export const courseModules: Module[] = [
  {
    id: 'module-1',
    title: 'Introduction to Machine Learning',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'What is Machine Learning?',
        duration: '12:30',
        videoUrl: 'https://www.youtube.com/watch?v=ukzFI9rgwfU',
        videoType: 'youtube',
        description: 'Learn the fundamentals of machine learning and its applications',
        notes: 'Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.\n\nKey Concepts:\n- Supervised Learning\n- Unsupervised Learning\n- Reinforcement Learning\n\nApplications:\n- Image Recognition\n- Natural Language Processing\n- Recommendation Systems',
        resources: [
          {
            id: 'resource-1',
            title: 'Introduction to ML - Slides',
            type: 'pdf',
            url: 'https://example.com/intro-ml-slides.pdf',
          },
          {
            id: 'resource-2',
            title: 'ML Cheat Sheet',
            type: 'pdf',
            url: 'https://example.com/ml-cheatsheet.pdf',
          },
        ],
      },
      {
        id: 'lesson-1-2',
        title: 'Types of Machine Learning',
        duration: '15:45',
        videoUrl: 'https://www.youtube.com/watch?v=xtOg44r6dsE',
        videoType: 'youtube',
        description: 'Explore different types of machine learning algorithms',
        notes: 'Understanding the three main types of machine learning:\n\n1. Supervised Learning - Learning from labeled data\n2. Unsupervised Learning - Finding patterns in unlabeled data\n3. Reinforcement Learning - Learning through trial and error',
        resources: [
          {
            id: 'resource-3',
            title: 'Types of ML - Article',
            type: 'article',
            url: 'https://example.com/types-of-ml',
          },
        ],
      },
    ],
  },
  {
    id: 'module-2',
    title: 'Neural Networks Basics',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Introduction to Neural Networks',
        duration: '18:20',
        videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
        videoType: 'youtube',
        description: 'Understanding the building blocks of neural networks',
        notes: 'Neural networks are computing systems inspired by biological neural networks.\n\nKey Components:\n- Neurons (nodes)\n- Weights and Biases\n- Activation Functions\n- Layers (Input, Hidden, Output)',
        resources: [
          {
            id: 'resource-4',
            title: 'Neural Networks Code Example',
            type: 'code',
            url: 'https://github.com/example/neural-networks',
          },
        ],
      },
      {
        id: 'lesson-2-2',
        title: 'Activation Functions',
        duration: '14:15',
        videoUrl: 'https://www.youtube.com/watch?v=m0pIlLfpXWE',
        videoType: 'youtube',
        description: 'Learn about different activation functions and their uses',
        notes: 'Activation functions introduce non-linearity into neural networks.\n\nCommon Functions:\n- ReLU (Rectified Linear Unit)\n- Sigmoid\n- Tanh\n- Softmax',
      },
    ],
  },
  {
    id: 'module-3',
    title: 'Deep Learning Fundamentals',
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'What is Deep Learning?',
        duration: '16:30',
        videoUrl: 'https://www.youtube.com/watch?v=6M5VXKLf4D4',
        videoType: 'youtube',
        description: 'Introduction to deep learning and its applications',
        notes: 'Deep Learning uses neural networks with multiple layers to progressively extract higher-level features from raw input.',
        resources: [
          {
            id: 'resource-5',
            title: 'Deep Learning Research Papers',
            type: 'link',
            url: 'https://example.com/deep-learning-papers',
          },
        ],
      },
    ],
  },
];
