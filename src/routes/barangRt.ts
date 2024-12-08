import express  from "express";
import { getAllBarang, createBarang, updateBarang, deleteBarang } from "../controllers/barangCtr";
import { verifyAddBarang, verifyEditBarang } from "../middlewares/verifyBrg";
import { verifyRole, verifyToken } from "../middlewares/auth";

const app = express()
app.use(express.json())

app.get('/', [verifyToken, verifyRole(["ADMIN", "CUSTOMER"])], getAllBarang)
app.post('/', [verifyToken, verifyRole(["ADMIN"])], [verifyAddBarang], createBarang)
app.put('/:id', [verifyToken, verifyRole(["ADMIN"])], [verifyEditBarang], updateBarang)
app.delete('/:id', [verifyToken, verifyRole(["ADMIN"])], deleteBarang)

export default app