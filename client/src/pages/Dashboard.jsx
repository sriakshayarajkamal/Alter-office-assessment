import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Dashboard() {
    const navigate = useNavigate();
    const [lists, setLists] = useState([]);
    const [title, setTitle] = useState("");
    const [selectedList, setSelectedList] = useState(null);
    const [todos, setTodos] = useState([]);
    const [todoTitle, setTodoTitle] = useState("");
    const [todoTag, setTodoTag] = useState("");

    useEffect(() => {
        getLists();
    }, []);

    const getLists = async () => {
        try {
            const res = await api.get("/lists");
            setLists(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const addList = async () => {
        if (!title.trim()) return;
        try {
            await api.post("/lists", { title });
            setTitle("");
            getLists();
        } catch (err) {
            console.log(err);
        }
    };

    const deleteList = async (id) => {
        try {
            await api.delete(`/lists/${id}`);
            if (selectedList?._id === id) {
                setSelectedList(null);
                setTodos([]);
            }
            getLists();
        } catch (err) {
            console.log(err);
        }
    };

    const selectList = async (list) => {
        setSelectedList(list);
        try {
            const res = await api.get(`/todos/${list._id}`);
            setTodos(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const addTodo = async () => {
        if (!todoTitle.trim() || !selectedList) return;
        try {
            await api.post("/todos", { title: todoTitle, tag: todoTag, listId: selectedList._id });
            setTodoTitle("");
            setTodoTag("");
            selectList(selectedList);
        } catch (err) {
            console.log(err);
        }
    };

    const toggleTodo = async (todo) => {
        try {
            await api.put(`/todos/${todo._id}`, { completed: !todo.completed });
            selectList(selectedList);
        } catch (err) {
            console.log(err);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await api.delete(`/todos/${id}`);
            selectList(selectedList);
        } catch (err) {
            console.log(err);
        }
    };

    const shareList = async (id) => {
        try {
            const res = await api.put(`/lists/share/${id}`);
            const link = `${window.location.origin}${res.data.shareLink}`;
            navigator.clipboard.writeText(link);
            alert(`Share link copied: ${link}`);
        } catch (err) {
            console.log(err);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div className="dashboard">
            <div className="header">
                <h1>Todo Dashboard</h1>
                <button onClick={logout}>Logout</button>
            </div>

            <div className="add-list">
                <input type="text" placeholder="New list name" value={title} onChange={(e) => setTitle(e.target.value)} />
                <button onClick={addList}>Add List</button>
            </div>

            <div className="content">
                <div className="lists">
                    {lists.map((list) => (
                        <div className={`card ${selectedList?._id === list._id ? "active" : ""}`} key={list._id}>
                            <h3 onClick={() => selectList(list)}>{list.title}</h3>
                            <div>
                                <button onClick={() => shareList(list._id)}>Share</button>
                                <button onClick={() => deleteList(list._id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedList && (
                    <div className="todos">
                        <h2>{selectedList.title}</h2>
                        <div className="add-todo">
                            <input type="text" placeholder="Todo title" value={todoTitle} onChange={(e) => setTodoTitle(e.target.value)} />
                            <input type="text" placeholder="Tag (optional)" value={todoTag} onChange={(e) => setTodoTag(e.target.value)} />
                            <button onClick={addTodo}>Add Todo</button>
                        </div>
                        {todos.map((todo) => (
                            <div className={`todo-item ${todo.completed ? "completed" : ""}`} key={todo._id}>
                                <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo)} />
                                <span>{todo.title}</span>
                                {todo.tag && <span className="tag">{todo.tag}</span>}
                                <button onClick={() => deleteTodo(todo._id)}>✕</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
