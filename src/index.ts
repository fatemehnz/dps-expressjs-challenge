import express, { Express } from 'express';
import dotenv from 'dotenv';
import accessLog from './services/log.service';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(accessLog);
app.use(express.json());

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
