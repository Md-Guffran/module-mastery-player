# Modern Course Player - Interactive Learning Platform

A dynamic, modern educational website inspired by DeepLearning.AI's course player, built with React, TypeScript, and Tailwind CSS.

## 🎯 Features

### 🎥 Advanced Video Player
- **Multi-Source Support**: Play videos from YouTube, Vimeo, uploaded files (MP4, MOV, AVI, MKV), Google Drive, and any video URL
- **Anti-Skip Protection**: Prevents users from skipping ahead until they've completed the video once
- **Smart Seek Controls**:
  - Disable forward skipping on first watch
  - Allow rewinding at any time
  - Unlock full seek controls after completion
- **Progress Persistence**: Video progress saves automatically and resumes on refresh

### 📊 Progress Tracking
- Real-time course completion percentage
- Visual progress bar at the top of the page
- Green checkmarks (✅) for completed lessons
- Lock indicators for unreached lessons
- Sequential lesson unlocking system

### 📚 Resources & Notes
- Downloadable resources (PDFs, articles, code files)
- Lesson notes and key takeaways
- Export notes as TXT files
- Organized tabs for easy navigation

### 🎨 Modern Design
- Clean, professional interface
- Gradient color scheme with purple/blue accents
- Smooth animations and transitions
- Responsive sidebar navigation
- Custom video player controls

## 🛠 Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Video**: React Player (multi-source support)
- **Animations**: Framer Motion
- **State**: React Hooks + localStorage
- **Build Tool**: Vite

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:8080](http://localhost:8080)

## 📝 How It Works

### Video Progress Tracking
The app uses localStorage to persist video progress across sessions. Each lesson tracks:
- Watched duration
- Completion status
- Whether seek controls are unlocked

### Anti-Skip Mechanism
- On first watch: Users can only rewind, not skip ahead
- Progress bar dragging is restricted to already-watched portions
- After completing once: Full seek controls unlock
- Visual indicator shows lock status

### Lesson Unlocking
- First lesson of each module is always unlocked
- Subsequent lessons unlock when previous lesson is completed
- Locked lessons show a lock icon and are disabled

## 🎨 Customization

### Adding Your Own Course Content

Edit `src/data/courseData.ts` to add your modules and lessons:

```typescript
export const courseModules: Module[] = [
  {
    id: 'module-1',
    title: 'Your Module Title',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Your Lesson Title',
        duration: '15:30',
        videoUrl: 'https://youtube.com/watch?v=...',
        videoType: 'youtube',
        description: 'Lesson description',
        notes: 'Your notes here...',
        resources: [
          {
            id: 'resource-1',
            title: 'Resource Title',
            type: 'pdf',
            url: 'https://...',
          },
        ],
      },
    ],
  },
];
```

### Video Types Supported
- `youtube`: YouTube URLs
- `vimeo`: Vimeo URLs
- `file`: Direct MP4/MOV/AVI/MKV files
- `url`: Any direct video URL

## 📱 Responsive Design

The platform is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile devices

## 🔒 Privacy

All progress data is stored locally in the browser's localStorage. No data is sent to external servers.

## 🎓 Perfect For

- Online courses
- Educational content
- Training programs
- Tutorial series
- Professional development

## 📄 License

Built with ❤️ using Lovable

---

**URL**: https://lovable.dev/projects/7341e0d2-295b-4818-89b5-fc3f8b872d65
