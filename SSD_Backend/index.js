const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 5000;
const cors = require('cors');
const {parseQuery} = require('./service/abc')
app.use(express.json());
app.use(cors());
const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'password',
    database:'project'
});
db.connect((err)=>{
    
    if(err)
    {console.error('Error connecting to mysql database');
    return;
    }
    console.log('Connected to the MySQL database');
}
)
app.get('/',(req,res)=>{
    res.send('Hello World');
});

app.post('/textToQuery', (req, res) => {
    const { text } = req.body;
    const query = parseQuery(text);
    if (query === 'Sorry, no such tables exist.') {
        return res.status(400).json({
            error: query, 
        });
    } 
    else
    {
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Error executing query' });
        }
        res.json({query,results});
    });
    }
});


app.listen(PORT,()=>{
    console.log(`server is running on port number :${PORT}`);
});