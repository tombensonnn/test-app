const express = require('express');
const bodyParser = require('body-parser');

const router = require('./routers/index');


const app = express();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// app.get('/', (req, res) => {
//     res.send('Hello, World');
// });

app.use('/api', router);



const PORT = 3000 || process.env.PORT;


app.listen(PORT , () => {
    console.log(`Server is running on : ${PORT}`);
});