/* Express */
const express = require("express");
const db = require("./db");
const app = express();
const port = process.env.PORT;
const cron = require('node-cron');
/* CORS */
const cors = require("cors");

app.use(cors());

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

cron.schedule('*/5 * * * *', async () => {
    try {
        console.log('Bắt đầu cập nhật Materialized Views...');
        
        await db.none('REFRESH MATERIALIZED VIEW CONCURRENTLY vw_reserve_details;');
        await db.none('REFRESH MATERIALIZED VIEW CONCURRENTLY searchpage_view;');
        await db.none('REFRESH MATERIALIZED VIEW CONCURRENTLY room_details_view;');
        await db.none('REFRESH MATERIALIZED VIEW CONCURRENTLY hotel_other_rooms_view;');
        
        console.log('Cập nhật Materialized Views thành công!');
    } catch (error) {
        console.error('Lỗi khi cập nhật Materialized Views:', error);
    }
});