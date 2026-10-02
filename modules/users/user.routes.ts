import { Router } from "express";
import { getUser } from "./user.controller";

const userRouter = Router()

userRouter.get('/:userId', getUser)

export default userRouter