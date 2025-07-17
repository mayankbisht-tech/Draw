import Signin from "../signin/signin";
import Signup from "../signup/signup";
import '../../App.css';
export default function Dashboard(){
    return(
        <div>
            <div>
                <p className="text-9xl text-shadow-sky-500">Draw</p>
            </div>
            <div>
                <Signin />
                <Signup />
            </div>
        </div>
    )
}