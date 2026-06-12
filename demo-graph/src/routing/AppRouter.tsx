import { BrowserRouter, Routes, Route } from "react-router-dom";
import MasterLayout from "../components/MasterLayout";
import TestD3 from "../pages/testd3";
import TestContext from "../pages/testcontext";
import TestAxios from "../pages/testAxios";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserContext } from "../context/UserContext";
import { useState } from "react";
function AppRouter() {
  const [user, setUser] = useState("");
  return (
    <UserContext.Provider value={{user,setUser}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MasterLayout />}> 
            <Route index  element={<Home />}/>
            <Route path='/d3' element={<TestD3 data={[1,2,3]} />}/>
            <Route path='/context' element={<TestContext />}/>
            <Route path='/axios' element={<TestAxios />}/>
            <Route path='/login' element={<Login/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default AppRouter;
