const crypto = require("crypto");
const express = require("express");
const TodoList = require("../models/TodoList");
const auth = require("../middleware/auth");
const router = express.Router();

// Create list
router.post("/", auth, async (req, res) => {
    try {
        const { title } = req.body;
        const list = new TodoList({ title, user: req.user.id });
        await list.save();
        res.status(201).json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all lists for user
router.get("/", auth, async (req, res) => {
    try {
        const lists = await TodoList.find({ user: req.user.id });
        res.json(lists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete list
router.delete("/:id", auth, async (req, res) => {
    try {
        await TodoList.findByIdAndDelete(req.params.id);
        res.json({ message: "Todo List Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Share list
router.put("/share/:id", auth, async (req, res) => {
    try {
        const sharedId = crypto.randomBytes(8).toString("hex");
        const list = await TodoList.findByIdAndUpdate(
            req.params.id,
            { isPublic: true, sharedId },
            { new: true }
        );
        res.json({ shareLink: `/public/${sharedId}`, list });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Public route - no auth needed
router.get("/public/:shareId", async (req, res) => {
    try {
        const list = await TodoList.findOne({ sharedId: req.params.shareId, isPublic: true });
        if (!list) return res.status(404).json({ message: "List not found" });
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
