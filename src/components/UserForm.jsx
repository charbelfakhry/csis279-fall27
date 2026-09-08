import { useState } from "react";

const UserForm = () => {

    const [person, setPerson] = useState({
        firstName: "John",
        lastName: "Doe",
        age: 39
    });

    const updateFirstName = (event) => {
        setPerson({
            // spread object
            ...person,

            firstName: event.target.value
        }
        )
    } 

    const updateLastName = (event) =>{
        setPerson({
            ...person,
            lastName: event.target.value
        })
    }

    const upadateAge = (event) => {
        setPerson({
            ...person,
            age: event.target.value
        });
    }

    

    return(
        <>
            <h2>User Form</h2>
            <p>Welcome {person.firstName}, {person.lastName}, {person.age}</p>
            <input 
            type="text" 
            placeholder="Update First Name" 
            className="form-control" 
            onChange={updateFirstName}
            />

            <input
            type="text"
            className="form-control"
            placeholder="Update Last Name"
            onChange={updateLastName} />

            <input
            type="number"
            placeholder="Update Age"
            onChange={upadateAge}
            />
        </>
    )
}

export default UserForm;