import React from "react";
import { AuthProvider } from "../components/testContext/Auth";
import AuthContextComponent from "../components/testContext/AuthContextComponent";
import ParentComponent from "../components/testContext/ParentComponent";
function TestContext () {
    return (
        <React.Fragment>
            <p className="d-flex justify-content-center"> Test Context </p>
            <AuthProvider>
                <AuthContextComponent />
                <ParentComponent />
            </AuthProvider>
        </React.Fragment>
    )
}

export default TestContext;