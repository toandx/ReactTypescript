import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';

const MARGIN = { top: 30, right: 30, bottom: 30, left: 30 };

type DataPoint = { time: Date; value: number };

type AreaChartProps = {
  width: number;
  height: number;
  data: DataPoint[];
};
// Learn how to zoom at https://d3-graph-gallery.com/graph/area_brushZoom.html
export const TimeAreaChart = ({ width, height, data }: AreaChartProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Y axis
  const [minVal, maxVal] = d3.extent(data, (d) => d.value);
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, maxVal || 0])
      .range([boundsHeight, 0]);
  }, [data, height]);

  // X axis
  const [timeMin, timeMax] = d3.extent(data, (d) => d.time); // Get min,max of array
  const xScale = useMemo(() => {
    return d3
      .scaleTime()
      .domain([timeMin || 0, timeMax || 0])
      .range([0, boundsWidth]);
  }, [data, width]);

  // Render the X and Y axis using d3.js, not react
  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll('*').remove();
    const xAxisGenerator = d3.axisBottom(xScale);
    svgElement
      .append('g')
      .attr('transform', 'translate(0,' + boundsHeight + ')')
      .call(xAxisGenerator);

    const yAxisGenerator = d3.axisLeft(yScale);
    svgElement.append('g').call(yAxisGenerator);
  }, [xScale, yScale, boundsHeight]);

  // Build the line
  const areaBuilder = d3
    .area<DataPoint>()
    .x((d) => xScale(d.time))
    .y1((d) => yScale(d.value))
    .y0(yScale(0));
  const areaPath = areaBuilder(data);

  // Build the line
  const lineBuilder = d3
    .line<DataPoint>()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.value));
  const linePath = lineBuilder(data);

  if (!linePath || !areaPath) {
    return null;
  }

  return (
    <div>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="colorGradient" gradientTransform='rotate(90)'>
            <stop offset="50%" stopColor="#b451e8" />
            <stop offset="80%" stopColor="#daacf2" />
          </linearGradient>
        </defs>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        >
          <path
            d={areaPath}
            opacity={1}
            stroke="none"
            fill="url('#colorGradient')"
            fillOpacity={0.4}
          />
          <path
            d={linePath}
            opacity={1}
            stroke="#9a6fb0"
            fill="none"
            strokeWidth={2}
          />
        </g>
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={axesRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        />
      </svg>
    </div>
  );
};

/* How to make interactive line to drag drop in Area Chart?
1. Create transparent rect to listen event?
*/