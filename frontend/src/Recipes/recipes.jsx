import { useState } from "react";
import "../Recipes/recipes.css"
const Recipes = () => {
    
    const test_data = [
        "Recipe 1",
        "Recipe 2",
        "Recipe 3",
        "Recipe 4",
        "Recipe 5"
    ]
    
    return (
        <div className="recipe-page">
            <input type="text" placeholder="Search Recipe"/>
            <p>Get All Recipes From Database</p>
            <div className="recipe-list">
                {test_data.map((item) => (
                    <div className="recipe-card">
                        <h1>{item}</h1>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Recipes;