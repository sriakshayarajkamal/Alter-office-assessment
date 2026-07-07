const moongose = require("mongoose");
const TodoListSchema = new moongose.Schema(
    {
        title:{
            type:String,
            required:true
        },
        user:{
            type:moongose.Schema.Types.ObjectId,
            ref:"User"
        },
        isPublic:{
            type:Boolean,
            default:false
        },
        sharedId:{
            type:String
        }
    },
    {
        timeStamp : true
    }
);

module.exports = moongose.model("TodoList",TodoListSchema);