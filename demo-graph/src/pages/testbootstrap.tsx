import React from "react";
import { BasicTable } from "../components/table/basictable";
import { AdvancedTable } from "../components/table/advancedtable";
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
                    <BasicTable />
                </div>
                <div className="col-md-6">
                    <AdvancedTable data={[{name:'Lexus LX 570', price: 10000}, {name:'I9 14900KF', price:12490}]} />
                </div>
            </div>
            <div className="d-flex bg-light flex-row-reverse justify-content-center">
                <div className="p-2 border bg-info">Flex item 1</div> {/*Padding 2, Add border, background info*/}
                <div className="p-2 border bg-warning">Flex item 2</div>
            </div>
            <div className="d-flex bg-light" style={{height:150}}>
                <div className="p-2 border bg-info">Flex item 3</div> {/*Padding 2, Add border, background info*/}
                <div className="p-2 border bg-warning align-self-start">Flex item 4</div>
                <div className="p-2 border bg-warning align-self-center">Flex item 5</div>
            </div>
            <div className="d-flex bg-light flex-row justify-content-end">
                <div className="p-2 border bg-info">Flex item 6</div> {/*Padding 2, Add border, background info*/}
                <div className="p-2 border bg-warning">Flex item 7</div>
            </div>
        </React.Fragment>
    )
}

export default TestBootstrap;