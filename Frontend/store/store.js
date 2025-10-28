import { configureStore } from '@reduxjs/toolkit'
import loginReducer from "../slices/LoginSlice.js"
import signupReducer from'../slices/SignupSlice.js'
import authReducer from "../slices/AuthSlice.js"
import postsReducer from '../slices/PostsSlice.js'
import friendsReducer from '../slices/FriendsSlice.js'
import chatReducer from '../slices/ChatSlice.js'

const store = configureStore({
    reducer:{
       login: loginReducer,
       signup: signupReducer,
       auth: authReducer,
       posts: postsReducer,
       friends: friendsReducer,
       chat: chatReducer,
    }
}) 

export default store;