import MyGraph from "../components/mygraph";

function TestD3 ({data} : {data:number[]}) {
  
    return (
        <div>
            <MyGraph name = "Toan" data={data}/>
        </div>
    )
}

export default TestD3;