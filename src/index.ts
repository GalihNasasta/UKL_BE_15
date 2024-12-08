import express from 'express';
import cors from 'cors';
import userRt from './routes/userRt';
import BrgRt from './routes/barangRt';
import pinjamRt from './routes/pinjamRt';


const PORT: number = 8000
const app = express()
app.use(cors())

app.use('/api/auth', userRt)
app.use('/api/inventory', BrgRt)
app.use('/api/inventory', pinjamRt)

app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
    
})