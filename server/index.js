import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import dbConnect from './db/dbConnect.js';
import authRout from './rout/authRout.js';
import userRout from './rout/userRout.js';

import { createServer } from 'http';
import { Server } from 'socket.io';


const app = express();

// Load dotenv configration.

dotenv.config();
const PORT = process.env.PORT || 3000;

let server = createServer(app);

const allowedOrigins = [process.env.CLIENT_URL];
// 🔧 Middleware to handle CORS
app.use(cors({
      origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                  callback(null, true); // ✅ Allow the request if it's from an allowed origin
            } else {
                  callback(new Error('Not allowed by CORS')); // ❌ Block requests from unknown origins
            }
      },
      credentials: true, // ✅ Allow sending cookies with requests
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // ✅ Allow these HTTP methods
}));

// 🛠 Middleware for handling JSON requests and cookies
app.use(express.json()); // Enables parsing of JSON request bodies
app.use(cookieParser()); // Enables reading cookies in HTTP requests

app.use('/api/auth', authRout);
app.use('/api/user', userRout);

app.get('/', (req, res) => {
      res.json("Welcome to my project:");
})

const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
            origin: allowedOrigins[0],
            methods: ["GET", "POST"],
      }
});
console.log("Success -- Socket.io initialized with CORS");

let onlineUser = [];

io.on("connection", (socket) => {
      console.log(`New Connection: ${socket.id}`);

      socket.emit("me", socket.id);
      socket.on("join", (user) => {
            if (!user || !user.id) {
                  console.log("Invalid User data in join");
                  return;
            }
            socket.join(user.id);

            const existingUser = onlineUser.find((u) => u.userId === user.id);
            if (existingUser) {
                  existingUser.socketId = socket.id;
            } else {
                  onlineUser.push({
                        userId: user.id,
                        name: user.name,
                        socketId: socket.id,
                  });
            }

            io.emit("online-users", onlineUser);
      })

      socket.on("callToUser" , (data) => {
         //   console.log("Incoming call from ::",data);
            const call = onlineUser.find( (user)=>user.userId === data.callToUserId )
            if(!call){
                  socket.emit("userUnavailable",{message: `${call?.name} is Offline`});
                  return
            }

 //Emit an event to the reciever socket(caller)
            io.to(call.socketId).emit("callToUser",{
                  signal:data.signalData,
                  from:data.from,
                  name:data.name,
                  email:data.email,
                  profilepic:data.profilepic
            })
      })

      socket.on("answeredCall" , (data)=> {
            io.to(data.to).emit("callAccepted" ,{
                  signal:data.signal,
                  from:data.from
            });
      }); 

      socket.on("call-ended",(data)=>{
            io.to(data.to).emit("callEnded",{
                  name:data.name,
                  
            })
      })
  
      socket.on("reject-call", (data) => {
            io.to(data.to).emit("callRejected",{
                  name:data.name,
                  profilepic:data.profilepic
            })
      })

      socket.on("disconnect", () => {
            const user = onlineUser.find((u) => u.socketId === socket.id);
            onlineUser = onlineUser.filter((u) => u.socketId !== socket.id);

            io.emit("online-users", onlineUser);

            socket.broadcast.emit("disconnectUser", { disUser: socket.id });

            console.log("Disconnected :", socket.id);
      });

});

(async () => {
      try {
            await dbConnect();
            server.listen(PORT, () => {
                  console.log("My server is running on PORT", PORT);
            })
      } catch (error) {
            console.error("Failed to connect with the databse", error)
            process.exit(1);
      }
})();

