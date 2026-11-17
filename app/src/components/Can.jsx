import useAuth from "../context/useAuth";

// renders its children only if the user has the permission:
//   <Can permission="products:delete"><Button>Delete</Button></Can>
const Can = ({ permission, children }) => {
    const { can } = useAuth();

    return can(permission) ? children : null;
}

export default Can;
