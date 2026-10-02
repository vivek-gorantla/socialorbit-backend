import { Request, Response } from "express"
import { findUserById } from "./user.service"
import { logger } from "../../lib/logger"

export async function getUser(req: Request, res: Response) {
    try {
        const userId = req.params.userId as string
        if (!userId) {
            return res.status(400).json({
                message: "userId is required",
                error: "bad request"
            })
        }

        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({
                message: "user dosent exists",
                error: "not found"
            })
        }

        return res.status(200).json({
            message: "user fetch successfull",
            data: user,
            error: null
        })
    } catch (err) {
        logger.error("Error fetching user", { error: err });
        return res.status(500).json({
            message: "internal server error",
            error: "internal server error"
        })
    }
}