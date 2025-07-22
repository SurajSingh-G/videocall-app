import User from '../schema/userSchema.js';


export const getAllUsers = async (req, res) => {
      // Find curently logged in user id 
      //const currentUserID = req.user?._conditions?._id;
      const currentUserID = req.user._conditions._id;
      //   console.log(currentUserID)
      // const hell =currentUserID[0]._id

      if (!currentUserID) return res.status(401).json({
            success: false,
            message: "Unauthorized."
      });

      try {
            const users = await User.find(
                  { _id: { $ne: currentUserID } }, // Exclude the current user
                  'profilepic email username'      // Select only these fields
            );
            //  console.log(users)
            res.status(200).json({ success: true, users });
      } catch (error) {
            res.status(500).json({

                  success: false,
                  message: error.message
            });
      }
}