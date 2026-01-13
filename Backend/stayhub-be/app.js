/* Express */
const express = require("express");
const db = require("./db");
const app = express();
const port = process.env.PORT;


// Use JSON parsing
app.use(express.json());

app.get('/hello', async (req, res) => {
    try {
        const result = await db.result("SELECT * FROM hello");
        res.json(result.rows);
    } catch (error) {
        console.log("Error occured: ", err.message || err);
        res.status(500).json({error: "Internal server error"});
    }
})

app.post('/hello', async (req, res) => {
    console.log(req.body);
    const { name } = req.body;
    try {
        const result = await db.one("INSERT INTO hello(name) VALUES($1) RETURNING id, name", name);
        res.json(result);
    } catch (error) {
        console.log("Error occured: ", err.message || err);
        res.status(500).json({error: err.message || err});
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})