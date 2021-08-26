import { Icosahedron } from '@react-three/drei';
import React, { useMemo } from 'react';
import { useFrame } from "react-three-fiber";
import WindowDimensions from "Tech/WindowDimensions";
import * as Three from 'three';
import { Vector2, Vector3, Vector4 } from 'three';
import GraphicsPlane from './GraphicsPlane.jsx';
//import RaymarchBlobFragShader from './Shaders/Old_RaymarchBlobFragShader';
import RaymarchMain from './Shaders/RaymarchMain.js';
import RaymarchPostpass from './Shaders/RaymarchPostpass';
import RaymarchPrepass from './Shaders/RaymarchPrepass';
import Vector from './Vector';

import {GetBufferContentsTexture} from './SceneBufferRegister';
import { truncate } from 'fs';



const showDebugIcos = false;





/**
 * Random notes that should be included in documentation
 * 
 * Raymarch coordinates (eye, center, etc) 
 *  are real fucky, but would take too long to tweak params
 *  to correct. sorry :/
 * 
 * 
 */




/*
    Uniforms are passed into shader in Blob update,
    Update logic is called in Blob update

    Only relevant Uniforms are passed during Blob Update

*/
let Uniforms = {

    DebugLocation: false,

    SampleSize: 20,

    NumSpheres: 15, // check length below
    SphereRadius: 0.5,
    SmoothFactor: 7.5,

    Spheres: Array.from({length: 15}, () => new Vector4()),

    Center: new Vector3(0, -2, 0),
    Eye: new Vector3(0, 0, 0),
    Resolution: new Vector2(600, 800),
    Overdraw: 1, // leftover logic still in shader, keep this for now but don't touch

    BokehStart: 50,
    BokehEnd: 10,
    BokehAdjust: 1.2, 

    GaussianDepth: 2,
    GaussianRingSamples: 12,
    GaussianSizeStart: 1.,
    GaussianSizeEnd: 24.,
    BokehMult: 2.25,
    GammaAdjust: 0.,

    BlurTileDist: 20,

    AmbientLight: new Vector3(0.4, 0.4, 0.4),

    DirectionLightPosition: new Vector3(0., 10., -10.),
    DirectionLightColor: new Vector3(1., 1., 1.),
    DirectionLightIntensity: 1.,
    
    SpecularColor: new Vector3(1., 1., 1.),
    SpecularAlpha: 30.,

    // r g b prevMeshCamDist
    GradientColorSteps: [
        new Vector4( 135, 0, 88,  3 ),
        new Vector4( 242, 66, 54  ,  7 ),
        new Vector4( 245, 247, 73 , 9 ),
        new Vector4( 38, 196, 133 , 12 ),
    ],

    iChannel0: new Three.Texture(),
    iChannel1: new Three.Texture(),
}


Uniforms.GradientColorSteps.forEach(c => {
    c.x /= 256;
    c.y /= 256;
    c.z /= 256;
});

let GaussianUniforms = {
    iResolution: new Vector2(800, 600),
    GaussianDepth: 2.,
    GaussianRingSamples: 8.,
    GammaAdjust: 0.0,
    iChannel0: new Three.Texture()
};

// Convert each property to a Three 'Uniform' object
Object.keys(Uniforms).forEach(k => {
    Uniforms[k] = new Three.Uniform(Uniforms[k])
});

Object.keys(GaussianUniforms).forEach(k => {
    GaussianUniforms[k] = new Three.Uniform(GaussianUniforms[k])
});


const UniformUpdateKeys = [ "Spheres", "Eye", "Center", "Resolution" ];


// GooUpdate: { mesh, rotationSpeed, position, velocity }
const GooUpdates = [];

const spread = 30;
const initialSpeed = 15;

const origin = new Vector(0, 0, -10);
const originMass = 3000; // with each object being 1
const inertia = 1;

const grav = 0.025;
const slow = 0.9;


let gravForce;
let deltaCamPos;


const UpdateGoos = (delta) => {

    if(delta > 0.5) return;

    //delta *= 1;

    GooUpdates.forEach((
        {mesh, rotationSpeed, position, velocity, mapped}, i
            ) => {
                
            delta *= slow;

            // vector from point to origin
            deltaCamPos = origin.sub(position);
            gravForce = (grav * originMass / deltaCamPos.sqMag()) * delta;

            velocity.add(deltaCamPos.mult(gravForce, true), true);


            velocity.mult(inertia, true);

            position.add(velocity.mult(delta), true);

            if(position.max() > 200) {
                position[position.max()] = 199;
                velocity.mult(-0.5, true);
            }

            if(showDebugIcos) {
                mesh.current.rotation.add(rotationSpeed.mult(delta));
                mesh.current.position.set(...position.toArray());
            }

            // closest to actual icos is from 100 - -100, sphere size 1
            mapped = position.map(-200, 200, 75, -75);

            if(Uniforms.Spheres.value[i])
             Uniforms.Spheres.value[i].set(mapped.x, mapped.y, mapped.z, 1);
    });

};



