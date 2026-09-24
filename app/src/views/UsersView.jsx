import { useCallback, useEffect, useState } from "react";
import UserForm from "../components/UserForm";
import UsersTable from "../components/UsersTable";
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} from "../services/userService";


const UserViews = () => {

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadInitialUsers = async () => {
            try {
                const data = await getUsers();
                if (!cancelled) {
                    setUsers(data);
                    setError("");
                }
            } catch (error) {
                if (!cancelled) {
                    setError(error.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadInitialUsers();

        return () => {
            cancelled = true;
        }
    }, [])

    const handleSave = async (user) => {
        try {
            setError("");
            if (selectedUser) {
                await updateUser(selectedUser.id, user)
            } else {
                await createUser(user);
            }

            setSelectedUser(null);

            await loadUsers();
        } catch (error) {
            setError(error.message);
            throw error;
        }
    }

    const handleEdit = (user) =>{
        if(user){
            setSelectedUser(user);
        }
    }

    const handleCancel = () =>{
        setSelectedUser(null);
    }

    const handleDelete = async(id) =>{
        const confirmed = 
        window.confirm("Are you sure you want to delete this user?");

        if(!confirmed){
            return;
        }

        try{
            setError("");
            await deleteUser(id);
            setSelectedUser(null);
            await loadUsers();
        }catch(error){
            setError(error.message);
        }
    }

    

    return (
        <>
            <h1>User Management</h1>
            {
                error && (
                    <p>Error : {error}</p>
                )
            }

            <UserForm 
                key={selectedUser?.id ?? "new"}
                selectedUser={selectedUser}
                onSave={handleSave}
                onCancel={handleCancel}
            />

            <h2>Users</h2>
            {
                loading ? (<p>Loading users...</p>):(
                    <UsersTable 
                        users={users} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete}
                    />
                )
            }
        </>
    )
}

export default UserViews;
