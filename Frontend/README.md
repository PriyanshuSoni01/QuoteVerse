# QuoteVerse Frontend

A social media platform for quotes and poems built with React, Vite, and Redux Toolkit.

## Features

- **User Authentication**: JWT-based authentication with email OTP verification
- **Social Feed**: Share and discover quotes, poems, and thoughts
- **User Discovery**: Search and follow other users
- **Real-time Chat**: Connect with friends through messaging
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **Framework**: React 18 with Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Icons**: React Icons (Feather)
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Notifications**: React Toastify
- **Real-time**: Socket.io-client

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Navbar, Sidebar)
│   ├── PostCard.jsx    # Post display component
│   └── CreatePost.jsx  # Post creation form
├── pages/              # Route components
│   ├── Feed.jsx        # Main timeline
│   ├── Discover.jsx    # User discovery
│   ├── Friends.jsx     # Friends management
│   └── Chat.jsx        # Real-time messaging
├── slices/             # Redux slices
│   ├── AuthSlice.js    # Authentication state
│   ├── PostsSlice.js   # Posts management
│   ├── FriendsSlice.js # Friends and discovery
│   └── ChatSlice.js    # Chat functionality
├── store.js            # Redux store configuration
└── App.jsx             # Main app component
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
