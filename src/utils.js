import { useState, useEffect, useCallback } from 'react';
import { useDrawing } from './draw';

export const useSocket = (roomId, chessBoard) => {

    const { getMousePos, redrawBoard, drawCircle, drawText } = useDrawing(chessBoard);
    
    const [socket, setSocket] = useState(null);

    const [chessMap, setChessMap] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState('waiting someone');
    const [role, setRole] = useState();
    const [roomInfo, setRoomInfo] = useState();
    const [hintsMap, setHintsMap] = useState([]);
    const [countChess, setCountChess]= useState();
    const [gameState, setGameState] = useState(false);

	const [isAuto, setIsAuto] = useState(false);
	const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!socket){
            let devSer = "ws://192.168.19.124:4000";
            const io = require('socket.io-client');
            setSocket(io(devSer));
        }
        
    }, [socket]);


    useEffect(() => {
        if (!socket) return ;
        socket.off();
        socket.emit('join', {playerName : 'Testplayer', roomId})
        socket.on('roomInfo', (data) => {
		  const { roomInfo } = data;
		  console.log(roomInfo);
          setRoomInfo(roomInfo);
        });
        socket.on('role', (role) => {
          console.log('role', role)
            setRole(role);
        })

        socket.on('chessUpdate', (data) => { 
            console.log(data);
            const { chessMap, currentPlayer, hintsMap, countChess } = data;
            console.log('currentPlayer', currentPlayer)
            setChessMap(chessMap)
            setCurrentPlayer(currentPlayer);
            setHintsMap(hintsMap); 
            setCountChess(countChess);
            setRoomInfo(data);
        });
        socket.on('gameStart', (data) => {
            setGameState(true);
            const { chessMap, hintsMap, countChess, currentPlayer } = data;
            setCurrentPlayer(currentPlayer);
            setChessMap(chessMap);
            setHintsMap(hintsMap);
            setCountChess(countChess) 
        })
        socket.on('swap', (data) => {
          //const { swapToPlayer } = data;
      	})
        socket.on('gameEnd', (data) => {  
			setIsReady(false);
			setGameState(false);
			const { loser, winner, isSpecial } = data;
			if (loser){ 
				//alert(loser + ' has left the game');
			}
			if (winner){
				//alert('The winner is ' + winner);
			}
			if (!isSpecial){
				//onReadyChange(); //TEST
  
			}  
			
          
        })
	}, [socket]) 
	
	const autoPutChess = useCallback(() => {
		let bestScore = 0;
		let bestPosition;
		
		for (let y=1; y<9; y++){
		  for (let x=1; x<9; x++){
			if (hintsMap.length === 0 || !hintsMap[y-1]) return;
			
			const eatNum = hintsMap[y-1][x-1]
			let checkScore = checkPositionScore(x,y,eatNum);
			if (checkScore > bestScore) {
			  bestScore = checkScore;
			  bestPosition = { x, y };
			} else if (checkScore === bestScore){ //for random
			  if ( checkScore * Math.random() > bestScore * Math.random())
			  bestPosition = { x, y };
			}
		  }
		}
		if (!bestScore === 0 ) return;
		const currentPlayer = role === 'playerBlack' 
			? true 
			: role === 'playerWhite' 
			  ? false
			  : 'observer';
		socket.emit('putChess', { ...bestPosition, currentPlayer});
	}, [hintsMap, role, socket]);

    useEffect(() => {
      let isMe = false;
      if (role === 'playerBlack' && currentPlayer){
        isMe = true;
      } else if (role === 'playerWhite' && !currentPlayer){
        isMe = true;
      }  
      
      if (isAuto && gameState && isMe){
        autoPutChess();
      }; 
    }, [chessMap, isAuto, currentPlayer, autoPutChess, gameState, role])

	const showHints = useCallback(() => {
        for (let y=1; y<9; y++){
          for (let x=1; x<9; x++){
            if (hintsMap.length === 0 || !hintsMap[y-1]) return;
            const eatNum = hintsMap[y-1][x-1]
            drawText(x,y, eatNum || '' , currentPlayer);
          }
        }
    }, [hintsMap, currentPlayer, drawText]);

    const reFreshUI = useCallback(() => {
        redrawBoard();

        chessMap?.forEach((arr, y)=> {
            arr.forEach((chess, x) => {
                if (chess !== null) {
                    drawCircle(x+1, y+1, chess);
                };
            })
        })
        if (roomInfo && roomInfo.status ==='playing'){
			showHints();
		}
        
	}, [chessMap, drawCircle, redrawBoard, showHints]);
	
	useEffect(() => {
        if (!chessMap) return;
        reFreshUI();
    }, [chessMap, hintsMap, gameState, reFreshUI])

    


    const putChess = useCallback((evt) => {
        const { x, y } = getMousePos(evt);
        const currentPlayer = role === 'playerBlack' 
          ? true 
          : role === 'playerWhite' 
            ? false
            : 'observer';
        socket.emit('putChess', {x, y, currentPlayer});
    }, [socket, getMousePos, role])

    
    
    const onAutoChange = () => {
      setIsAuto(prev => !prev);
	}  
	
	const onReadyChange = useCallback(() => {
		socket.emit('ready', !isReady);
		setIsReady(prev => !prev);
	}, [isReady, socket])
  

    return { 
        role,
        currentPlayer,
        putChess,
        roomInfo,
        countChess,
        onAutoChange,
		isAuto,
		onReadyChange,
		isReady,
    };

    
}


