import { useState } from "react";

const UserForm = () => {

    const [firstName, setFirstName] = useState('John');
    const [lastName, setLastName] = useState('Doe');
    const [n, setN] = useState(0);

    const updateFLName = (n1) =>{
        setN(n + n1);
        setFirstName("John "+n);
        setLastName("Doe "+n);
    }

    return(
        <>
            <h2>User Form</h2>
            <p>Welcome {firstName}, {lastName}</p>
            <button onClick={()=>updateFLName(2)}>Update FN LN</button>
        </>
    )
}

export default UserForm;