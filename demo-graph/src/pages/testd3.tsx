import { Scatterplot } from "../components/graph/Scatterplot";

function TestD3 ({data} : {data:number[]}) {
  
    return (
        <div>
            <Scatterplot data={[{x:3,y:5},{x:2,y:2}]} width={700} height={400} />
        </div>
    )
}

export default TestD3;