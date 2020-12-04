function initChess(){
    let map= []
    for (let i=0; i<8; i++){
      map.push([])
      for (let j=0; j<8; j++){     
        map[i].push(null)
      }
    }
    map[3][4]=true;
    map[4][3]=true;
    map[3][3]=false;
    map[4][4]=false;
    return map
  }

function countChess(chessMap){
  let blackNum = 0;
  let whiteNum = 0;
  chessMap.map(arr => {
    arr.map( chess => {
      if (chess) {
        blackNum ++
      } else if (chess === false){
        whiteNum ++
      }
    })
  })
  return {
    blackNum, whiteNum 
  }
}
module.exports = { initChess, countChess };
