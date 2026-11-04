import LuckyWheel from "./LuckyWheel";
import {useState } from "react";
import './random.css'
const colors: string[] = [
  "#FF6B6B",
  "#FFA94D",
  "#FFD43B",
  "#69DB7C",
  "#38D9A9",
  "#3BC9DB",
  "#4DABF7",
  "#748FFC",
  "#9775FA",
  "#DA77F2",
  "#F783AC",
  "#FF8787",
];
type TextAreaChange = React.ChangeEvent<HTMLTextAreaElement>;
type WheelItem = {
    text: string;
    color: string;
};
function Random() {
    const firstItem = [
        {text:"iPhone",color:"#ffadad"},
        {text:"100K",color:"#ffd6a5"},
        {text:"AirPods",color:"#fdffb6"},
        {text:"Laptop",color:"#caffbf"},
        {text:"Mouse",color:"#9bf6ff"},
        {text:"Keyboard",color:"#a0c4ff"},
        {text:"Nothing",color:"#bdb2ff"},
        {text:"Monitor",color:"#ffc6ff"}
    ];
    const [items, setItems] = useState(firstItem);
    const [text, setText] = useState('');
    const fn_updateOption= (e: TextAreaChange) => {
        let newText = e.target.value;
        setText(e.target.value); // useState setText is async, not run sequentially
        let arr = newText.split('\n');
        console.log('arr:'+JSON.stringify(arr));
        let itemsOption : WheelItem[] = [];
        for(let id in arr) {
            itemsOption.push({text:arr[id],color:colors[id]});
        }
        console.log('itemsOption:'+JSON.stringify(itemsOption));
        setItems(itemsOption);
    }

    return (
      <div className='random-root'>
        <LuckyWheel items={items}>
            <textarea value={text} onChange={fn_updateOption}/>
        </LuckyWheel>
      </div>
    )

}

export default Random;