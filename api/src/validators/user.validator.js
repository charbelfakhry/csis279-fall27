const validateUser = (user) =>{
    if(!user.firstName || user.firstName.trim() === ""){
        errors.push("First name is required");
    }

    if(!user.last || user.lastName.trim() === ""){
        errors.push("Last name is required");
    }

    if(user.email && !user.email.includes("@")){
        errors.push("Invalid email");
        
    }
}

module.exports = {
    validateUser
}