
// const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'

export const generateAccessToken = (userId:Types.ObjectId)=>{
    return jwt.sign({id:userId},'access-token-key',{
        expiresIn:"15m",
    })
}