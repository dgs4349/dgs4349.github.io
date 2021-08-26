import * as THREE from 'three';
import DebugLog, { DebugDir, DebugColorLog } from '../../Tech/DebugTools';

let objectGlobalRegister = {};
let sceneRegister = {};
let perSceneObjectCount = {};// <key, array<objectKeys>

let bufferRegister = {};

function populateScene(scene, objs) {
    Object.keys(objs).forEach(k => {
        if(objectGlobalRegister[k]) scene.add(objectGlobalRegister[k]);
    })
}

export function GetSceneObject(key) {
    return objectGlobalRegister[key];
}

export function RegisterSceneObject(key, obj) {
    objectGlobalRegister[key] = obj;
}

export function GetScene(key, objs) {
    let scene = sceneRegister[key] = (sceneRegister[key] || new THREE.Scene());
    if(!objs) return scene;
    if(perSceneObjectCount[key] != Object.keys(objs).length) {
        //scene.children = [];
        perSceneObjectCount[key] = 0;
        populateScene(scene, objs);
    }
    return scene;
}

export function SetBufferTarget(name, buffer) {
    bufferRegister[name] = buffer;
};


let testTexture = new THREE.TextureLoader().load('https://gourav.io/_next/static/media/pages/clone-wars/img/og.png');

export function GetBufferContentsTexture(name) {
    return bufferRegister[name]?.texture || null;
}


export function RenderBufferExplicit({gl, camera}, bufferName, buffer, sceneName, sceneObjects) {
    let scene = GetScene(sceneName, sceneObjects);
    SetBufferTarget(bufferName, buffer);
    let prevRenderTarget = gl.getRenderTarget();
    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(prevRenderTarget);
}

export function RenderBuffer({gl, camera}, bufferName, sceneName) {
    let buffer = bufferRegister[bufferName];
    let scene = sceneRegister[sceneName];
    if(buffer && scene) {
        let prevRenderTarget = gl.getRenderTarget();
        gl.setRenderTarget(buffer);
        gl.render(scene, camera);
        gl.setRenderTarget(prevRenderTarget);
    }
}