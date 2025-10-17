import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "../Authentication/sign-in.css"
import { UserContext } from "../Contexts/UserContext";

const SignIn = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const {user, setUser} = useContext(UserContext);
    

    const LogInUser = async (e) => {
        e.preventDefault();
        const user_info = {
                "username": username,
                "password": password
            }
        try {
            const response = await fetch("http://127.0.0.1:8000/users/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(user_info)
                }
            )
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            //result should contain userID from backend
            setUser(result);
            
        } catch (err) {
            console.log(err.message)
        }
    }


    return (
        <div className="sign-in-page">
            <form className="sign-in-form" onSubmit={LogInUser}>
                <div className="sign-in-username">
                    <h1>Username</h1>
                    <input className="username-input" value={username} onChange={(event) => {setUsername(event.target.value)}}/>
                </div>
                <div className="sign-in-password">
                    <h1>Password</h1>
                    <input className="password-input" type="password" value={password} onChange={(event) => {setPassword(event.target.value)}}/>
                </div>
                <button className="sign-in-submit" type="submit">Sign In</button>
                <Link to="/sign-up">
                    <p>Create Account</p>
                </Link>
            </form>
        </div>
    )
}
export default SignIn;