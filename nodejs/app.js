// app.js
const express = require('express');
const app = express();
const cors =require('cors')
const geoserverRouter = require('./modules/geoserver/geoserverRouter');

app.use(express.json());
app.use(cors())
// Define routes
app.use('/geoserver', geoserverRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
