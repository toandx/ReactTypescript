import React from 'react';
import { useTable, Column } from 'react-table';
type Product = {
  name: string;
  price: number;
};
export const BasicTable = () => {
  const data : Product[] = [{name:'Galaxy A55', price: 300},{name:'Iphone', price:1000}, {name:'Vinfast VF3', price:15000}];
  return (  
    <>
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
    </>
  );
};
