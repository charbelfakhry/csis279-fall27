const pool = require("./db");

// runs callback(client) inside BEGIN/COMMIT: either every query in it is saved, or none is.
// queries inside must use the given client, not the pool, to be part of the transaction
const withTransaction = async (callback) =>{
    const client = await pool.connect();

    try{
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    }catch(error){
        await client.query("ROLLBACK");
        throw error;
    }finally{
        client.release();
    }
}

module.exports = withTransaction;
