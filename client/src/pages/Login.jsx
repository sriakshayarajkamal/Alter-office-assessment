import {useState} from "react";
import {useNavigate,Link} from "react-router-dom";
import api from "../api";

function Login(){
    const navigate = useNavigate();
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    const handleLogin = async (e)=>{
        e.preventDefault();
        try{
            const res = await api.post("/auth/login", {
                email,password
            });
            localStorage.setItem("token",res.data.token);
            alert("Login Successful");
            navigate("/dashboard");
        }catch(err){
            alert(err.response?.data?.message || "Login Failed");
        }
    };
    return (
        <div className = "container">
            <h2>Login</h2>
            <form onSubmit = {handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
                <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
                <button type="submit">Login</button>
            </form>
            <p>Dont have an account?{" "}<Link to="/register">Register</Link></p>
        </div>
    );
}
export default Login;