const randomAxis = () => {
    const factor= Math.random();
    const sign = Math.random() > 0.5 ? 1 : -1;
    if(factor < 0.33) return new Vector().up().mult(sign, true);
    if(factor > 0.67) return new Vector().right().mult(sign, true);
    return new Vector().forward().mult(sign, true);
}






export function Goo(props) {

    const mesh = React.useRef();

    let rotationSpeed;
    let position;
    let velocity;
    
    let color = "red";

    useMemo(() => {
        rotationSpeed = new Vector().random();

        position = new Vector().random().mult(spread, true).subScalar(spread/2, true);

        velocity = new Vector().random().mult(initialSpeed, true).subScalar(initialSpeed/2);
        
        let nudge = randomAxis().mult(initialSpeed, true);
        velocity.add(nudge);
    
        GooUpdates.push({mesh, rotationSpeed, position, velocity});
    });

    if(!showDebugIcos) return null;

    return(
        <mesh ref={mesh} position={props.position} scale={[1, 1, 1]}>
            <icosahedronBufferGeometry attach="geometry" args={[props.radius||2, props.detail||1]} />
            <meshPhongMaterial attach="material"
                args={[{
                    color: color,
                    shininess: 30,
                    specular: 0x454545,
                    flatShading: true,
                }]}
            />
        </mesh>
    );
}

/*
   Object instead of shaderpass to be used with ocean reflections and easier rendering order
*/
export default function Blob(props) {

    const meshMainName = 'blob';
    const meshAName = 'blobA';
    const meshBName = 'blobB';

    const meshGraphicsName = 'blobDisplayPlane';
    const meshReflectName = 'blobReflectPlane';

    const bufferAName = 'blobBufferA';
    const bufferBName = 'blobBufferB';

    const {windowWidth, windowHeight} = WindowDimensions();

    Uniforms.Resolution.value = new Vector2(
        windowWidth * Uniforms.Overdraw.value * window.pixelRatio, // set in Scene
        windowHeight * Uniforms.Overdraw.value * window.pixelRatio);


    const getUniforms = (function({
        previousMeshPosition,
        currentMeshPosition,
        currentCameraPosition,
        moved
    }) {


        if(!moved) return Uniforms;

       let center = new Vector(Uniforms.Center.value);
       if(previousMeshPosition && 
           !previousMeshPosition.abs().checkEach(currentMeshPosition.abs(), 5)) 
           {

           Uniforms.Center.value = 
               center.add(
                   currentMeshPosition.sub(previousMeshPosition).mult(0.5)
               ).toArray();
       }

       Uniforms.Eye.value = currentCameraPosition.add(center).toArray();

       Uniforms.iChannel0 = {value: GetBufferContentsTexture(bufferAName)};
       Uniforms.iChannel1 = {value: GetBufferContentsTexture(bufferBName)};

       return Uniforms;

    }).bind(this);


    // todo: use Camera.scissor
    useFrame((state, delta) => {
        UpdateGoos(delta);
    }, 0);
    
    return(<>

        { Array.from({length: Uniforms.NumSpheres.value}, (_, i) => <Goo key={i} index={i} />) }

        {/* <GraphicsPlane {...{
            meshName: meshGraphicsName,
            externalBufferSource: meshMainName
        }}/> */}

        <GraphicsPlane {...{
            meshName: meshReflectName,
            externalBufferSource: meshMainName,

            excludeFromMainScene: false,
            meshProps: {
                rotation: [0, -Math.PI, 0]
            }
        }}/>

        <GraphicsPlane {...{
            meshName: meshMainName,
            excludeFromMainScene: true,
            excludeFromBufferScene: false,

            fragShader: RaymarchPostpass,
            fragShaderGetUniFn: getUniforms,

            bufferName: meshMainName,
        }}
        />

         <GraphicsPlane {...{

            meshName: meshAName,
            excludeFromMainScene: true,
            excludeFromBufferScene: false,

            fragShader: RaymarchPrepass,
            fragShaderGetUniFn: getUniforms,

            bufferName: bufferAName

        }}
        />

        <GraphicsPlane {...{
            meshName: meshBName,
            excludeFromMainScene: true,
            excludeFromBufferScene: false,

            fragShader: RaymarchMain,
            fragShaderGetUniFn: getUniforms,

            bufferName: bufferBName
        }}
        /> 
        

        {showDebugIcos ? <Icosahedron args={[5, 2]}> <meshPhongMaterial attach="material" color="pink" flatShading={true}/></Icosahedron> : null}

    </>);
}