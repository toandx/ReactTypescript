import * as d3 from 'd3';

function MyGraph ({data,name} : {data:number[], name:string}) {
    const x = d3.scaleLinear([0, data.length - 1], [20, 620]);
    // const y = d3.scaleLinear(d3.extent(data), [380, 20]);
    // const line = d3.line((d, i) => x(i), y);
    return (
        <div>
            <p> Hello {name} </p>
            <p> This is data {data}</p>
        </div>
    )
}

export default MyGraph;