import {Link, Outlet} from "react-router-dom";
import { Fragment } from "react";
import "../NavigationBar/navigation-bar.css"
const NavigationBar = () => {

    return (
        <Fragment >
            <div className="nav-bar">
                <div className="links">
                    <div className="pages">
                        <Link to="/">
                            Home
                        </Link>
                        <Link to="/recipes">
                            Recipes
                        </Link>
                    </div>
                    

                    <div className="sign-in">
                        <Link to="/sign-in">
                            Sign-In
                        </Link>
                        <Link to="/profile">
                            Profile
                        </Link>
                    </div>
                </div>
                
            </div>
            <Outlet/>
        </Fragment>
    );
}

export default NavigationBar;