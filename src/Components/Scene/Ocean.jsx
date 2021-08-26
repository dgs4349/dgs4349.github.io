import React from 'react';

import { extend, useThree, useLoader, useFrame } from 'react-three-fiber';
import { PlaneBufferGeometry, Vector2, TextureLoader, RepeatWrapping, Vector3, SphereBufferGeometry, IcosahedronBufferGeometry, TorusKnotBufferGeometry } from 'three';
import * as THREE from 'three';
import { DebugDir } from 'Tech/DebugTools';

import Water from './ThreeWater';
//import { Water } from 'three/examples/jsm/objects/Water2';
import { GetSceneObject } from './SceneBufferRegister';
extend({Water})

// 'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596832830/Textures/waternormals_vgvtks.jpg'


export default function Ocean(props) {
    
   var waterGeometry = new PlaneBufferGeometry(10000, 10000);

    var textureLoader = new TextureLoader();
    var waterNormals = textureLoader.load('https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596832830/Textures/waternormals_vgvtks.jpg', function(map) {
        map.wrapS = RepeatWrapping;
        map.wrapT = RepeatWrapping;
    });

    // var water = new Water( waterGeometry, {
    //     scale: 0.5,

    //     textureWidth: 1024,
    //     textureHeight: 1024,
    //     waterNormals: waterNormals,
    //     distortionScale: 9,
    //     alpha: 0.9, 
    //     sunDirection: new Vector3(0, 1, 0),
    //     waterColor: 0x000055,
    // } );

    // water.position.y = -15;
    // water.rotation.x = Math.PI * -3.25/6

    // water.material.side = THREE.FrontSide;

    // useFrame((state, delta) => {
    //     water.material.uniforms['time'].value += 0.5 * delta;
        
    // });

    const { scene } = useThree();

    //const waterGeometry = new THREE.PlaneGeometry( 20, 20 );

    /*
    	var color = ( options.color !== undefined ) ? new Color( options.color ) : new Color( 0xFFFFFF );
	var textureWidth = options.textureWidth || 512;
	var textureHeight = options.textureHeight || 512;
	var clipBias = options.clipBias || 0;
	var flowDirection = options.flowDirection || new Vector2( 1, 0 );
	var flowSpeed = options.flowSpeed || 0.03;
	var reflectivity = options.reflectivity || 0.02;
	var scale = options.scale || 1;
	var shader = options.shader || Water.WaterShader;
	var encoding = options.encoding !== undefined ? options.encoding : LinearEncoding;
    */

    let water = new Water( waterGeometry, {
        color: '#749AC2',
        scale: 50,
        alpha: 0.5,
        reflectivity: 0.5,
        flowDirection: new THREE.Vector2( 1, 1 ),
        textureWidth: 1024,
        textureHeight: 1024
    } );

    // water.position.y = -15;
    // water.rotation.x = Math.PI * - 0.5;
        water.position.y = -15;
    water.rotation.x = -Math.PI/2;//Math.PI * -3.25/6
    scene.add( water );

    let excludeScene = new THREE.Scene();
    excludeScene.children = scene.children.filter(c => c.name != 'blobDisplayPlane');
    excludeScene.background = scene.background;
    // try {
    //     excludeScene.remove(GetSceneObject('blobDisplayPlane'))
    // }
    // catch(e){
    //     if(logs-- > 100) {

    //         console.log(e);
    //         console.log(scene);
    //         console.log(excludeScene);
    //     }
    // }

    water.getSceneFn = () => excludeScene;

    console.log(water);

//    THREE.scene.add( water );

    return null;
}

let logs = 100;