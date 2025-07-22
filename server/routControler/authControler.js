import User from "../schema/userSchema.js";
import bcrypt from 'bcryptjs';
import jwtToken from "../utils/jwtToken.js";


export const Signup = async (req, res) => {
      try {
            const { fullname, username, email, password, gender, profilepic } = req.body;
            const user = await User.findOne({ username });

            if (user) {
                  return res.status(500).send({
                        success: false,
                        message: "User already exists with this Username:"
                  });
            }

            const emailpresent = await User.findOne({ email });

            if (emailpresent) {
                  return res.status(500).send({
                        success: false,
                        message: "User already exists with this Email:"
                  });
            }

            const hashPassword = bcrypt.hashSync(password, 10);
            const boyProfilePic = profilepic || `https://avatar.iran.liara.run/public/boy?username=${username}`
            const girlProfilePic = profilepic || `https://avatar.iran.liara.run/public/girl?username=${username}`
                                          

            const newUser = new User({
                  fullname,
                  username,
                  email,
                  password: hashPassword,
                  gender,
                  profilepic: gender === "male" ? boyProfilePic : girlProfilePic
            })

            if (newUser) {
                  await newUser.save();
                  jwtToken(newUser._id, res)
            }
            else {
                  res.status(500).send({ success: false, message: "Invalid User data" })
            }
            res.status(201).send({
                  message: "Signup Successfull!"
            })
      } catch (error) {
            res.status(500).send({
                  success: false,
                  message: error
            });
            console.log(error);
      }
}


export const Login = async (req, res) => {
      try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                  return res.status(500).send({
                        success: false,
                        message: "Email doesn't Exist"
                  });
            }
            const comparePassword = bcrypt.compareSync(password, user.password || '');
            if (!comparePassword) return res.status(500).send({ success: false, message: "Email or Password doesn't matching:" });

            const token = jwtToken(user._id, res);

            res.status(200).send({

                  _id: user._id,
                  fullanme: user.fullanme,
                  username: user.username,
                  profilepic: user.profilepic,
                  email: user.email,
                  message: "Successfully Login",
                  token
            })

      } catch (error) {
            res.status(500).send({
                  success: false,
                  message: error
            });
            console.log(error);
      }
}


export const LogOut = async (req, res) => {
      try {
           
            res.clearCookie('jwt' , {
                  path: '/',
                  httpOnly: true,
                  secure: true,
            })
            res.status(200).send({ message: "User logout" })
      } catch (error) {
            res.status(500).send({
                  success: false,
                  message: "we FOund error"
            });
            console.log(error);

      }
}


