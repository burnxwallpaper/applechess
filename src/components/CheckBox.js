

const CheckBox = ({ label, value, onChange }) => {

    return(
        <div>
            <h4> {label} <input type="checkbox" checked={value} onChange={onChange} /></h4>
            
        </div>
    )
};

export default CheckBox;