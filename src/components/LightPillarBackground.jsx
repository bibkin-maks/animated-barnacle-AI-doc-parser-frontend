import React, { useRef } from 'react';
import LightPillar from './LightPillar';

const LightPillarBackground = () => {
    return (
        <div className="fixed inset-0 w-full h-full bg-[#0f1115] overflow-hidden -z-50 pointer-events-none">
            {/* LightPillar Component - Fullscreen */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div style={{ width: '1080px', height: '1080px', position: 'relative' }}>
                    <LightPillar
                        topColor="#5227FF"
                        bottomColor="#b19eff"
                        intensity={0.9}
                        rotationSpeed={0.3}
                        interactive={false}
                        glowAmount={0.004}
                        pillarWidth={3}
                        pillarHeight={0.4}
                        noiseIntensity={0.5}
                        pillarRotation={0}
                    />
                </div>
            </div>

            {/* Dark Overlay for Readability */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />
        </div>
    );
};

export default LightPillarBackground;
