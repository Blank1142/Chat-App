const express=require('express');
const path=require('path');
const http=require('http');
const socketio=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=socketio(server)
const Filter=require('bad-words')
const publicpath=path.join(__dirname,'./public')
const uti=require('./utils/message')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/user')
app.use(express.static(publicpath))

app.get('/',(req,res)=>{
    res.sendFile('/index.html')
})

io.on('connection',(socket)=>{
    
   
    
    socket.on('join',(option,callback)=>{
       const{error,user}= addUser({id:socket.id,...option})
        if(error){
return callback(error)
        }

       socket.join(user.room)

         socket.emit('Message',uti.generateMessage('Admin','Welcome'));
    socket.broadcast.to(user.room).emit('Message',uti.generateMessage('Admin',`${user.username} has Joined`));
  io.to(user.room).emit('roomData',{
      room:user.room,
      users:getUsersInRoom(user.room)
  })

    callback()
});
    
socket.on('message',(message,callback)=>{
    const user=getUser(socket.id)
    const filter=new Filter();
    if(filter.isProfane(message)){
        return callback('profanity is not allowed')
    }
    io.to(user.room).emit('Message',uti.generateMessage(user.username,message))
    callback();
   
})
 socket.on('disconnect',()=>{
     const user =removeUser(socket.id);
     if(user){
        io.to(user.room).emit('Message',uti.generateMessage('Admin',`${user.username} has Left`))
     io.to(user.room).emit('roomData',{
      room:user.room,
      users:getUsersInRoom(user.room)
  })
    }
        
    })
    socket.on('sendlocation',(cords,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',{name:user.username,url:`https://google.com/maps?q=${cords.latitude},${cords.longitude}`})
        callback('Location sent')
    })
});

server.listen(process.env.PORT||3000,()=>{
console.log('server started')
})