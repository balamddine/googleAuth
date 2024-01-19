const express = require('express');
const authRoutes = require('./authRoutes');
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3001;
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json());
app.use(cors());


app.use('/', authRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on the port::${PORT}`);
});



