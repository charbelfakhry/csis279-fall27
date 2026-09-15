const Student = ({name, age, major}) => {
    return(
        <>
            <ul>
                <li>First Name: {name}</li>
                <li>Last Name: {age}</li>
                <li>Gpa: {major}</li>
            </ul>
        </>
    )
}

export default Student;