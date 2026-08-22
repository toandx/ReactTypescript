import { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
const SIZE = 500;
const colors: string[] = [
  "#FF0000", // Red
  "#FF7F00", // Orange
  "#FFD700", // Gold
  "#FFFF00", // Yellow
  "#7FFF00", // Chartreuse
  "#00FF00", // Lime
  "#00FA9A", // Spring Green
  "#00FFFF", // Cyan
  "#00BFFF", // Deep Sky Blue
  "#0000FF", // Blue
  "#4B0082", // Indigo
  "#8A2BE2", // Blue Violet
  "#EE82EE", // Violet
  "#FF1493", // Deep Pink
  "#FF69B4", // Hot Pink
  "#DC143C", // Crimson
  "#A52A2A", // Brown
  "#808000", // Olive
  "#008080", // Teal
  "#808080", // Gray
];
type WheelItem = {
    text: string;
    color: string;
};

type Props = {
    items: WheelItem[];
};
type TextAreaChange = React.ChangeEvent<HTMLTextAreaElement>;

function LuckyWheel() {
    let items : WheelItem[] = [
        {text:"iPhone",color:"#ffadad"},
        {text:"100K",color:"#ffd6a5"},
        {text:"AirPods",color:"#fdffb6"},
        {text:"Laptop",color:"#caffbf"},
        {text:"Mouse",color:"#9bf6ff"},
        {text:"Keyboard",color:"#a0c4ff"},
        {text:"Nothing",color:"#bdb2ff"},
        {text:"Monitor",color:"#ffc6ff"}
    ];
    const canvasRandom =
        useRef<HTMLCanvasElement>(null);

    const [rotation, setRotation] = useState(0);
    const [text, setText] = useState('');
    const [spinning, setSpinning] = useState(false);

    useEffect(() => {
        draw(rotation);
    }, [rotation, items]);

    const draw = (angle: number) => {
        const canvas = canvasRandom.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, SIZE, SIZE);
        
        const center = SIZE / 2;
        const radius = 220;
        // Tổng số radian của một vòng tròn
        const TWO_PI = Math.PI * 2;
        // Góc của mỗi phần
        const piece = TWO_PI / items.length;

        ctx.save();
        ctx.translate(center,center);

        ctx.rotate(angle);


        items.forEach((item, index) => {

            const start = index * piece; // Start angle
            const end = start + piece; // End angle

            ctx.beginPath();
            ctx.moveTo(0,0);

            ctx.arc(0,0,radius,start,end);

            ctx.closePath();

            ctx.fillStyle =item.color;

            ctx.fill();

            ctx.strokeStyle ="black";
            ctx.stroke();
            ctx.save();

            ctx.rotate(
                start + piece / 2
            );


            ctx.textAlign = "right";
            ctx.textBaseline ="middle";
            ctx.font ="20px Arial";

            ctx.fillStyle ="black";
            ctx.fillText(
                item.text,
                radius - 20,
                0
            );
            ctx.restore();
        });


        /*
         * Khôi phục hệ tọa độ ban đầu.
         */
        ctx.restore();


        /*
         * Vẽ hình tròn ở giữa.
         */
        ctx.beginPath();

        ctx.arc(center,center,40,0,TWO_PI); // Draw center circle with background white, border black
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.strokeStyle = "black";

        ctx.stroke();
    };


    /**
     * Quay vòng.
     */
    const spin = () => {

        // Không cho click khi đang quay
        if (spinning) {
            return;
        }

        // Không có phần thưởng thì không quay
        if (items.length === 0) {
            return;
        }

        setSpinning(true);


        /*
         * ==========================================
         * 1. Chọn winner ngẫu nhiên
         * ==========================================
         */

        const winner =
            Math.floor(
                Math.random() * items.length
            );

        console.log(
            "Winner index:",
            winner
        );


        /*
         * ==========================================
         * 2. Các giá trị hình học
         * ==========================================
         */

        const TWO_PI =
            Math.PI * 2;

        const piece = TWO_PI / items.length;


        /*
         * Pointer của bạn nằm phía trên vòng.
         *
         * Canvas:
         *
         *          -90° V
         *            ↑
         *            |
         * 180° ←─────●─────→ 0°
         *            |
         *            ↓
         *           90°
         */
        const pointerAngle = -Math.PI / 2;
        const winnerCenter = (winner + 0.5) * piece;


        /*
         * ==========================================
         * 4. Tìm rotation cần đạt tới
         * ==========================================
         *
         * Ta cần:
         *
         * rotation
         *     +
         * winnerCenter
         *     =
         * pointerAngle
         *
         * Vì vậy:
         *
         * rotation =
         * pointerAngle - winnerCenter
         */

        const targetAngle = pointerAngle - winnerCenter; // -90 - (winnerId+1/2)*piece


        /*
         * ==========================================
         * 5. Tính số góc cần quay thêm
         * ==========================================
         *
         * rotation có thể đang ở bất kỳ góc nào.
         *
         * Ví dụ:
         *
         * rotation = 2500°
         *
         * Ta không thể giả định rotation = 0.
         *
         * Công thức dưới đây tìm khoảng cách
         * dương nhỏ nhất từ rotation hiện tại
         * tới target.
         */

        const delta =
            (
                (
                    targetAngle -
                    rotation
                ) % TWO_PI
                + TWO_PI
            ) % TWO_PI
            + TWO_PI * 6;


        /*
         * + TWO_PI * 6
         *
         * nghĩa là quay thêm 6 vòng.
         */


        /*
         * ==========================================
         * 6. Xác định start và end
         * ==========================================
         */

        const start =rotation;

        const end =start + delta;

        const duration = 5000;

        const startTime =
            performance.now();


        const animate =
            (time: number) => {

                /*
                 * Thời gian đã trôi qua.
                 */
                const elapsed =
                    time - startTime;


                /*
                 * Chuyển thành khoảng 0 → 1.
                 */
                const t =
                    Math.min(
                        elapsed / duration,
                        1
                    );

                const progress = 1 - Math.pow(1 - t,3); // From 0 to 1, first fast, then slow
                const current = start + (end - start) * progress;
                setRotation(current);

                /*
                 * Chưa hoàn thành
                 * → tiếp tục frame tiếp theo.
                 */
                if (t < 1) {

                    requestAnimationFrame(
                        animate
                    );

                } else {

                    /*
                     * Animation hoàn thành.
                     *
                     * Đưa rotation về khoảng
                     * 0 → 2π để tránh số quá lớn.
                     */
                    const finalRotation =
                        (
                            end % TWO_PI
                            + TWO_PI
                        ) % TWO_PI;


                    setRotation(
                        finalRotation
                    );


                    setSpinning(false);
                    alert("Winner: " +items[winner].text);
                }
            };

        requestAnimationFrame(
            animate
        );
    };
    const fn_updateOption= (e: TextAreaChange) => {
        console.log('Update text:'+e.target.value);
        setText(e.target.value);
        let arr = text.split('\n');
        console.log('arr:'+JSON.stringify(arr));
        let itemsOption : WheelItem[] = [];
        for(let id in arr) {
            itemsOption.push({text:arr[id],color:colors[id]});
        }
        items = itemsOption;
    }

    return (

        <div>

            <div
                style={{
                    position: "relative",
                    width: SIZE,
                    height: SIZE
                }}
            >

                <canvas
                    ref={canvasRandom}
                    width={SIZE}
                    height={SIZE}
                />


                {/* Pointer */}

                <div
                    style={{
                        position: "absolute",

                        left: "50%",

                        top: 0,

                        transform:
                            "translateX(-50%)",

                        width: 0,

                        height: 0,

                        borderLeft:
                            "20px solid transparent",

                        borderRight:
                            "20px solid transparent",

                        borderTop:
                            "40px solid red",

                        zIndex: 10
                    }}
                />

            </div>
            <textarea value={text} onChange={fn_updateOption}/>
        <Button variant="primary" onClick={spin} disabled={spinning}>
        {spinning
            ? "Spinning..."
            : "Spin"}
        </Button>

        </div>
    );
}

export default LuckyWheel;