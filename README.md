# QuoteVerse - Social Media Platform for Quotes & Poems

QuoteVerse is a modern social media platform designed specifically for sharing and discovering quotes, poems, and thoughtful content. Built with the MERN stack, it provides a clean, elegant interface for literary enthusiasts to connect and share their favorite verses.

## 🌟 Features

### Core Functionality
- **Content Sharing**: Create and share quotes, poems, and thoughts
- **Social Discovery**: Find and follow other users with similar interests
- **Real-time Chat**: Connect with friends through instant messaging
- **User Engagement**: Like and comment on posts
- **Smart Search**: Discover users by username or email

### User Experience
- **Responsive Design**: Optimized for desktop and mobile devices
- **Clean Interface**: Minimalist design focused on content
- **Real-time Updates**: Live notifications and messaging
- **Secure Authentication**: JWT-based auth with email OTP verification

## 🚀 Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Redux Toolkit** for state management
- **Tailwind CSS** for responsive styling
- **React Router** for navigation
- **Socket.io-client** for real-time features
- **Axios** for API communication

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Nodemailer** for email services
- **bcryptjs** for password hashing

## 📁 Project Structure

```
QuoteVerse/
├── Backend/                 # Node.js API server
│   ├── controllers/         # Business logic
│   ├── models/             # Database schemas
│   ├── routes/             # API endpoints
│   ├── middlewares/        # Authentication & validation
│   └── utils/              # Helper functions
├── Frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── slices/         # Redux state management
│   │   └── store.js        # Redux store
│   └── public/             # Static assets
└── docs/                   # Documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/quoteverse
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   PORT=3000
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📱 Usage

### Getting Started
1. **Sign Up**: Create an account with email verification
2. **Verify Email**: Complete OTP verification process
3. **Explore**: Browse the discover page to find interesting users
4. **Follow**: Connect with users whose content you enjoy
5. **Create**: Share your favorite quotes and poems
6. **Engage**: Like and comment on posts that resonate with you

### Key Features
- **Feed**: View posts from users you follow
- **Discover**: Find new users and content
- **Create**: Use the sidebar to quickly create new posts
- **Profile**: Manage your account and view your content
- **Chat**: Message friends in real-time

## 🔐 Authentication

QuoteVerse uses a secure authentication system:
- **JWT Tokens**: Secure token-based authentication
- **Email Verification**: OTP-based email verification
- **Password Security**: bcrypt hashing for password storage
- **Session Management**: Automatic token refresh

## 🌐 API Documentation

### Authentication Endpoints
- `POST /api/user/signup` - User registration
- `POST /api/user/signin` - User login
- `POST /api/user/send-otp` - Send verification OTP
- `POST /api/user/verify-otp` - Verify email OTP

### Social Features
- `GET /api/user/suggested` - Get suggested users
- `GET /api/user/search` - Search users
- `POST /api/user/follow` - Follow a user
- `POST /api/user/unfollow` - Unfollow a user

### Posts (Future Implementation)
- `POST /api/posts/create` - Create new post
- `GET /api/posts/feed` - Get user feed
- `POST /api/posts/like` - Like/unlike post
- `POST /api/posts/comment` - Add comment

## 🚀 Deployment

### Production Build
1. Build the frontend:
   ```bash
   cd Frontend && npm run build
   ```

2. Start production server:
   ```bash
   cd Backend && npm start
   ```

### Environment Variables (Production)
- Use MongoDB Atlas for database
- Configure email service (SendGrid, AWS SES)
- Set secure JWT secret
- Enable CORS for production domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the love for poetry and meaningful quotes
- Built with modern web technologies for optimal performance
- Designed with user experience and content discovery in mind

## 📞 Support

If you have any questions or need help with setup, please:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review the system architecture guide

---

**QuoteVerse** - *Where words find their home* ✨