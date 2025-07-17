import Signup from "./authentication/signup/signup";
import Signin from "./authentication/signin/signin";

import './App.css';
import Imp from "./components/imp";
function App(){
  return (

  <div>

    <Signup/>
    <Signin/>
    <Imp/>
    
  </div>
  );
}

export default App;
