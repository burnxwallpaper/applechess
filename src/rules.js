export const chessChange = (x,y, isDraw, chessMap, currentPlayer) => {
    let newChessMap = JSON.parse(JSON.stringify(chessMap));;

    if (chessMap[y-1][x-1] !== null) return isDraw ? false : ''
    newChessMap[y-1][x-1] = currentPlayer;
    
    let eatNum = rowChange(x, y, newChessMap, isDraw) + columnChange(x, y, newChessMap, isDraw) + slashChange(x, y, newChessMap, isDraw);

    if (!eatNum) {
      newChessMap[y-1][x-1] = null;
      return isDraw ? false : ''
    }

    return isDraw ? newChessMap : eatNum > 0 ? eatNum : '';
  }

  const slashChange = (x, y, newChessMap, isDraw) => {
    
    const currentChess = newChessMap[y-1][x-1];
    
    function eatFromRightBottom(){
      let isPairBottom = false;
      let eatNumBottom = 0;
      let diff = 2
      for( let i = y-1; i > 0; i-- ){ // eat from rightbottom
        let chess = newChessMap[i-1][x-diff];
        diff++;
        if (x-diff === -2) break
        if ( chess !== null && chess !== currentChess){
          eatNumBottom++
        } 
        else if(chess !== null && chess === currentChess) { 
          isPairBottom = true;
          let diff = 2;
          if (!isDraw) break;
          for( let j = y-1; j > i; j--){
            newChessMap[j-1][x-diff] = !newChessMap[j-1][x-diff] ;
            diff++;
            // drawCircle( x-diff+2, j, currentChess)
          }
          break
        } else break 
      }
      return eatNumBottom * isPairBottom;
    }
    

    function eatFromLeftBottom(){
      let isPairTop = false;
      let eatNumTop = 0;
      let diff=0;
      for( let i = y-1; i > 0; i-- ){ // eat from leftbottom
        let chess = newChessMap[i-1][x+diff];
        diff++;
        if (x+diff === 10) break
        
        if ( chess !== null && chess !== currentChess){
          eatNumTop++
        } 
        else if(chess !== null && chess === currentChess) { 
          isPairTop = true;
          let diff = 0;
          if (!isDraw) break;
          for( let j = y-1; j > i; j--){
            newChessMap[j-1][x+diff] = !newChessMap[j-1][x+diff] ;
            diff++;
            // drawCircle( x+diff, j, currentChess)
          }
          break
        } else break 
      }
      return eatNumTop * isPairTop;
    }

    
    function eatFromLeftTop(){
      let isPairTop = false;
      let eatNumTop = 0;
      let diff=0;
      for( let i = y; i < 8; i++ ){ // eat from leftTop
        let chess = newChessMap[i][x+diff];
        diff++;
        if (x+diff === 10) break
        
        if ( chess !== null && chess !== currentChess){
          eatNumTop++
        } 
        else if(chess !== null && chess === currentChess) { 
          isPairTop = true;
          let diff = 0;
          if (!isDraw) break;
          for( let j = y-1; j < i-1 ; j++){
            newChessMap[j+1][x+diff] = !newChessMap[j+1][x+diff] ;
            diff++;
            // drawCircle( x+diff, j+2, currentChess)
          }
          break
        } else break     
      }

      return eatNumTop * isPairTop;
    }
    
    function eatFromRightTop(){
      let isPairBottom = false;
      let eatNumTop = 0;
      let diff=2;
      for( let i = y; i < 8; i++ ){ // eat from rightTop
        let chess = newChessMap[i][x-diff];
        diff++;
        if (x-diff === -2) break
        
        if ( chess !== null && chess !== currentChess){
          eatNumTop++
        } 
        else if(chess !== null && chess === currentChess) { 
          isPairBottom = true;
          let diff = 2;
          if (!isDraw) break;
          for( let j = y-1; j < i-1 ; j++){
            newChessMap[j+1][x-diff] = !newChessMap[j+1][x-diff] ;
            diff++;
            // drawCircle( x-diff+2, j+2, currentChess)
          }
          break
        } else break 
        
      }

      return eatNumTop * isPairBottom
    }
    return eatFromRightBottom() + eatFromLeftBottom() + eatFromLeftTop() + eatFromRightTop();
  } 

  const columnChange= (x,y ,newChessMap, isDraw) => {
    let eatNumTop = 0;
    let eatNumBottom = 0;
    let isPairTop = false;
    let isPairBottom = false;
    const currentChess = newChessMap[y-1][x-1];
    for( let i = y-1; i > 0; i-- ){ // eat from bottom
      let chess = newChessMap[i-1][x-1]
      if ( chess !== null && chess !== currentChess ){
        eatNumBottom++
      } 
      else if(chess !== null && chess === currentChess) { 
        isPairBottom = true;
        if (!isDraw) break;
        for( let j = y-1; j > i; j--){
          newChessMap[j-1][x-1] = !newChessMap[j-1][x-1]  
        }
        break
      } else break 
    }
    for( let i = y+1; i < 9; i++ ){ // eat from top
      let chess = newChessMap[i-1][x-1]
      if ( chess != null && chess !== currentChess ){
        eatNumTop++
      } 
      else if(chess !== null && chess === currentChess) { 
        isPairTop = true;
        if (!isDraw) break;
        for( let j = y; j < i-1; j++){
          newChessMap[j][x-1] = !newChessMap[j][x-1]  
        }
        break
      } else break 
    }
    return eatNumTop * isPairTop + eatNumBottom * isPairBottom;
  }

  const rowChange = (x,y ,newChessMap, isDraw) => {
    let eatNumLeft = 0;
    let eatNumRight = 0;
    let isPairLeft = false;
    let isPairRight= false;
    let currentRow = newChessMap[y-1]
    const currentChess = newChessMap[y-1][x-1]
    for( let i = x-1; i > 0; i-- ){ //eat from left
      if (currentRow[i-1] !== null && currentRow[i-1] !== currentChess ){
        eatNumLeft++
      } 
      else if(currentRow[i-1] !== null && currentRow[i-1] === currentChess) {  
        isPairLeft = true;
        if (!isDraw) break;
        for( let j = x-1; j > i; j--){
          currentRow[j-1] = !currentRow[j-1]
        }
        break
      } else break 
    }
    for( let i = x+1; i < 9; i++ ){ //eat from right
      if (currentRow[i-1] !== null && currentRow[i-1] !== currentChess){
        eatNumRight++
      } 
      else if(currentRow[i-1] !== null && currentRow[i-1] === currentChess) {
        isPairRight = true;
        if (!isDraw) break;
        for( let j = x; j < i-1; j++){
          currentRow[j] = !currentRow[j]
        }
        break
      } else break
    }
    return eatNumLeft * isPairLeft + eatNumRight * isPairRight;
  }