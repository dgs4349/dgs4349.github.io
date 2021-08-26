import React from 'react';
import  {useFrame, useThree} from 'react-three-fiber';
import WindowDimensions from 'Tech/WindowDimensions';

import Vector from './Vector';

import {Vector3} from 'three';
import * as THREE from 'three';

import DebugLog, { DebugDir, DebugColorLog, MakeScopeLogsPriority} from 'Tech/DebugTools';
import {GetScene, RegisterSceneObject, RenderBuffer, SetBufferTarget, GetBufferContentsTexture} from './SceneBufferRegister';
import { RenderBufferExplicit } from './SceneBufferRegister.jsx';


// export function getPixelCoordinate(vec, cam, z=-1) {
//     // -1 grabs near plane
//     return new Vector3(vec.x, vec.y, z).unproject(camera);
// }

// export function getViewportCoordinates(camera, windowWidth, windowHeight, dist=-1) {

//     let min = getPixelCoordinate(0, 0, dist);
//     let max = getPixelCoordinate(windowWidth, windowHeight, dist);

//     return {
//         min: getPixelCoordinate(0, 0),
//         max: getPixelCoordinate(windowWidth, windowHeight),
//         center: new Vector3().subVectors(max, min),
//         width: max.x,
//         height: max.y
//     }
// }

const copyShader = `
    uniform sampler2D iChannel0;
    uniform vec2 Resolution;

    void main() {
        gl_FragColor = texture(iChannel0, gl_FragCoord.xy/Resolution.xy);
    }
`;

function generateID(suffix) {
    return Math.random() * 10000 * Date.now();
}

function nullify(obj) { return Object.keys(obj) > 0 ? obj : null; }

