import React from "react";
function TestBootstrap () {
  
    return (
        <React.Fragment>
            <div className="d-flex bg-light flex-row-reverse justify-content-center">
                <div className="p-2 border bg-info">Flex item 1</div> {/*Padding 2, Add border, background info*/}
                <div className="p-2 border bg-warning">Flex item 2</div>
            </div>
            <div className="d-flex bg-light" style={{height:150}}>
                <div className="p-2 border bg-info">Flex item 1</div> {/*Padding 2, Add border, background info*/}
                <div className="p-2 border bg-warning align-self-start">Flex item 2</div>
                <div className="p-2 border bg-warning align-self-center">Flex item 3</div>
            </div>
        </React.Fragment>
    )
}

export default TestBootstrap;