import { db } from '../../db/db'

export async function findUserById(userId: string) {
    return db.user.findUnique({
        where: {
            id: userId
        },
        include: {
            profile: true
        }
    })
}

