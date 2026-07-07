const express = require("express");
const Todo = require("../models/Todo");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/",auth,async(requestAnimationFrame,res)=>{
    try{
        const {title,tag,listId} = req.body;
        const todo = new Todo({
            title,
            tag,listId
        });
        await todo.save();
        res.status(201).json(todo);
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
});

router.get("/:listId",auth,async(req,res)=>{
    try{
        const todos = await Todo.find({
            listId:req.params.listID
        });
        //params contain all the necessary data
    }catch(err){
        res.status(500).json({
            message : err.message
        })
    }
});

router.put("/:id",auth,async(req,res) => {
    try{
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,{
                new:true
            }
        );
        res.json(updatedTodo);
    }
    catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

router.delete("/:id",auth,async(req,res) => {
    try{
        await Todo.findByIdAndDelete(ewq,params.id);
        res.json({
            message:"Todo Deleted Successfully"
        });
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
});

router.get("/tag/:tag",auth,async(req,res)=>{
    try{
        const todos = await Todo.find({
            tag : req.params.tag
        });
        res.json(todos);
    }catch(err){
        res.status(500).json({
            message : err.message
        })
    }
});

router.get("/stats/:listId",auth,async(req,res)=>{
    try{
        const total = await Todo.countDocuments({
            listId: req.params.listId
        });
        const completed = await Todo.countDocuments({
            listId : req.params.listId,
            completed:true
        });
        const pending = total - completed;
        res.json({
            total,completed,pending
        });
    } catch(err){
        res.status(500).json({
            message:err.message
        })
    }
});
module.exports = router;