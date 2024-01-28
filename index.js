const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");

const app = express();

dotenv.config();
app.use(express.json());
app.use(cors());

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(MONGO_URI);
    console.log("Server is Connected to MongoDB");
  } catch (err) {
    console.log("Could not connect to MongoDB =>", err.message);
  }
};

const server = app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}....`);
  connectDb();
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  //console.log("connecting");
  socket.on("setup", (user) => {
    //console.log("setup");
    socket.join(user.data._id);

    socket.emit("connected");
    console.log("socket connected");
  });

  socket.on("join chat", (room) => {
    //console.log("joining chat");
    socket.join(room);
  });

  socket.on("new message", (newMessageStatus) => {
    //console.log("new message recieved: " + newMessageStatus.data.content);
    var chat = newMessageStatus.data.chat;

    if (!chat.users) {
      return console.log("chat.users not defined");
    }
    chat.users.forEach((user) => {
      if (user._id == newMessageStatus.data.sender._id) return;

      socket.in(user._id).emit("message received", newMessageStatus.data);
      // console.log("sending message back");
      // socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
});
