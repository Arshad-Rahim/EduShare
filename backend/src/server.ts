import app from "./app";
import jwt, { Secret } from 'jsonwebtoken'
import { OAuth2Client } from "google-auth-library";
import { userModel } from "./models/userModels";
import ms from "ms";


// const client = new OAuth2Client();
// const JWT_SECRET = process.env.JWT_SECRET;

const PORT = process.env.PORT || 3001;

// const accessSecret = process.env.JWT_SECRET as Secret;
// const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES || "";
// const generateAccessToken = (payload: {
//   // id: string;
//   email: string;
//   given_name: string;
//   // family_name:string;
//   // role: string;
// }): string => {
//   return jwt.sign(
//     {  email: payload.email, given_name:payload.given_name },
//     accessSecret,
//     {
//       expiresIn: accessExpiresIn as ms.StringValue,
//     }
//   );
// };

// app.post('/google-auth', async (req, res) => {
//   const { credential, clientId } = req.body;
//   console.log("REQ>BODY IN SERVER",req.body)
// console.log("IVDE THE",credential,clientId)
//   try {
//     // Verify the ID token with Google's API
//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: clientId,
//     });
//     const payload = ticket.getPayload();
//     console.log("PAYLOAD IN SERVER",payload)
//     if (
//       !payload ||
//       !payload.email ||
//       !payload.given_name 
//       // !payload.family_name
//     ) {
//       throw new Error("Invalid token payload");
//     }

//     const { email, given_name }:any = payload;

//     // Check if the user already exists in the database
//     let user = await userModel.findOne({ email });
//     if (!user) {
//       // Create a new user if they don't exist
//       user = await userModel.create({
//         email,
//         name: `${given_name}`,
//         // authSource: 'google',
//       });
//     }
//     console.log("USER IN SERVER GOOGLE AUTH",user)

//     // Generate a JWT token
//     const token = generateAccessToken({ email, given_name});

//     // Send the token as a cookie and response
//     res
//       .status(200)
//       .cookie('token', token, {
//         httpOnly: true,
//         secure: false, // Set to true in production when using HTTPS
//         maxAge: 3600000, // 1 hour in milliseconds
//       })
//       .json({ message: 'Authentication successful' });
//   } catch (err) {
//     console.error('Error during Google Authentication:', err);
//     res.status(400).json({ error: 'Authentication failed', details: err });
//   }
// });

app.listen(PORT,()=>console.log(`Server is running at ${PORT}`))