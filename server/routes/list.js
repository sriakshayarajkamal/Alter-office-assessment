const crypto = require("crypto");
const express = require("express");
const TodoList = require("../models/TodoList");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/",auth,async(requestAnimationFrame,res)=>{
    try{
        const {title} = req.body;
        const list = new TodoList({
            title,
            user:req.user.id
        });
        await list.save();
        res.status(200).json(list);
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

router.get("/",auth,async(req,res)=>{
    try{
        const lists = await TodoList.find({
            user:req.user.id
        });
        res.json(lists);
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});
router.delete("/:id",auth,async(req,res)=>{
    try{
       await TodoList.findByIDAndDelete(req.params.id);
       res.json({
        message:"TODO LIST DELETED"
       })
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

router.put("/share/:id",auth,async(req,res)=>{
    try{
        const sharedId = crypto.randomBytes(8).toString("hex");
        const list = await TodoList.findByIdAndUpdate(
            req.params.id,
            {
                isPublic:true,
                sharedId
            },{
                new:true
            }
        );
        res.json({
            shareLink:`/public/${shareId}`,
            list
        });
    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
});

//this route does not require login

router.get("public/:shareId",async(req,res)=>{
    try{
        const list = await TodoList.findOne({
            sharedId:req.params.shareId,
            isPublic:true
        });
        if(!list){
            return res.status(404).json({
                message:"List not found"
            })
        }
        res.json(list);
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
});

module.exports = router;