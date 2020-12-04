import { useRef } from 'react';
import { useSocket } from './utils';
import { useDrawing } from './draw';
import styled from 'styled-components';

import CheckBox from './components/CheckBox';

const ContentBox = styled.div`
    width: 600px;
	height: 500px;
  `;

const CanvasArea = styled.div`
	position: relative;
  `;

const RoomInfoContainer = styled.div`
	padding : 0 20px;
	border: 1px solid black;
	width: 200px;
	height: 398px;

	overflow-y: auto;
`;

const Row = styled.div`
	display: flex;
	
`;

const ReadyBtn = styled.div`
	display: flex;
	position: absolute;
	width: 150px;
	height: 100px;
	border: 1px solid black;
	border-radius: 20px;
	background-color: ${ props => props.isReady ? '#62FF33' : '#FBFF33'};
	justify-content: center;
	align-items: center;
	font-size: 30px;
	left: 31%;
	top: 30%;
	cursor: pointer;
`;

const AIBtn = styled.div`
	display: flex;
	position: absolute;
	width: 150px;
	height: 100px;
	border: 1px solid black;
	border-radius: 20px;
	background-color: ${ props => props.isReady ? '#62FF33' : '#FBFF33'};
	justify-content: center;
	align-items: center;
	font-size: 30px;
	left: 31%;
	top: 30%;
	cursor: pointer;
`;

const HeaderContainer = styled.div`
	border: 1px solid black;
`;

const Header = ({ children, role }) => {
    return(
      <div>    
        <div>You are {role}</div>
		{children}
      </div>
    )
  }
const ChessRoom = ({ roomId }) => {  
  const chessBoard = useRef(null)
  const { space } = useDrawing(chessBoard);
  const { 
    putChess,
    currentPlayer, 
    role, 
    roomInfo, 
    countChess,
    onAutoChange,
	isAuto,
	onReadyChange,
	isReady,
  } = useSocket(roomId, chessBoard);

  return(
	  <ContentBox>
	  <HeaderContainer>
		<Header value={isAuto} onChange={onAutoChange} role={role}>
			<Row>
				{
					role !=='observer' &&
					<CheckBox label={'Using AI'} value={isAuto} onChange={onAutoChange} /> 
				}

			</Row>
			<h4>(Black) {countChess?.blackNum} vs {countChess?.whiteNum} (White)</h4>
		</Header>
	  </HeaderContainer>
	  
		<Row>
			<CanvasArea>
				{roomInfo?.status === 'waiting' && role !=='observer' &&
					<ReadyBtn isReady={isReady} onClick={onReadyChange} > Ready!</ReadyBtn>
				}
				<canvas 
					ref={chessBoard} 
					width={8*space} 
					height={8*space} 
					onClick={ putChess} /> 
			</CanvasArea> 
			<RoomInfoContainer>
				<h3>Room Info</h3>
				<div>RoomId : {roomInfo?.roomId}</div>
				<div>CurrentPlayer:  {currentPlayer ? 'Black' : 'White' } </div>
				<br></br>
				<div>Player Black: {roomInfo?.playerBlack?.substring(0, 4)}</div>
				<div>Ready: {roomInfo?.playerBlackReady? 'Yes' : 'No'}</div>
				<div>Player White: {roomInfo?.playerWhite?.substring(0, 4)}</div>
				<div>Ready: {roomInfo?.playerWhiteReady? 'Yes': 'No'}</div> 
				<br></br>
				<div>status: {roomInfo?.status}</div>
				
				<br></br>
				<div>Observers List: </div>
				{
					roomInfo?.observers?.map((observer) => {
						return(
							<div key={observer}>
								{observer?.substring(0, 4)}
							</div>
						)
					})
				}
			</RoomInfoContainer>
		</Row>
	</ContentBox>
  )
}


export default ChessRoom;