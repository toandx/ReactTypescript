import * as d3 from "d3";
import { AxisLeft } from "./AxisLeft";
import { AxisBottom } from "./AxisBottom";
import { useEffect, useMemo, useRef, useState } from 'react';

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };

type DataPoint = {
  x: number;
  y: number;
};

type ScatterplotProps = {
  width: number;
  height: number;
  data: DataPoint[];
};

export const Scatterplot = ({ width, height, data }: ScatterplotProps) => {
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const transparentRef = useRef(null);
  let range : number[] = [];
  // Scales
  const yScale = d3.scaleLinear().domain([0, 10]).range([boundsHeight, 0]);
  const xScale = d3
    .scaleLinear()
    .domain([0, 20])
    .range([0, boundsWidth]);

  // Build the shapes
  const allShapes = data.map((d, i) => {
    const isColored = !range.length || (range[0] <= d.x && d.x <= range[2] && range[3]<=d.y && d.y<=range[1]);
    return (
      <circle
        key={i}
        r={8}
        cx={xScale(d.x)}
        cy={yScale(d.y)}
        stroke='pink'
        fill = {isColored ? 'red' : 'pink'}
        fillOpacity={0.7}
      />
    );
  });

  // Render brush to drag and drop
  useEffect(() => {
    const chartElement = d3.select(transparentRef.current);
    chartElement.selectAll("*").remove();
    var brush : any = d3.brush().extent([[0,0],[boundsWidth,boundsHeight]])
                        .on("end", brushEnd);
    chartElement.call(brush);
  },[]);

  const brushEnd = (event: any) => {
    if (!event.selection) {
      return;
    }
    let [[x0,y0], [x1,y1]] = event.selection;
    range = [xScale.invert(x0),yScale.invert(y0),xScale.invert(x1),yScale.invert(y1)];
    alert(range[0]+' '+range[1]+' '+range[2]+' '+range[3]);
  };

  return (
    <div style={{ position: "relative" }}>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={transparentRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}></g>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {/* Y axis */}
          <AxisLeft yScale={yScale} pixelsPerTick={40} width={boundsWidth} />

          {/* X axis, use an additional translation to appear at the bottom */}
          <g transform={`translate(0, ${boundsHeight})`}>
            <AxisBottom
              xScale={xScale}
              pixelsPerTick={40}
              height={boundsHeight}
            />
          </g>

          {/* Circles */}
          {allShapes}
        </g>
      </svg>

      {/* Tooltip */}
      <div
        style={{
          width: boundsWidth,
          height: boundsHeight,
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          marginLeft: MARGIN.left,
          marginTop: MARGIN.top,
        }}
      >
      </div>
    </div>
  );
};
