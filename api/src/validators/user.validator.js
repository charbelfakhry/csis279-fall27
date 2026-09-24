const validateUser = (user = {}) =>{
    const errors = [];
    const firstName = typeof user.firstName === "string" ? user.firstName.trim() : "";
    const lastName = typeof user.lastName === "string" ? user.lastName.trim() : "";
    const email = typeof user.email === "string" ? user.email.trim() : "";
    const age = Number(user.age);

    if(!firstName){
        errors.push("First name is required");
    }

    if(!lastName){
        errors.push("Last name is required");
    }

    if(email && !email.includes("@")){
        errors.push("Invalid email");
    }

    if(user.age !== null && user.age !== undefined && user.age !== "" && (!Number.isFinite(age) || age < 0)){
        errors.push("Age must be a non-negative number");
    }

    return errors;
}

module.exports = validateUser;
