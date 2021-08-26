import React, { Suspense } from 'react';
import { Canvas, extend, useFrame, useThree } from "react-three-fiber";
import WindowDimensions from "Tech/WindowDimensions";
import Ocean from './Ocean';

import { Sky, OrbitControls, Plane, Stats } from '@react-three/drei'
import { DebugDir } from 'Tech/DebugTools';
import DebugLog from 'Tech/DebugTools';
import SkyShader from './SkyShader';
import { Group, BoxBufferGeometry } from 'three';
import * as THREE from 'three';
import { DebugList } from 'Tech/DebugTools';
import SkyBox from './SkyBox';
import Blob from './Blob';
import { Ico } from './Blob';
import { Bloom, SSAO, SMAA, Scanline, Noise, DepthOfField, EffectComposerContext, EffectComposer } from 'react-postprocessing';
//import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'

import { BlendFunction, Resizer, KernelSize, RenderPass } from 'postprocessing';

//import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';


import * as Three from 'three';
import GaussianBottomUpPass from './GaussianEffect';
import { useMemo } from 'react';
import { GaussianPass } from './GaussianEffect';
import GaussianBottomUp from './Shaders/GaussianBottomUp';
import PostProcessingEffects from './Postprocesses';

// extend({EffectComposer, RenderPass, GaussianPass})

const RenderPassComp = React.forwardRef(({}, ref) => {
        const effect = useMemo(() => new RenderPass(), [])
        return <primitive ref={ref} object={effect} dispose={null} />
    });

// export function Effects(props) {


//     const THREE = useThree();

//     const composer = React.useRef();
    

//     return(

//         // <effectComposer ref={composer} args={[THREE.scene, THREE.camera]}>
//         //     <renderPass attachArray="passes" args={[THREE.scene, THREE.camera]} />
            
//         // </effectComposer>
//     // <effectComposer ref={composer} args={[THREE.gl]}>
//     //     <renderPass attachArray="passes" scene={THREE.scene} camera={THREE.camera}/>
//     //     <gaussianPass />
//     <EffectComposer>
//         <RenderPassComp />
//     </EffectComposer>
        
// // {/* 
// //         <renderPass attachArray="passes" scene={THREE.scene} camera={THREE.camera} /> */}
// //     {/* <Bloom 
// //     intensity={1} // The bloom intensity.
// //     kernelSize={KernelSize.LARGE} // blur kernel size
// //     luminanceThreshold={0.65} // luminance threshold. Raise this value to mask out darker elements in the scene.
// //     luminanceSmoothing={0} // smoothness of the luminance threshold. Range is [0, 1]
// //     /> */}
// //     {/* <Noise 
// //     opacity={0.04} 
// //     premultiply
// //     /> */}

//     );
// }



export default function Scene(props) {

    const {windowWidth, windowHeight} = WindowDimensions();

    window.pixelRatio = window.devicePixelRatio * 1/3;

    return(
        <Canvas
            id="threeCanvas"
            style={{width: windowWidth, height: windowHeight}}
            camera={
                { 
                    fov: 55, 
                    position: [0, 0, -55],
                }}
            gl={{ 
                logarithmicDepthBuffer: false,

                antialias: false, 
                depth: false,
                powerPreference: "high-performance",
                stencil: false,
                alpha: true,
            }}
            onCreated={({gl}) => { 
                gl.setClearColor('black');
                gl.setClearAlpha(0);
            }}
            shadowMap={false}
            pixelRatio={window.pixelRatio}
        >

    <Suspense fallback={null}>

            <ambientLight intensity={0.4} />
            <directionalLight intensity={1.} position={[-1, 1, -1]} args={[0xffffff]} />

            <SkyBox />
            <Ocean />
            <Blob />

            <Stats />

            <OrbitControls />

            {/* <PostProcessingEffects /> */}

        </Suspense>

        </Canvas>
    );

}