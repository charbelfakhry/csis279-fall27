// gives a role to a user from the command line, e.g. to create the first admin:
//   npm run assign-role -- test@test.com admin
const pool = require("../config/db");

const assignRole = async (email, roleName) =>{
    const result = await pool.query(
        `INSERT INTO user_roles (user_id, role_id)
        SELECT users.id, roles.id
        FROM users, roles
        WHERE lower(users.email) = lower($1) AND lower(roles.name) = lower($2)
        ON CONFLICT DO NOTHING
        RETURNING user_id`,
        [email, roleName]);

    if(result.rowCount > 0){
        return `Gave the ${roleName} role to ${email}`;
    }

    // nothing inserted: find out why
    const user = await pool.query(`SELECT 1 FROM users WHERE lower(email) = lower($1)`, [email]);
    if(user.rowCount === 0){
        throw new Error(`No user with email ${email}`);
    }

    const role = await pool.query(`SELECT 1 FROM roles WHERE lower(name) = lower($1)`, [roleName]);
    if(role.rowCount === 0){
        throw new Error(`No role named ${roleName}`);
    }

    return `${email} already has the ${roleName} role`;
}

const [email, roleName] = process.argv.slice(2);

if(!email || !roleName){
    console.error("Usage: npm run assign-role -- <email> <role>");
    process.exit(1);
}

assignRole(email, roleName)
    .then((message) => console.log(message))
    .catch((error) =>{
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
