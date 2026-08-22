import LuckyWheel from "./LuckyWheel";

function Random() {
    const items = [
        {id:1,text:"iPhone",color:"#ffadad"},
        {id:2,text:"100K",color:"#ffd6a5"},
        {id:3,text:"AirPods",color:"#fdffb6"},
        {id:4,text:"Laptop",color:"#caffbf"},
        {id:5,text:"Mouse",color:"#9bf6ff"},
        {id:6,text:"Keyboard",color:"#a0c4ff"},
        {id:7,text:"Nothing",color:"#bdb2ff"},
        {id:8,text:"Monitor",color:"#ffc6ff"}
    ];

    return (
      <div>
        <LuckyWheel/>

      </div>
    )

}

export default Random;