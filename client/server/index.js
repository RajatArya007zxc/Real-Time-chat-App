// const express=require('express');
// const socketio=require('socket.io');
// const http=require('http');
// const PORT=process.env.PORT||5000;

// const router =require('./router');

// const app=express();

// const server=http.createServer(app)
// const io=socketio(server);

// io.on('connection',(socket)=>{
//     console.log('connected');

//     socket.on('disconnect',()=>{
//         console.log('user left')
//     })
// })


// app.use(router);

// server.listen(PORT,()=>{
//     console.log(`Server on ${PORT}`)
// })



const express = require('express');
const app = express();
const server = require('http').createServer(app);   
const io = require('socket.io')(server,{
    cors: {
      origin: '*',
      methods: ["GET", "POST"]
    }
  });
  app.use(require('cors')())

  const {addUser,removeUser,getUser,getUsersInRoom}=require('./users');



const PORT=process.env.PORT||5000;


const router =require('./router');

io.on('connection',(socket)=>{
    console.log('connected');

    socket.on('join',({name,room},callback)=>{
        
        const {error,user}=addUser({id:socket.id,name,room});
        
        if(error) return callback(error)
   
        socket.emit('message',{user:'admin',text:`${user.name},welcome to ${user.room} room`})

        socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name}  has joined`})

         socket.join(user.room);


         /////
         io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)})

         
        callback()
    })
 
    //msg
    socket.on('sendMessage',(message,callback)=>{

        const user=getUser(socket.id);


        io.to(user.room).emit('message',{user:user.name,text:message})
        io.to(user.room).emit('roomData',{user:user.name,users:getUsersInRoom(user.room)})

        callback()

    })




    socket.on('disconnect',()=>{
        // console.log('user left')
        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} has left`})
        }
    })
})



app.use(router);

server.listen(PORT,()=>{
    console.log(`Server on ${PORT}`)
})