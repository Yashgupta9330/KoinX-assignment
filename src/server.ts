import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser';
import routes from './routes/index';
import { initializeJobs } from './jobs/priceFetcher';

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(bodyParser.json());


app.use('/api/v1', routes);


initializeJobs();

app.get('/',(req, res) => {
  res.send('KoinX assignment Server is running fine'); 
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
