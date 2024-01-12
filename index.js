var express = require( "express" );
const http = require( "http" );
var app = express();
const server = http.createServer( app );

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://client-web-chat.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Private-Network", true);
  res.setHeader("Access-Control-Max-Age", 7200);

  next();
});

const socketIo = require( "socket.io" )( server, {
  cors: {
    origin: "*",
  },
} );

const CHAT_BOT = 'ChatBot';
let chatRoom = '';
let allUsers = [];

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

    chatRoom = room;
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
  console.log( "Running server on port 3000" );
} );
