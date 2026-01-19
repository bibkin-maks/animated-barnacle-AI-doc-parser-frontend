// /src/hooks/useVantaGlobe.js
import { useEffect, useRef } from "react";
import CLOUDS from "vanta/dist/vanta.clouds.min";
import * as THREE from "three";

export default function useVantaGlobe(options = {}) {
  const vantaRef = useRef(null);
  const effectRef = useRef(null);

  useEffect(() => {
    if (!effectRef.current && vantaRef.current) {
      effectRef.current = CLOUDS({
        el: vantaRef.current,
        THREE,
        mouseControls: false,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        skyColor: 0xd79568,
        cloudColor: 0xadc7de,
        sunColor: 0xfffe18,
        sunGlareColor: 0xff3030,
        sunlightColor: 0xff7830,
        speed: 0.5,
        ...options,
      });
    }

    return () => {
      if (effectRef.current) {
        effectRef.current.destroy();
        effectRef.current = null;
      }
    };
  }, [options]);

  return vantaRef;
}
