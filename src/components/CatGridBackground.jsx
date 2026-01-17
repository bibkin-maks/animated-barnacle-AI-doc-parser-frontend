
/* eslint-disable */
import { useEffect, useRef } from 'react';
import HexagonGrid from './HexagonGridScript';

const CatGridBackground = () => {
    const canvasRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // "Cat Theme" - Oranges, Whites, Browns
        // Dark Orange: 0xd97736
        // White: 0xffffff
        // Brown/Darker: 0x8c4b2b
        // Light Cream: 0xffeadb

        const config = {
            type: "cats",
            n: 20,
            light1Color: 0xffffff,
            light1Intensity: 1000,
            light1PositionZ: 40,
            light2Color: 0xd97736, // Orange glow
            light2Intensity: 500,
            light2PositionZ: -20,
            colors: [0xffffff, 0x512FFB, 0x301C95], // White, Orange, Brown
            materialParams: {
                metalness: 0.8,
                roughness: 0.5,
                clearcoat: 1,
                clearcoatRoughness: 0.1
            },
            timeCoef: 1,
            depthScale: 1,
            tiltRotationX: 0.15,
            tiltRotationY: 0.15
        };

        // Initialize the library script
        const instance = HexagonGrid(canvasRef.current, config);
        instanceRef.current = instance;

        return () => {
            if (instanceRef.current) {
                instanceRef.current.dispose();
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-auto z-0 bg-[#0f1115]"
        />
    );
};

export default CatGridBackground;
