import { useState } from "react";

const UserForm = () => {

    const [person, setPerson] = useState({
        firstName: "John",
        lastName: "Doe",
        age: 39
    });

    const updateFirstName = (fn) => {
        setPerson({
            // spread object
            ...person,

            firstName: fn
        }
        )
    } 

    const updateLastName = (ln) =>{
        setPerson({
            ...person,
            lastName: "test ln"
        })
    }

    const upadateAge = (a) => {
        setPerson({
            ...person,
            age: a
        });
    }

    

    return(
        <>
            <h2>User Form</h2>
            <p>Welcome {person.firstName}, {person.lastName}, {person.age}</p>
            <button className="btn btn-success" onClick={()=>updateFirstName("test")}>Update FN LN</button>
            <button className="btn btn-danger" onClick={()=> updateLastName("ln test")}>Update Last Name</button>
            <button className="btn btn-sm btn-secondary" onClick={()=> upadateAge(44)}>Update Age</button>
        </>
    )
}

export default UserForm;