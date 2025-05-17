import React from "react";
type Product = {
  name: string;
  price: number;
};
function TestBootstrap () {
    const data : Product[] = [{name:'Galaxy A55', price: 300},{name:'Iphone', price:1000}, {name:'Vinfast VF3', price:15000}];
    return (
        <React.Fragment>
            <p className="d-flex justify-content-center"> Dashboard App </p>
            <div className="row">
                <div className="col-md-6">
                    <p> Basic Table </p>
                    <table className="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th> ID </th>
                                <th> Product </th>
                                <th> Price </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row,index) => {
                                return (
                                <tr key={index}>
                                    <td> {index} </td>
                                    <td> {row.name} </td>
                                    <td> {row.price} </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="col-md-6">
                    <p> Advanced Table </p>
                </div>
            </div>
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