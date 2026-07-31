import React, { useEffect, useRef, useState } from "react";

interface WheelItem {
    id: number;
    text: string;
    color: string;
}

interface Props {
    items: WheelItem[];
}

const SIZE = 500;

export default function LuckyWheel({ items }: Props) {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);

    useEffect(() => {
        draw(rotation);
    }, [rotation, items]);

    const draw = (angle: number) => {

        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        ctx.clearRect(0,0,SIZE,SIZE);

        const center = SIZE / 2;
        const radius = 220;

        const piece = Math.PI * 2 / items.length;

        ctx.save();

        ctx.translate(center,center);
        ctx.rotate(angle);

        items.forEach((item,index)=>{

            const start = index * piece;
            const end = start + piece;

            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.arc(0,0,radius,start,end);
            ctx.fillStyle = item.color;
            ctx.fill();

            ctx.stroke();

            ctx.save();

            ctx.rotate(start + piece/2);

            ctx.textAlign="right";
            ctx.font="20px Arial";
            ctx.fillStyle="black";

            ctx.fillText(item.text,radius-20,10);

            ctx.restore();

        });

        ctx.restore();

        // Center circle

        ctx.beginPath();
        ctx.arc(center,center,40,0,Math.PI*2);
        ctx.fillStyle="white";
        ctx.fill();
        ctx.stroke();

    };

    const spin = () => {

        if(spinning) return;

        setSpinning(true);

        const winner = Math.floor(Math.random()*items.length);
        console.log('Winner '+winner);

        const piece = 360/items.length;

        const stopAngle =
            360*6 +
            (360 - winner*piece - piece/2);

        const start = rotation;

        const end = start + stopAngle * Math.PI /180;

        const duration = 5000;

        const startTime = performance.now();

        const animate = (time:number)=>{

            const elapsed = time-startTime;

            const t = Math.min(elapsed/duration,1);

            // ease out cubic

            const progress = 1-Math.pow(1-t,3);

            const current = start + (end-start)*progress;

            setRotation(current);

            if(t<1){

                requestAnimationFrame(animate);

            }else{

                setRotation(end%(Math.PI*2));

                setSpinning(false);

                alert("Winner: "+items[winner].text);

            }

        }

        requestAnimationFrame(animate);

    }

    return (

        <div>

            <div style={{position:"relative",width:SIZE}}>

                <canvas

                    ref={canvasRef}
                    width={SIZE}
                    height={SIZE}
                />

                <div
                    style={{
                        position:"absolute",
                        left:"50%",
                        top:0,
                        transform:"translateX(-50%)",
                        width:0,
                        height:0,
                        borderLeft:"20px solid transparent",
                        borderRight:"20px solid transparent",
                        borderTop:"40px solid red"
                    }}
                />

            </div>

            <button onClick={spin} disabled={spinning}>
                {spinning ? "Spinning..." : "Spin"}
            </button>

        </div>

    );

}