const pool = require("../config/db");

const userColumns = `
        id,
        first_name AS "firstName",
        last_name AS "lastName",
        email,
        age,
        created_at AS "createdAt"
`;

// the user's roles as [{ id, name }], for queries that select FROM users
const userRoles = `
        (SELECT COALESCE(json_agg(json_build_object('id', roles.id, 'name', roles.name) ORDER BY roles.name), '[]')
        FROM user_roles
        JOIN roles ON roles.id = user_roles.role_id
        WHERE user_roles.user_id = users.id) AS roles
`;

const findAll = async() =>{
    const result = await pool.query(
        `SELECT ${userColumns}, ${userRoles}
        FROM users
        ORDER BY id
        `
    );

    return result.rows;
}

const findById = async(id) =>{
    const result = await pool.query(
        `SELECT ${userColumns}, ${userRoles}
        FROM users
        WHERE id = $1
        `, [id]
    );

    return result.rows[0];
}

const create = async(user) =>{
    const {firstName, lastName, email, age} = user;

    const result = await pool.query(
        `INSERT INTO users (first_name, last_name, email, age) 
        VALUES($1, $2, $3, $4)
        RETURNING ${userColumns}`,
        [firstName, lastName, email, age]);

    return result.rows[0];
}

// registered accounts also get the default role; both inserts are one statement,
// so they succeed or fail together
const createWithPassword = async(user, passwordHash) =>{
    const {firstName, lastName, email, age} = user;

    const result = await pool.query(
        `WITH new_user AS (
            INSERT INTO users (first_name, last_name, email, age, password_hash)
            VALUES($1, $2, $3, $4, $5)
            RETURNING ${userColumns}
        ), default_role AS (
            INSERT INTO user_roles (user_id, role_id)
            SELECT new_user.id, roles.id
            FROM new_user
            JOIN roles ON roles.is_default
        )
        SELECT * FROM new_user`,
        [firstName, lastName, email, age, passwordHash]);

    return result.rows[0];
}

// the only query that returns the hash; never send its result to the client as-is
const findByEmailWithPassword = async(email) =>{
    const result = await pool.query(
        `SELECT ${userColumns}, password_hash AS "passwordHash"
        FROM users
        WHERE lower(email) = lower($1)
        `, [email]
    );

    return result.rows[0];
}

const update = async(id, user) =>{
    const {firstName, lastName, email, age} = user;

    const result = await pool.query(
        `UPDATE users SET first_name = $1, 
        last_name = $2, 
        email = $3, 
        age = $4
        WHERE id = $5
        RETURNING ${userColumns}`,
        [firstName, lastName, email, age, id]);

    return result.rows[0];
}

const remove = async(id) =>{
    const result = await pool.query(
        `DELETE FROM users
        WHERE id = $1
        RETURNING ${userColumns}`,
        [id]
    );

    return result.rows[0]
}

module.exports = {
    findAll,
    findById,
    create,
    createWithPassword,
    findByEmailWithPassword,
    update,
    remove
}
