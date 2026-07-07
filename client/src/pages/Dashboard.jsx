import { useEffect,useState } from "react";
import api from "../api";
function Dashboard(){
    const [lists,setLists] = useState([]);
    const [title, setTitle] = useState("");
    useEffect(()=>{
        getLists();
    },[]);
    const getLists = async() =>{
        try{
            const res = await api.get("/lists");
            setLists(res.data);
        }catch(err){
            console.log(err);
        }
        // try{
        //     const res=await api.post("/lists",{
        //         title
        //     });
        //     console.log(res.data);
        //     setTitle("");
        //     getLists();
        // }catch(err){
        //     console.log(err.response?.data);
        //     console.log(err);
        // }
    };
    const addList  = async() =>{
        console.log("button clicked");
        console.log("title",title);
        if(!title.trim()){ 
            console.log("title is empty");
            return;}
        try{
            await api.post("/lists",{title});
            Console.log("Added successfully");
            
            setTitle("");
            getLists();
        }catch(err){
            console.log("error",err.response?.status);
            console.log(err.response?.data);
            console.log(err);
        }
    };
    const deleteList = async(id)=>{
        try{
            await api.delete(`/lists/${id}`);
            getLists();
        }catch(err){
            console.log(err);
        }
    };
    return (
        <div className="dashboard">
            <h1>Todo Dashboard</h1>
            <div className="add-list">
                <input type="text" placeholder="Enter todo lists" value={title} onChange={(e)=>setTitle(e.target.value)}/>
                <button onClick={addList}>Add List</button>
                {/* <button onClick={()=>{
                    console.log("clicked");
                    console.log(title);
                     addList();}}>Add Listt</button> */}
            </div>
            {lists.map((list)=>(
                <div className="card" key={list._id}>
                    <h3>{list.title}</h3>
                    <button onClick = {()=>deleteList(list._id)}>Delete</button>
                </div>
            ))}
        </div>
    );

}
export default Dashboard;