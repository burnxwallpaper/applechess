import { useEffect, useState, useCallback } from 'react';

export const useDrawing = (chessBoard) => {

    const [color, setColor] = useState('white')
    const [space, setSpace] = useState(50);


    useEffect(() => {
        chessBoard && redrawBoard();      
    }, []);

        

    const drawCircle = (x,y, color) => {
        const c = chessBoard.current;
        const ctx = c.getContext("2d");
        ctx.beginPath();
        ctx.arc(x*space-space/2 , y*space - space/2, space/2.5, 0, 2 * Math.PI);
        ctx.fillStyle = color ? 'black' : 'white'; 
        ctx.fill();
        ctx.stroke();
    };
    
    const drawText= (x,y, text, color) => {
        const c = chessBoard.current;
        const ctx = c.getContext("2d");
        ctx.fillStyle = color ? "black" : "red";
        ctx.font = "30px Arial";
        ctx.fillText(text, x*space-10-space/2, y*space +10 -space/2);
    }
    
    const redrawBoard = () => {
        const c = chessBoard.current;
        const ctx = c.getContext("2d");

        ctx.clearRect(0, 0, c.width, c.height);
        ctx.beginPath();
        ctx.rect(0, 0, c.width, c.height);
        ctx.fillStyle = 'white';
        ctx.fill();
    
        ctx.beginPath();
        for (let i = 0; i<9; i++){   
          ctx.moveTo(i*space, 0);
          ctx.lineTo(i*space, 8*space);
          ctx.stroke();
          ctx.moveTo(0, i*space);
          ctx.lineTo(8*space, i*space);
          ctx.stroke();
        }
    }

    const getMousePos = useCallback((evt) => {
            const c = chessBoard.current;
            const rect = c.getBoundingClientRect();
            const x = Math.floor((evt.clientX - rect.left)/space)+1
            const y = Math.floor((evt.clientY - rect.top)/space)+1
            return { x, y };
        }, []);

    const onSpaceChange = (e) => {
        setSpace(e.target.value);
      }

    return {
        //chessBoard,
        drawCircle,
        drawText,
        redrawBoard,
        getMousePos,
        space
    };
}



