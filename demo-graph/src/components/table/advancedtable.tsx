import React from 'react';
import { useTable, Column } from 'react-table';
type Product = {
  name: string;
  price: number;
};

type Props = {
  data: Product[];
};
export const AdvancedTable : React.FC<Props> = ({data}) => {
  const columns = React.useMemo<Column<Product>[]>(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Price",
        accessor: "price",
      }
    ],
    []
  );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable<Product>({ columns, data });
  return (
    <React.Fragment>
      <p> Advanced Table </p>
      <table {...getTableProps()} style={{ border: "1px solid black" }}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()} key={column.id} style={{ padding: "5px", borderBottom: "1px solid black" }}>
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.id}>
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} key={cell.column.id} style={{ padding: "5px", border: "1px solid gray" }}>
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </React.Fragment>
  );
};
