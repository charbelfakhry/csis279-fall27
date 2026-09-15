const pool = require("../config/db");

const findAll = async() =>{
    const result = await pool.query(
        `SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        age, 
        created_at
        
        FROM users ORDER BY id
        `
    );

    return result.rows;
}

const findById = async(id) =>{
    const result = await pool.query(
        `SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        age, 
        created_at
        
        FROM users WHERE id = $1
        `, [id]
    );

    return result.rows[0];
}

const create = async(user) =>{
    const {firstName, lastName, email, age} = user;

    const result = await pool.query(
        `INSERT INTO users (first_name, last_name, email, age) 
        VALUES($1, $2, $3, $4) RETURNING *`, 
        [firstName, lastName, email, age]);

    return result.rows[0];
}

const update = async(id, user) =>{
    const {firstName, lastName, email, age} = user;

    const result = await pool.query(
        `UPDATE users SET first_name = $1, 
        last_name = $2, 
        email = $3, 
        age = $4) 
        WHERE id = $5 RETURNING *`, 
        [firstName, lastName, email, age, id]);

    return result.rows[0];
}

const remove = async(id) =>{
    const result = await pool.query(
        `DELETE FROM users WHERE id = $1 RETURNING *` , id
    );

    return result.rows[0]
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove
}