const checkPositionScore = (x,y, eatNum) => {
    if (!eatNum) return 0;
    let score = eatNum;
    if (x ===1 || x === 8) score +=5;
    if (y ===1 || y === 8) score +=5;
    return score;
  }

// export const useFeatures = () => {
    
//     const [chessMap, setChessMap] = useState(null);
//     const [bestPosition, setBestPosition] = useState({});
//     const [currentPlayer, setCurrentPlayer] = useState(true); //true = 'black
//     const [usingAI, setUsingAI] = useState(false); 
    

//     const { drawCircle, drawText, redrawBoard, getMousePos, chessBoard } = useDrawing();
    
    
//     useEffect(() => {
//         chessMap && reFreshUI();
//     }, [chessMap]);

//     const reFreshUI = () => {
//         redrawBoard();
//         chessMap?.map((arr, y)=> {
//             arr.map((chess, x) => {
//             if (chess !== null) {
//                 drawCircle(x+1, y+1, chess);
//             };
//             })
//         })
//         showHints();
//     }
    
//     const putChess = (evt, position, isOpponent) => {
//         const { x, y } = getMousePos(evt);
//         let newChessMap;
//         newChessMap = chessChange(x || position.x, y || position.y, true, chessMap, currentPlayer);
//         if (!newChessMap) return;
//         setChessMap(newChessMap);
//         setCurrentPlayer(prev => !prev);

//     }
    
//       const showHints = () => {
//         let total = 0;
    
//         let bestScore = 0;
//         let bestPosition;
//         for (let y=1; y<9; y++){
//           for (let x=1; x<9; x++){
//             const eatNum = chessChange(x,y,false, chessMap, currentPlayer)
//             let checkScore = checkPositionScore(x,y,eatNum);
//             if (checkScore > bestScore) {
//               bestScore = checkScore;
//               bestPosition = { x, y };
//             }
//             total += eatNum || 0;
//             drawText(x,y, eatNum , currentPlayer);
//           }
//         }
//         // setBestPosition(bestPosition);
//         // const { blackNum, whiteNum } = countChess()
//         // if (blackNum + whiteNum === 64){
//         //   let winner = blackNum > whiteNum ? 'Black wins' : blackNum === whiteNum ? 'Draw' : 'White wins'
//         //   alert(`${winner}`);
//         //   return  
//         // } 
//         // if (total === 0 ){ 
//         //   setCurrentPlayer(prev => !prev);
//         //   alert('Current player has no move, swap!');
//         // }
//         // if (usingAI && !currentPlayer && total > 0) {
//         //   putChess({}, bestPosition);
//         // }
    
//       }

    

//     function countChess(){
//         let blackNum = 0;
//         let whiteNum = 0;
//         chessMap?.map(arr => {
//           arr.map( chess => {
//             if (chess) {
//               blackNum ++
//             } else if (chess === false){
//               whiteNum ++
//             }
//           })
//         })
//         return {
//           blackNum, whiteNum 
//         }
//       }
//     function onUsingAIChange(){
//         setUsingAI(prev=>!prev);
//     }
      

//     return {
//         drawText,
//         drawCircle,
//         redrawBoard,
//         getMousePos,
//         countChess,
//         onUsingAIChange,
//         currentPlayer,
//         usingAI,
//         putChess
        
//     }
// }



