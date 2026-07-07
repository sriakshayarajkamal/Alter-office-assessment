const mongoose = require("mongoose");
const TodoSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true
        },
        completed:{
            type:Boolean,
            default:false
        },
        tag:{
            type:String,
            default : "No Tag"
        },
        listId :{
            type : mongoose.Schema.Types.ObjectId,
            ref:"TodoList"
        }
    },
    {
        timeStamp : true
    }
);

module.exports = mongoose.model("Todo",TodoSchema);