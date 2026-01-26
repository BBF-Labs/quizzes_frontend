# BetaForge Labs Quizzes 📚

<div align="center">

![BetaForge Labs Quizzes](https://quizzes.bflabs.tech/api/og)

**An interactive quiz platform designed for university students to enhance their learning experience**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.1-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![React Query](https://img.shields.io/badge/TanStack_Query-5.0-FF4154?logo=react-query)](https://tanstack.com/query/latest)

[Live Demo](https://quizzes.bflabs.tech) · [Report Bug](https://github.com/BBF-Labs/quizzes_frontend/issues) · [Request Feature](https://github.com/BBF-Labs/quizzes_frontend/issues)

</div>

---

## ✨ Overview

BetaForge Labs Quizzes is a comprehensive quiz platform tailored for Ghanaian university students. It provides lecture-specific quizzes, flashcards, and assessments to help students master their coursework and improve exam performance.

### 🎯 Key Features

- **📝 Lecture-Specific Quizzes** - Practice with questions tailored to your exact lecture content
- **📊 Progress Tracking** - Monitor your improvement with detailed analytics
- **⚡ Instant Feedback** - Get immediate results and explanations after each quiz
- **🎴 Flashcards** - Create and study flashcards for better retention
- **🎨 Personal Quizzes** - Generate custom quizzes with AI assistance
- **⏱️ Custom Timers** - Set your own pace with customizable quiz durations
- **📱 Responsive Design** - Study seamlessly on desktop, tablet, or mobile
- **🌙 Dark Mode** - Easy on the eyes with theme support

### 🏫 Supported Universities

- University of Ghana (UG)
- Ashesi University
- University of Cape Coast (UCC)
- *More coming soon...*

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm/yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BBF-Labs/quizzes_frontend.git
   cd quizzes_frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=your_api_url_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
quizzes_frontend/
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes (OG image generation)
│   │   ├── auth/          # Authentication pages (login, signup)
│   │   ├── courses/       # Course listing page
│   │   ├── packages/      # Subscription packages page
│   │   ├── quizzes/       # Quiz listing page
│   │   └── user/          # User dashboard
│   │       ├── flashcards/       # Flashcard management
│   │       ├── pay/              # Payment flow
│   │       ├── personal-quizzes/ # AI-generated quizzes
│   │       ├── profile/          # User profile
│   │       └── quiz/             # Quiz taking interface
│   ├── assets/            # Images and static assets
│   ├── components/        # Reusable UI components
│   │   ├── ui/            # Base UI components (shadcn/ui)
│   │   └── wrappers/      # Layout wrappers
│   ├── config/            # App configuration
│   ├── controllers/       # API request handlers
│   ├── hooks/             # Custom React hooks (TanStack Query hooks)
│   ├── interfaces/        # TypeScript interfaces
│   ├── lib/               # Utilities and logic
│   │   ├── services/      # API services (Axios instances)
│   │   └── utils/         # Utility functions
│   └── types/             # TypeScript type definitions
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [Radix UI](https://www.radix-ui.com/) | Accessible UI primitives |

### State Management
| Technology | Purpose |
|------------|---------|
| [TanStack Query](https://tanstack.com/query/latest) | Server state management, caching, and data synchronization |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Global client state management |
| [Redux Persist](https://github.com/rt2zz/redux-persist) | State persistence for local user settings |

### Additional Libraries
| Library | Purpose |
|---------|---------|
| [Axios](https://axios-http.com/) | HTTP client |
| [React Hot Toast](https://react-hot-toast.com/) | Toast notifications |
| [React Markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering |
| [Lucide React](https://lucide.dev/) | Icon library |
| [date-fns](https://date-fns.org/) | Date utilities |

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 💳 Pricing Plans

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | Free | 2 free quiz accesses, Basic course coverage |
| **Semester** | ₵9.00/month | Unlimited quizzes, Progress tracking, Offline access |
| **Quiz Credits** | ₵1.00/100 | Pay as you go, Full feature access |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software owned by BBF Labs.

---

## 👥 Team

### Backend Team
| [<img src="https://github.com/BenedictTTM.png?size=100" width="100px;" alt="Benedict Afotey"/><br /><sub><b>Benedict Afotey</b></sub>](https://github.com/BenedictTTM) | [<img src="https://github.com/aduuuna.png?size=100" width="100px;" alt="Joy Owusu Ansah"/><br /><sub><b>Joy Owusu Ansah</b></sub>](https://github.com/aduuuna) | [<img src="https://github.com/bennydan7.png?size=100" width="100px;" alt="Bernard Asiedu Owusu-Dankwah"/><br /><sub><b>Bernard Asiedu Owusu-Dankwah</b></sub>](https://github.com/bennydan7) | [<img src="https://github.com/Prudentkurler.png?size=100" width="100px;" alt="Obed Owusu"/><br /><sub><b>Obed Sarkodie</b></sub>](https://github.com/Prudentkurler) | [<img src="https://github.com/emmanuellaAk.png?size=100" width="100px;" alt="Emmanuella Animwaa Kumah"/><br /><sub><b>Emmanuella Animwaa Kumah</b></sub>](https://github.com/emmanuellaAk) | [<img src="https://github.com/theniitettey.png?size=100" width="100px;" alt="Michael Perry Nii Tettey"/><br /><sub><b>Michael Perry Nii Tettey</b></sub>](https://github.com/theniitettey) |
| :---: | :---: | :---: | :---: | :---: | :---: |

### Frontend Team
| [<img src="https://github.com/DylanGates.png?size=100" width="100px;" alt="Solomon Afoh"/><br /><sub><b>Solomon Afoh</b></sub>](https://github.com/DylanGates) | [<img src="https://github.com/gabby-tech1.png?size=100" width="100px;" alt="Gabby"/><br /><sub><b>Gabby</b></sub>](https://github.com/gabby-tech1) | [<img src="https://github.com/codeDeSyntax.png?size=100" width="100px;" alt="Josiah Okornoe"/><br /><sub><b>Josiah Okornoe</b></sub>](https://github.com/codeDeSyntax) | [<img src="https://github.com/theniitettey.png?size=100" width="100px;" alt="Michael Perry Nii Tettey"/><br /><sub><b>Michael Perry Nii Tettey</b></sub>](https://github.com/theniitettey) | [<img src="https://github.com/Maranathaodai.png?size=100" width="100px;" alt="Maranatha Odai"/><br /><sub><b>Maranatha Odai</b></sub>](https://github.com/Maranathaodai) |
| :---: | :---: | :---: | :---: | :---: |

<div align="center">

**BetaForge Labs Team**

Created with ❤️ for Ghanaian university students

</div>

---

## 📬 Contact

- **Website**: [quizzes.bflabs.tech](https://quizzes.bflabs.tech)
- **Twitter**: [@BFLabs](https://twitter.com/BFLabs)
- **Email**: Contact through the website

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

</div>
