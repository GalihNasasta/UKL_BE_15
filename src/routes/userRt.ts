import express  from "express";
import { getAllUser, createUser,updateUser, deleteUser, login, register, updateCust } from "../controllers/userCtr";
import { verifyAddData, verifyEditUser, verifyAuthentication } from "../middlewares/userValidation";
import { verifyRole, verifyToken } from "../middlewares/auth";
const app = express()
app.use(express.json())

app.get('/', [verifyToken, verifyRole(["ADMIN"])], getAllUser)
app.post('/', [verifyToken, verifyRole(["ADMIN"])], [verifyAddData], createUser)
app.put('/:id', [verifyToken, verifyRole(["ADMIN"])], [verifyEditUser], updateUser)
app.put('/editProfile/:id', [verifyToken, verifyRole(["CUSTOMER"])], [verifyEditUser], updateCust)
app.post('/login', [verifyAuthentication], login)
app.post('/register', [verifyAddData], register)
app.delete('/:id', [verifyToken, verifyRole(["ADMIN"])], deleteUser)

// app.get('/', getAllUser)
// app.post('/', [verifyAddData], createUser)
// app.delete('/:id', deleteUser)
// app.post('/login', [verifyAuthentication], login)

export default app