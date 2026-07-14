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
    const [todoTag, setTodoTag] = useState("urgent");
    const [listTagCounts, setListTagCounts] = useState({});
    const [pendingTodo, setPendingTodo] = useState(null); // holds title waiting for tag
    const [filterTag, setFilterTag] = useState("all");
    const [editingTodoId, setEditingTodoId] = useState(null);
    const [editTodoTitle, setEditTodoTitle] = useState("");
    const [editingListId, setEditingListId] = useState(null);
    const [editListTitle, setEditListTitle] = useState("");
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getLists();
    }, []);

    const getLists = async () => {
        try {
            const res = await api.get("/lists");
            setLists(res.data);
            // fetch tag counts for each list
            const counts = {};
            await Promise.all(res.data.map(async (list) => {
                const todosRes = await api.get(`/todos/${list._id}`);
                const tags = {};
                todosRes.data.forEach((t) => {
                    const tag = t.tag || "No Tag";
                    tags[tag] = (tags[tag] || 0) + 1;
                });
                counts[list._id] = tags;
            }));
            setListTagCounts(counts);
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
                setStats(null);
            }
            getLists();
        } catch (err) {
            console.log(err);
        }
    };

    const renameList = async (id) => {
        if (!editListTitle.trim()) return;
        try {
            await api.put(`/lists/${id}`, { title: editListTitle });
            setEditingListId(null);
            setEditListTitle("");
            getLists();
        } catch (err) {
            console.log(err);
        }
    };

    const selectList = async (list) => {
        setSelectedList(list);
        setFilterTag("all");
        try {
            const res = await api.get(`/todos/${list._id}`);
            setTodos(res.data);
            const statsRes = await api.get(`/todos/stats/${list._id}`);
            setStats(statsRes.data);
        } catch (err) {
            console.log(err);
        }
    };

    const refreshTodos = async (list) => {
        try {
            const res = await api.get(`/todos/${list._id}`);
            setTodos(res.data);
            const statsRes = await api.get(`/todos/stats/${list._id}`);
            setStats(statsRes.data);
            getLists();
        } catch (err) {
            console.log(err);
        }
    };

    const addTodo = async () => {
        if (!todoTitle.trim() || !selectedList) return;
        // ask for priority first
        setPendingTodo(todoTitle.trim());
        setTodoTitle("");
        setTodoTag("urgent");
    };

    const confirmAddTodo = async (tag) => {
        try {
            await api.post("/todos", { title: pendingTodo, tag, listId: selectedList._id });
            setPendingTodo(null);
            setTodoTag("urgent");
            refreshTodos(selectedList);
        } catch (err) {
            console.log(err);
        }
    };

    const toggleTodo = async (todo) => {
        try {
            await api.put(`/todos/${todo._id}`, { completed: !todo.completed });
            refreshTodos(selectedList);
        } catch (err) {
            console.log(err);
        }
    };

    const renameTodo = async (id) => {
        if (!editTodoTitle.trim()) return;
        try {
            await api.put(`/todos/${id}`, { title: editTodoTitle });
            setEditingTodoId(null);
            setEditTodoTitle("");
            refreshTodos(selectedList);
        } catch (err) {
            console.log(err);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await api.delete(`/todos/${id}`);
            refreshTodos(selectedList);
        } catch (err) {
            console.log(err);
        }
    };

    const markAllComplete = async () => {
        try {
            const pending = todos.filter((t) => !t.completed);
            await Promise.all(pending.map((t) => api.put(`/todos/${t._id}`, { completed: true })));
            refreshTodos(selectedList);
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
            getLists();
        } catch (err) {
            console.log(err);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    // tag counts for stats
    const tagCounts = todos.reduce((acc, todo) => {
        const tag = todo.tag || "No Tag";
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {});

    const allTags = ["all", ...Object.keys(tagCounts)];
    const filteredTodos = filterTag === "all" ? todos : todos.filter((t) => t.tag === filterTag);

    return (
        <div className="dashboard">
            <div className="header">
                <h1>Todo Dashboard</h1>
                <button className="logout-btn" onClick={logout}>Logout</button>
            </div>

            <div className="add-list">
                <input type="text" placeholder="New list name" value={title} onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addList()} />
                <button onClick={addList}>Add List</button>
            </div>

            <div className="content">
                <div className="lists">
                    {lists.map((list) => (
                        <div className={`card ${selectedList?._id === list._id ? "active" : ""}`} key={list._id}
                            onClick={() => selectList(list)}>
                            {editingListId === list._id ? (
                                <div onClick={(e) => e.stopPropagation()}>
                                    <input type="text" value={editListTitle}
                                        onChange={(e) => setEditListTitle(e.target.value)} />
                                    <button onClick={() => renameList(list._id)}>Save</button>
                                    <button onClick={() => setEditingListId(null)}>Cancel</button>
                                </div>
                            ) : (
                                <>
                                    <h3>{list.title} {list.isPublic && <span className="public-badge">Public</span>}</h3>
                                    {listTagCounts[list._id] && (
                                        <div className="list-tag-counts">
                                            {Object.entries(listTagCounts[list._id]).map(([tag, count]) => (
                                                <span key={tag} className="tag">{count} {tag}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => { setEditingListId(list._id); setEditListTitle(list.title); }}>Rename</button>
                                        <button onClick={() => shareList(list._id)}>Share</button>
                                        <button className="delete-btn" onClick={() => deleteList(list._id)}>Delete</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {selectedList && (
                    <div className="todos">
                        <h2>{selectedList.title}</h2>

                        {stats && (
                            <div className="stats">
                                <span>Total: {stats.total}</span>
                                <span className="completed-stat">Completed: {stats.completed}</span>
                                <span className="pending-stat">Pending: {stats.pending}</span>
                                <div className="tag-stats">
                                    {Object.entries(tagCounts).map(([tag, count]) => (
                                        <span key={tag} className="tag">{tag} ({count})</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="add-todo">
                            <input type="text" placeholder="Todo title" value={todoTitle}
                                onChange={(e) => setTodoTitle(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addTodo()} />
                            <button onClick={addTodo}>Add Todo</button>
                            <button onClick={markAllComplete}
                                disabled={todos.length === 0 || todos.every((t) => t.completed)}>
                                Mark All Complete
                            </button>
                        </div>

                        {pendingTodo && (
                            <div className="priority-popup">
                                <p>Select priority for <strong>{pendingTodo}</strong>:</p>
                                <div className="priority-btns">
                                    <button className="urgent-btn" onClick={() => confirmAddTodo("urgent")}>🔴 Urgent</button>
                                    <button className="important-btn" onClick={() => confirmAddTodo("important")}>🟡 Important</button>
                                    <button className="low-btn" onClick={() => confirmAddTodo("low priority")}>🟢 Low Priority</button>
                                    <button className="cancel-btn" onClick={() => setPendingTodo(null)}>Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="filter-tags">
                            {allTags.map((tag) => (
                                <button key={tag} className={`tag-filter ${filterTag === tag ? "active-tag" : ""}`}
                                    onClick={() => setFilterTag(tag)}>
                                    {tag === "all" ? "All" : `${tag} (${tagCounts[tag]})`}
                                </button>
                            ))}
                        </div>

                        {filteredTodos.map((todo) => (
                            <div className={`todo-item ${todo.completed ? "completed" : ""}`} key={todo._id}>
                                <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo)} />
                                {editingTodoId === todo._id ? (
                                    <>
                                        <input type="text" value={editTodoTitle}
                                            onChange={(e) => setEditTodoTitle(e.target.value)} />
                                        <button onClick={() => renameTodo(todo._id)}>Save</button>
                                        <button onClick={() => setEditingTodoId(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <span className="todo-title">{todo.title}</span>
                                        <span className={`status ${todo.completed ? "done" : "pending"}`}>
                                            {todo.completed ? "Completed" : "Not Completed"}
                                        </span>
                                        {todo.tag && <span className="tag">{todo.tag}</span>}
                                        <button onClick={() => { setEditingTodoId(todo._id); setEditTodoTitle(todo.title); }}>Rename</button>
                                        <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>✕</button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
