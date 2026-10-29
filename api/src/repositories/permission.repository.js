const pool = require("../config/db");

const findAll = async() =>{
    const result = await pool.query(
        `SELECT id, code, description
        FROM permissions
        ORDER BY code
        `
    );

    return result.rows;
}

// every permission the user gets from any of their roles, as a list of codes
const findCodesByUserId = async(userId) =>{
    const result = await pool.query(
        `SELECT DISTINCT permissions.code
        FROM user_roles
        JOIN role_permissions ON role_permissions.role_id = user_roles.role_id
        JOIN permissions ON permissions.id = role_permissions.permission_id
        WHERE user_roles.user_id = $1
        ORDER BY permissions.code
        `, [userId]
    );

    return result.rows.map((row) => row.code);
}

module.exports = {
    findAll,
    findCodesByUserId
}
