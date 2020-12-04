import styled from 'styled-components';

const InputForm = styled.form`
    width: 300px;
    height: 200px;
    background-color: #3380FF;
    border-radius: 15px;
    padding: 20px;
  `;

 const InputBox = ({onSubmit, onChange , value}) => {
    

    return(
     
      <InputForm onSubmit={onSubmit}>
          <h3>Please enter room name</h3>
          <input value={value} onChange={onChange}></input>
          <button type="submit">Submit</button>
      </InputForm>
        

    )
  }

  export default InputBox;