import * as d3 from "d3";
import { useMemo } from "react";

export const D3Basic = () => {
  // Scales
  const pixelsPerTick : number = 5;
  let xScale : d3.ScaleLinear<number, number> = d3.scaleLinear().domain([10, 20]).range([0, 400]); // Solve a*10+b=0; a*20+b=400 -> a*10=400 -> a=40;b=-400 -> xScale(2)=20*2-400=-320
  const colorScale = d3.scaleLinear([2,4],['red','green']); //a*2+b=(255,0,0); a*4+b=(0,255,0) -> a*3+b=(128,64,0) -> 6a+2b=(255,255,0) 
  const ticks = useMemo(() => {
    const range = xScale.range();
    const height = range[0] - range[1];
    const numberOfTicksTarget = Math.floor(height / pixelsPerTick);

    return xScale.ticks(numberOfTicksTarget).map((value) => ({
      value,
      xOffset: xScale(value),
    }));
  }, [xScale]);
  xScale = d3.scaleLinear().domain([20, 30]).range([500, 0]);
  return (
    <div>
      <p> Linear Scale {xScale(2)}</p> 
      <p> Color Scale {colorScale(3)}</p>
      {xScale.ticks(22).map((value) => {
        return (<p> Ticks {value}</p>);
      })}
    </div>
  );
};
