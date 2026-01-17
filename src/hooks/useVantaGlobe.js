// /src/hooks/useVantaGlobe.js
import { useEffect, useRef, useState } from "react";
import CLOUDS from "vanta/dist/vanta.clouds.min";
import * as THREE from "three";

export default function useVantaGlobe(options = {}) {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        CLOUDS({
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
        })
      );
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect, options]);

  return vantaRef;
}