export default function GraphicsPlane(props){

    const {
        meshName,
    
        excludeFromMainScene,
        excludeFromBufferScene,
        initialSize,
    
        meshProps = {}, 
        geoProps  = {},
        matProps  = {},
    
        fragShader,
        fragShaderGetUniFn,

        bufferSceneObjects,
    
        bufferName, 
        bufferSceneName = bufferName, 
        externalBufferSource, 
    
    } = props;

    let externalBufferOnly = externalBufferSource && true;

    let _bufferSceneObjects = bufferSceneObjects || {};

    const meshRef = React.useRef();

    const tctx = useThree();
    const {windowWidth, windowHeight} = WindowDimensions();

    const initSize = initialSize || {width: 80, height:80};
    const defaultResolution = {x: 800, y: 600};
    
    let id = generateID();
    let _meshName = meshName || ('GraphicsPlane_' + id);
    let geometryName = geoProps?.name || (_meshName + '_Geometry');
    let materialName = matProps?.name || (_meshName + '_Material');

    let _buffer;
    let _state = {};
    let _delta;
    let _init = false;

    function getState() {
        return {
            mesh: meshRef.current, 
            meshName: _meshName,
            delta: _delta,
            tctx: tctx,
            ..._state
        };
    }

    let testTexture;

    function init() {

        RegisterSceneObject(_meshName, meshRef.current);

        if(excludeFromMainScene) {
            tctx.scene.remove(meshRef.current);
        } 
        if(!excludeFromBufferScene) {
            _bufferSceneObjects[_meshName] = meshRef.current;
        }        
        
        if(!externalBufferOnly) {
            _buffer = new THREE.WebGLRenderTarget(
                windowWidth * window.pixelRatio,
                windowHeight * window.pixelRatio,
                {
                    depthBuffer: false,
                    stencilBuffer: false, 
                    format: THREE.RGBAFormat,
                    minFilter: THREE.LinearFilter,  
                    magFilter: THREE.LinearFilter,
                    generateMipmaps: false,
                }
            );
            SetBufferTarget(bufferName, _buffer);
            GetScene(bufferSceneName, _bufferSceneObjects);
        }


        testTexture = new THREE.TextureLoader().load('https://gourav.io/_next/static/media/pages/clone-wars/img/og.png');

        _init = true;
    }

    // notes: we grab the mesh position, so that this mesh can be moved in the future for better
    //          object staging, rather than having to move all objects relative to the graphics plane

    useFrame((state, delta) => {

        let {
            cameraPosition,
            cameraRotation,
            viewport,
            meshPosition,
            meshCameraDistance
        } = _state;
        
        // if the camera moved
        let moved = !_init || (
            !cameraPosition || !cameraPosition.checkEach(tctx.camera.position) ||
            !cameraRotation || !cameraRotation.checkEach(tctx.camera.rotation) 
        );
        
        _delta = delta;
        if(!_init) init();

        //preUpdateLogic?.(meshRef, getArgs());
        

        if(moved) {
            // current camera positions
            let currentCameraPosition = new Vector(tctx.camera.position);
            let currentCameraRotation = new Vector(tctx.camera.rotation);


                // if not a previous position, we'll base our future caluations form the current (initial) state
            // otherwise:
            if(cameraPosition) {
                // get the previous distance (new target distance)
                meshCameraDistance = new Vector(meshRef.current.position).sub(cameraPosition);

                meshRef.current.position.copy(tctx.camera.position);
                meshRef.current.rotation.copy(tctx.camera.rotation);
                meshRef.current.updateMatrix();
                meshRef.current.translateZ(-meshCameraDistance.mag());

            }


            // if this is our first time, we'll grab the distance for future updates
            meshCameraDistance = meshCameraDistance || new Vector(meshRef.current.position).sub(currentCameraPosition);



            // make the plane take up the full screen viewport width
            // camera view in gl units https://stackoverflow.com/a/13351534
            /*
                One way of adjusting to screen size is to check for changes
                 in the window, and then unprojecting the new dimensions
                But really the window size isn't important, only the aspect ratio
                If the aspect ration changes, we can instead of unprojecting, borrow
                 the angle of the FoV, and do some trig to recalculate a corner of the plane
                 and then readjust the scale of the plane
                I didn't write the code below but I'm pretty sure that's what it's doing
                 and far more elegantly than what I could do.
            */
            let vFOV = THREE.MathUtils.degToRad( tctx.camera.fov );

            let currentViewport = {};
            currentViewport.height = 2 * Math.tan( vFOV / 2 ) * meshCameraDistance.mag();
            currentViewport.width = currentViewport.height * tctx.camera.aspect;   

            if(!viewport || viewport != currentViewport) {

                if(!externalBufferOnly)
                    _buffer.setSize(windowWidth * window.pixelRatio, windowHeight * window.pixelRatio);

                let scale = {
                    width:  currentViewport.width/initSize.width,
                    height: currentViewport.height/initSize.height
                };

                //meshRef.current.scale.set(scale.width, scale.height, 1);

            }

            // this is gross, but this is much faster than fun key string trickery
            _state = {

                previousCameraPosition:     cameraPosition,
                previousCameraRotation:     cameraRotation,
                previousViewport:           viewport,
                previousPosition:           meshPosition,
                previousMeshCameraDistance: meshCameraDistance, 

                cameraPosition:             currentCameraPosition,
                cameraRoatation:            currentCameraRotation,
                viewport:                   currentViewport,
                meshPosition:               meshRef.current.position,
                meshCameraDistance:         meshCameraDistance,

                currentCameraPosition,
                currentCameraRotation,
                currentViewport,
                currentMeshPosition:        meshRef.current.position,
                currentMeshCameraDistance:  meshCameraDistance,

                moved
            };

        }

        if(fragShader) {
            if(fragShaderGetUniFn) {
                meshRef.current.material.uniforms = fragShaderGetUniFn(getState());
            }
        }

        if(!externalBufferOnly) {
            RenderBufferExplicit(tctx, bufferName, _buffer, bufferSceneName, _bufferSceneObjects);
        }
        else {
            // yeah so, my setup works great for shaders but not just a simple mat.map = texture
            // dunno why so just going to make my own copy shader to fix this
            const _texture = GetBufferContentsTexture(externalBufferSource);
            
            if(_texture) {
                meshRef.current.material.uniforms.iChannel0.value = _texture;
                meshRef.current.material.uniforms.Resolution.value = new THREE.Vector2(_texture.image.width, _texture.image.height);

            }
        }

    });

    let logs = 15;

    return (
        <mesh 
        position={[0, 0, 0]}
        rotation={[0, Math.PI, 0]}
        {...meshProps} 
        ref={meshRef}
        name={_meshName}
        >
            <planeBufferGeometry attach="geometry"
                args={[initSize.width, initSize.height]}
                name={geometryName}
                {...geoProps} 
             />
            {
                fragShader? 
                    <shaderMaterial attach="material"

                    fragmentShader={fragShader}
                    premultipliedAlpha={true}
                    uniforms={fragShaderGetUniFn(getState())}

                    transparent={true}
                    depthTest={false}
                    name={materialName}
                    {...matProps} 

                    />
                : 
                    <shaderMaterial attach="material"

                        fragmentShader={copyShader}
                        premultipliedAlpha={true}
                        uniforms={{
                            iChannel0: {value: new THREE.Texture()},
                            Resolution: {value: new THREE.Vector2(0, 0)}
                        }}
                        transparent={true}
                        depthTest={false}
                        name={materialName}
                        {...matProps} 

                    />
            }
        </mesh>);
};
