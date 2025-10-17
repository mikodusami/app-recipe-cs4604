import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "../Authentication/sign-in.css"
import UserProvider from "../Contexts/UserContext";
import { useNavigate } from "react-router-dom";
const SignUp = () => {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();

    const navigate = useNavigate();

    

    const registerUser = async (e) => {
        e.preventDefault();
        //check if user exists

        
        try {
            const user_info = {
                "username": username,
                "password": password
            }
            const response = await fetch("http://127.0.0.1:8000/users/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(user_info)
                }
            )
            if (response.ok){
                const result = await response.json();
                navigate("/sign-in");
                
            }
            else {
                const result = await response.json();
                //handle error

            }
            
        } catch (err) {
            console.log(err.message)
        }
    }


    return (
        <div className="sign-in-page">
            <form className="sign-in-form" onSubmit={registerUser}>
                <div className="sign-in-username">
                    <h1>Username</h1>
                    <input className="username-input" value={username} onChange={(event) => {setUsername(event.target.value)}}/>
                </div>
                <div className="sign-in-password">
                    <h1>Password</h1>
                    <input className="password-input" type="password" value={password} onChange={(event) => {setPassword(event.target.value)}}/>
                </div>
                <button className="sign-in-submit" type="submit">Create Account</button>
            </form>
        </div>
    )
}
export default SignUp;