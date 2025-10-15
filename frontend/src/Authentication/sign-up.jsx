import { useState } from "react";
import { Link } from "react-router-dom";
import "../Authentication/sign-in.css"
const SignUp = () => {
    
    return (
        <div className="sign-in-page">
            <form className="sign-in-form">
                <div className="sign-in-username">
                    <h1>Username</h1>
                    <input className="username-input"/>
                </div>
                <div className="sign-in-password">
                    <h1>Password</h1>
                    <input className="password-input" type="password"/>
                </div>
                <button className="sign-in-submit" type="submit">Create Account</button>
            </form>
        </div>
    )
}
export default SignUp;