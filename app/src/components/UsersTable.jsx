import { useEffect, useState } from "react";

const UsersTable = () => {

    const [users, setUsers] = useState([]);

    /*
        Use Effect lets us execute code when something
        happens in the lifecycle of the a component.
        Typical use:
        - fetching data from api
        - running code when component firs loads
        - reacting to a state/props change
        - setting up/cleaning up timers and subscription.
    */
    useEffect(()=>{
        fillDummyUsers()
    }, []);

    useEffect(()=>{
        
    })

    const fillDummyUsers = () => {
        let arr = [];
        for(let i = 0; i < 10; i++)
        {
            arr.push({
                id: i,
                firstName: `FN ${i}`,
                lastName: `LN ${i}`,
                age: 15 + i
            })
        }

        setUsers(arr);
    }

    return(
        <>
            <button className="btn btn-primary">Add</button>
            <table className="table">
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Age</th>
                        <th>Update</th>
                        <th>Del.</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        users.map((user)=>{
                            return(
                                <tr key={user.id}>
                                    <td>{user.firstName}</td>
                                    <td>{user.lastName}</td>
                                    <td>{user.age}</td>
                                    <td>
                                        <button className="btn btn-secondary">Update</button>
                                    </td>
                                    <td>
                                        <button className="btn btn-danger">Del.</button>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </>
    )
}

export default UsersTable;