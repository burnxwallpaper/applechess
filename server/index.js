

const app = require('express')();
const port = process.env.PORT || 4000;
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
      }
});
 
let onlineUsers = {};
let usernameList = []
let onlineCount = 0
let socketList = []
const chessChange  = require ('./rules');
const {initChess, countChess} = require('./features');

let room ={
    'room1':{
        playerBlack: '',
        playerWhite: '',
        chessMap : null
    }
}

const getHintsMap = (chessMap, currentPlayer) => {
    let hintsMap = []; 
    let total = 0;
    for (let y=1; y<9; y++){
        hintsMap[y-1]=[]
        for (let x=1; x<9; x++){
          const eatNum = chessChange(x,y, false, currentPlayer, chessMap );
          hintsMap[y-1][x-1] = eatNum
          total += eatNum || 0;
        }
    }
    if (!total) return false
    return hintsMap;   
}   

const initGame = (roomId) => {
    let newChessMap = initChess()
    room[roomId].countChess = countChess(newChessMap);
    room[roomId].chessMap = newChessMap
    room[roomId].currentPlayer = true
    room[roomId].status = 'playing';
    room[roomId].hintsMap = getHintsMap(newChessMap, true);
    io.to(roomId).emit('gameStart', { ...room[roomId] });
}

const endGame = (roomId ) => {
    const { blackNum, whiteNum } =countChess(room[roomId].chessMap);
    room[roomId].status = 'waiting';
    room[roomId].playerBlackReady = false; 
    room[roomId].playerWhiteReady = false;
    let winner = blackNum > whiteNum ? 'playerBlack' : 'playerWhite';
    let isSpecial = blackNum + whiteNum < 64 ? true : false;
    io.to(roomId).emit('gameEnd', { winner, isSpecial  });
    io.to(roomId).emit('chessUpdate', { ...room[roomId] });
    io.to(roomId).emit('roomInfo', {roomInfo : room[roomId]});
    console.log(`Game end, winner of room ${roomId} is ${winner}`)
}

io.on('connection', function (socket) {
    onlineUsers[socket.id]={};
    socket.on('join', (data) => {
        console.log(data)
        let roomId = data.roomId.toString();
        if (!room[roomId]){
            room[roomId] = {
                status: 'waiting',
                playerBlack: '',
                playerWhite: '',
                observers: [],
                hintsMap: [],
                playerBlackReady:false,
                playerWhiteReady: false,
                roomId:roomId 
            };
        }  
        
        socket.join(roomId);
        socket.roomId = roomId;
        if (!room[roomId].playerBlack ){
            socket.role= 'playerBlack';
            room[roomId].playerBlack = socket.id;
        } else if (!room[roomId].playerWhite){  
            socket.role= 'playerWhite';
            room[roomId].playerWhite = socket.id;
        } else{
            socket.role = 'observer';
            room[roomId].observers.push(socket.id);
            if (room[roomId].hintsMap){
                io.to(roomId).emit('chessUpdate', { ...room[roomId] });
            }
        }
        console.log(`socket.id ${socket.id} joined roomId ${roomId} as ${socket.role}`)
        socket.emit('role', socket.role) 
        
        if (room[roomId].playerBlack 
            && room[roomId].playerWhite 
            && room[roomId].status === 'waiting'
            && room[roomId].playerBlackReady 
            && room[roomId].playerWhiteReady
            && socket.role !=='observer'
        ){
            initGame(roomId);
        }

        io.to(roomId).emit('roomInfo', {roomInfo : room[roomId]});
           
    }) 
    
    socket.on('ready', (isReady) => {
        if (socket.role === 'observer') return;
        let roomId = socket.roomId;
        room[roomId][`${socket.role }Ready`] = isReady;
        
        if (room[roomId].playerBlackReady && room[roomId].playerWhiteReady){
            initGame(roomId);
        }
        io.to(roomId).emit('roomInfo', {roomInfo : room[roomId]});
    })

    socket.on('restart', () => {
        if (socket.role === 'observer') return;
        let roomId = socket.roomId; 
        if (room[roomId].playerBlackReady && room[roomId].playerWhiteReady){
            initGame(roomId);
        }
        io.to(roomId).emit('roomInfo', {roomInfo : room[roomId]});
    })
 
    socket.on('putChess', (chessData) => {
        if (socket.role === 'observer') return;
        console.log('putChess', chessData); 
        let roomId = socket.roomId ; 
        const currentPlayer = socket.role === 'playerBlack' ? true : false
        if (currentPlayer !==  room[roomId].currentPlayer) return
        const {x, y } = chessData;
        let newChessMap = chessChange(x,y, true, currentPlayer, room[roomId].chessMap)
        if (newChessMap){ 
            const { blackNum, whiteNum } =countChess(newChessMap)
            room[roomId].countChess = { blackNum, whiteNum };
            room[roomId].chessMap = newChessMap;
            const hintsMap = getHintsMap(newChessMap, !currentPlayer)
            if (blackNum + whiteNum === 64){
                endGame(roomId);
                return 
            }
            if (!hintsMap) {
                
                if (!getHintsMap(newChessMap, currentPlayer)){
                    endGame(roomId);
                    return
                }
                room[roomId].hintsMap =  getHintsMap(newChessMap, currentPlayer);
                io.to(roomId).emit('swap', {swapToPlayer : socket.role});
                io.to(roomId).emit('chessUpdate', { ...room[roomId] });
                return;
            }
            room[roomId].currentPlayer = !currentPlayer; 
            room[roomId].hintsMap = hintsMap;
        };
         
        io.to(roomId).emit('chessUpdate', { ...room[roomId] })
    }) 

    socket.on('disconnect', () => {
        if (!socket || !socket.role) return;
        let roomId = socket.roomId ;
        if (!roomId) return;
        if (socket.role === 'playerBlack'){
            room[roomId].playerBlack = '';
            room[roomId].playerBlackReady = false;
        } else if (socket.role === 'playerWhite'){
            room[roomId].playerWhite = '';
            room[roomId].playerWhiteReady = false;
        }  else { 
            let index = room[roomId].observers.indexOf(socket.id);
            if (index !== -1) {
                room[roomId].observers.splice(index, 1);
            };
            io.to(roomId).emit('roomInfo', {roomInfo : room[roomId]});
            console.log(`socket.id ${socket.id}, socket.role :${socket.role } leaved roomId ${roomId}`);
            return;
        } ; 

        if (room[roomId].status !== 'waiting' ){
            room[roomId].status = 'waiting';  
            io.to(roomId).emit('gameEnd', { loser: socket.role });
        } 

        io.to(roomId).emit('roomInfo', {roomInfo : room[roomId]});
       console.log(`socket.id ${socket.id}, socket.role :${socket.role } leaved roomId ${roomId}`)

    }) 
});



server.listen(port, ()=> {
    console.clear();
    console.log('listen on ' + port + '!')
});

