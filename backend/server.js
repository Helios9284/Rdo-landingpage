const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require('dotenv');
const connectDB = require('./config/dbcon');
const PORT = process.env.PORT || 8000;
dotenv.config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
    extended: false
}))



// import router:
// const routes = require('./routes');
const routes = require('./routes');

app.use('/',routes);

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})