import express  from "express";
import { pinjamBarang, returnBrg, getAllPinjam, analisis, borrowAnalysis,  } from "../controllers/pinjamCtr";
import { verifyBorrow, verifyReturn, validateAnalysis, validateAnalysisBorrow } from "../middlewares/verifyPinjam";
import { verifyRole, verifyToken } from "../middlewares/auth";

const app = express()
app.use(express.json())

app.get('/pinjam', [verifyToken, verifyRole(["ADMIN"])], getAllPinjam)
app.post('/borrow', [verifyToken, verifyRole(["ADMIN", "CUSTOMER"])], verifyBorrow, pinjamBarang)
app.post('/return', [verifyToken, verifyRole(["ADMIN", "CUSTOMER"])], verifyReturn, returnBrg)
app.post('/usage_report', [verifyToken, verifyRole(["ADMIN"])], validateAnalysis, analisis)
app.post('/borrow_analysis', [verifyToken, verifyRole(["ADMIN"])], validateAnalysisBorrow, borrowAnalysis)

export default app 