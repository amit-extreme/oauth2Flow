const db = require('../config/db');
const jwt = require('jsonwebtoken');
const userProfile = async (req, res) => {
  // console.log("req-----",req);
 const authHeader = req.headers['authorization'];
   if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
 
   const token = authHeader.split(' ')[1];
   try {
     const user = jwt.verify(token, process.env.JWT_SECRET);
     console.log("user------",user);
     const [users] = await db.query(`SELECT * FROM user WHERE id = ?`, [user.sub]);
     console.log("users",users);
    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      res.json({ message: 'sucess', users });
    }
     
   } catch(e) {
     res.status(401).json({ error: 'Invalid or expired token' });
   }
};



module.exports = {
  userProfile
};
