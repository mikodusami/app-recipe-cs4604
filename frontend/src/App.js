import {Routes, Route} from 'react-router-dom'
import "../src/App.css"
import NavigationBar from './NavigationBar/navigation-bar';
import Home from './Home/home';
import SignIn from './Authentication/sign-in';
import Recipes from './Recipes/recipes';
import SignUp from './Authentication/sign-up';
import Profile from './ProfilePage/profile';


function App() {
  return (
    <Routes>
      <Route path="/" element={<NavigationBar />}>
        <Route index element={<Home />} />
        <Route path="sign-in" element={<SignIn/>}/>
        <Route path="recipes" element={<Recipes/>}/>
        <Route path='sign-up' element={<SignUp/>}/>
        <Route path='profile' element={<Profile/>}/>
        
      </Route>
    </Routes>
  );
}

export default App;
