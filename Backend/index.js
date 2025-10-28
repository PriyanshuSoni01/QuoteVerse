import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import userRoute from './routes/user.route.js'
import postsRoutes from './routes/posts.route.js'
import friendsRoutes from './routes/friends.route.js'
import chatRoutes from './routes/chat.route.js'
import cors from 'cors';
import path from 'path'
import { Server } from 'socket.io'
import http from 'http'
dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(()=>{
  console.log('Connected to MongoDB')
})
.catch((err)=>{
  console.log(err)
})

const app = express()
const server = http.createServer(app)

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    methods: ["GET", "POST"]
  }
})

// Store online users
const onlineUsers = new Map()

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  // User joins with their ID
  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id)
    socket.userId = userId
    console.log(`User ${userId} joined with socket ${socket.id}`)
    
    // Broadcast online status to friends
    socket.broadcast.emit('userOnline', userId)
  })
  
  // Handle new message
  socket.on('sendMessage', (messageData) => {
    const receiverSocketId = onlineUsers.get(messageData.receiverId)
    if (receiverSocketId) {
      // Send message to receiver
      io.to(receiverSocketId).emit('receiveMessage', messageData)
      // Send notification dot
      io.to(receiverSocketId).emit('newMessageNotification', {
        senderId: messageData.sender._id,
        senderName: messageData.sender.username,
        chatId: messageData.chatId
      })
    }
  })
  
  // Handle typing status
  socket.on('typing', (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', {
        userId: data.senderId,
        isTyping: data.isTyping
      })
    }
  })
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    if (socket.userId) {
      onlineUsers.delete(socket.userId)
      // Broadcast offline status
      socket.broadcast.emit('userOffline', socket.userId)
    }
  })
})

// Make io accessible in routes
app.set('io', io)

server.listen(3000, ()=>{
    console.log('Server is running on port 3000!!!')
})

// const __dirname = path.resolve()

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://quoteverse-frontend.onrender.com"], // Frontend URLs
  methods: "GET,POST,PUT,DELETE",
  credentials: true // if you're using cookies
}));

app.use(cookieParser())
app.use('/api/user',userRoute)
app.use('/api/posts', postsRoutes)
app.use('/api/friends', friendsRoutes)
app.use('/api/chat', chatRoutes)
app.use('/', (req,res) => {
  console.log("Server working fine");
  res.json({ message: "Server working fine" });
})

app.use((err, req, res ,next) =>{
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server error'
  return res.status(statusCode).json({
    success:false,
    statusCode,
    message,
  })
})