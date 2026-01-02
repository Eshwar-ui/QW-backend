const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 4444;

// Connect to Database
connectDB();

app.listen(PORT, () => {
    console.log(`Server Running at ${PORT}`);
});
