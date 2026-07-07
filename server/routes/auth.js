const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//for converting normal password to hashing

const User = require("../models/User");
const router = express.Router();

router.post("/register",async(req,res)=>{
    try{
        const {name,email,password} = req.body;
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                message : "Email already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password,10);
        //here 10 is salt round, weight of hashing the password
        const user = new User({
            name, email, password:hashedPassword
        });
        await user.save();
        res.status(201).json({
            message:"User Registered Successfully"
        })
    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
});
//LOGIN
router.post("/login",async(req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(!User){
            return res.status(400).json({
                message:"User not found"
            });
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({
                message:"Invalid password"
            });
        }
        const token = jwt.sign(
            {
                id:user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        );
        res.json({
            token,user
        });
    }
    catch(err){
        res.status(500).json({
            message : err.message
        });
    }
});
module.exports = router;