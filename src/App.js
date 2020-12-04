
import { useState } from 'react';
import ChessRoom from './ChessRoom'
import InputBox from './components/InputBox';


function App() {  
  const [value, setValue] = useState('');
  const [roomId, setRoomId] = useState('');
  
  const onSubmitForm = () => {
    setRoomId(value)
  }

  const onInputChange = (e) => {
    setValue(e.target.value);
  }

  return (
    <div >
      {
        roomId 
          ? <ChessRoom roomId={roomId}></ChessRoom>
          : <InputBox onSubmit={onSubmitForm} onChange={onInputChange} value={value}/>
      }

    </div>
  );
}

export default App;
