import { AreaChart } from "../components/graph/AreaChart";
import { Barplot } from "../components/graph/Barplot";
import { D3Basic } from "../components/graph/d3basic";
import { Scatterplot } from "../components/graph/Scatterplot";

function TestD3 ({data} : {data:number[]}) {
  
    return (
        <div className="container-fluid vh-100 vw-100"> {/* height = 100% view height */}
            <div className="row h-50"> {/* Height = 50% */}
                <div className="col-6 bg-primary">
                    <Scatterplot data={[{x:3,y:5},{x:2,y:2}]} width={700} height={400} />
                </div>
                <div className="col-6 bg-secondary">
                    <Barplot data={[{name:'Toan', value: 9}, {name: 'Oanh',value: 12}]} width={700} height={400} />  
                </div>
            </div>
            <div className="row h-50">
                <div className="col-6">
                    <AreaChart data={[{x:2,y:2},{x:3,y:5},{x:7,y:9}]} width={700} height={400} />
                </div>
                <div className="col-6 bg-danger">
                    <D3Basic />
                </div>
            </div>
        </div>
    )
}

export default TestD3;