var express = require( "express" );
const http = require( "http" );

var app = express();
const server = http.createServer(app);

var cors = require('cors');
app.use(cors());

const socketIo = require( "socket.io" )( server, {
  cors: {
    origin: "https://client-web-chat.vercel.app/",
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

const CHAT_BOT = 'ChatBot';
let allUsers = [];

app.get('/', function (req, res, next) {
  res.json({msg: 'Welcome to Nu web chat'})
})

socketIo.on( "connection", ( socket ) =>
{
  // join room
  socket.on( 'join_room', ( data ) =>
  {
    const { username, room } = data;
    console.log( username, 'join room', room );
    socket.join( room );

    socket.emit( 'receive_message', {
      message: `${ username } has joined the chat room`,
      username: CHAT_BOT,
      file: ''
    } );

    socket.to( room ).emit( 'receive_message', {
      message: `${ username } has joined the chat room`,
      username: CHAT_BOT,
      file: ''
    } );

    allUsers.push( { id: socket.id, username, room } );
    chatRoomUsers = allUsers.filter( ( user ) => user.room === room );
    socket.to( room ).emit( 'chatroom_users', chatRoomUsers );
    socket.emit( 'chatroom_users', chatRoomUsers );
  } );

  socket.on( "send_message", ( data ) =>
  {
    console.log( data );
    const { message, username, room, file } = data;
    socketIo.in( room ).emit( "receive_message", { message: message, username: username, room: room, file: file.toString( "base64") } )
  } );

  socket.on( 'upload_file', ( data ) =>
  {
    console.log( data );
  } )

  socket.emit("me", socket.id)

  socket.on("callUser", (data) => {
		socketIo.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})

  socket.on("answerCall", (data) => {
		socketIo.to(data.to).emit("callAccepted", data.signal)
	})

  socket.on( 'disconnect', () =>
  {
    console.log( 'User disconnected from the chat' );
  } );
} );

server.listen( 3000, () =>
{
  console.log("Server started!");
} );
