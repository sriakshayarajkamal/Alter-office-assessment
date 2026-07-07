import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

function PublicList() {
    const { shareId } = useParams();
    const [list, setList] = useState(null);
    const [todos, setTodos] = useState([]);

    useEffect(() => {
        const fetchList = async () => {
            try {
                const res = await api.get(`/lists/public/${shareId}`);
                setList(res.data);
                const todosRes = await api.get(`/todos/${res.data._id}`);
                setTodos(todosRes.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchList();
    }, [shareId]);

    if (!list) return <p>Loading...</p>;

    return (
        <div className="container">
            <h2>{list.title}</h2>
            {todos.map((todo) => (
                <div className={`todo-item ${todo.completed ? "completed" : ""}`} key={todo._id}>
                    <span>{todo.completed ? "✓" : "○"}</span>
                    <span>{todo.title}</span>
                    {todo.tag && <span className="tag">{todo.tag}</span>}
                </div>
            ))}
        </div>
    );
}

export default PublicList;
