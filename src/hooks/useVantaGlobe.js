import { useEffect, useRef } from "react";

import * as THREE from "three";
import GLOBE from "vanta/dist/vanta.globe.min";

export default function useVantaGlobe(options = {}) {
  const vantaRef = useRef(null);
  const vantaInstance = useRef(null);

  useEffect(() => {
    if (!vantaInstance.current && vantaRef.current) {
      vantaInstance.current = GLOBE({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        backgroundColor: 0x050711,
        color: 0x7c3aed,
        color2: 0x22d3ee,
        size: 1.1,
        ...options,
      });
    }

    return () => {
      if (vantaInstance.current) {
        vantaInstance.current.destroy();
        vantaInstance.current = null;
      }
    };
  }, []); // only run once

  return vantaRef;
}
