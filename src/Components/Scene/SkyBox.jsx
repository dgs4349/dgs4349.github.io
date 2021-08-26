import React from 'react';
import { useThree } from "react-three-fiber";
import { CubeTextureLoader, TextureLoader, Texture } from 'three';

/*
Quarry
[
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596560624/Maps/Quarry/px_rhaag9.png', 
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596560625/Maps/Quarry/nx_nf8ewn.png', 
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596560623/Maps/Quarry/py_nozts5.png', 
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596560625/Maps/Quarry/ny_t2u0nh.png', 
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596560625/Maps/Quarry/pz_ixmkud.png', 
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596560625/Maps/Quarry/nz_fts1g9.png',
]
Venice
[
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596560660/Maps/Venice/px_wfxoz0.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596560657/Maps/Venice/nx_vennoj.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596560659/Maps/Venice/py_vrsrmv.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596560660/Maps/Venice/ny_pbaxvl.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596560659/Maps/Venice/pz_etexjm.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596560660/Maps/Venice/nz_uisfql.png',
]
Early Beach
[
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836459/Maps/Early%20Beach/px_pxosau.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836459/Maps/Early%20Beach/nx_iqios7.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836458/Maps/Early%20Beach/py_rkqxbf.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836459/Maps/Early%20Beach/ny_mqgymg.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836458/Maps/Early%20Beach/pz_frupjb.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836459/Maps/Early%20Beach/nz_dt5y1g.png',
]
Blue Beach
[
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836432/Maps/Blue%20Sunrise/px_fuzanw.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836432/Maps/Blue%20Sunrise/nx_hkqur2.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836431/Maps/Blue%20Sunrise/py_lcshrf.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836431/Maps/Blue%20Sunrise/ny_yaytac.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836432/Maps/Blue%20Sunrise/pz_jcfzlj.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836431/Maps/Blue%20Sunrise/nz_g1rtcf.png',
]
*/


const insanity =
[
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/a_hflip/v1596836432/Maps/Blue%20Sunrise/pz_jcfzlj.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/a_hflip/v1596836432/Maps/Blue%20Sunrise/pz_jcfzlj.png',

    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836431/Maps/Blue%20Sunrise/py_lcshrf.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836431/Maps/Blue%20Sunrise/py_lcshrf.png',

    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836432/Maps/Blue%20Sunrise/pz_jcfzlj.png',
    'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836432/Maps/Blue%20Sunrise/pz_jcfzlj.png',
]






let skyBox;

export function getSkyBox() { return skyBox; }

export default function SkyBox() {

    const { scene } = useThree();


    const loader = new  CubeTextureLoader();
    
    const texture = loader.load(
        [
            'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836432/Maps/Blue%20Sunrise/px_fuzanw.png',
            'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836432/Maps/Blue%20Sunrise/nx_hkqur2.png',
            'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836431/Maps/Blue%20Sunrise/py_lcshrf.png',
            'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836431/Maps/Blue%20Sunrise/ny_yaytac.png',
            'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836432/Maps/Blue%20Sunrise/pz_jcfzlj.png',
            'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836431/Maps/Blue%20Sunrise/nz_g1rtcf.png',
        ]
    );

    scene.background = texture;
    // return null;

    // const loader = new TextureLoader();
    // // Set the scene background property to the resulting texture.
    // scene.background = new TextureLoader().load(
    //               'https://res.cloudinary.com/dyzmnhqpr/image/upload/v1596836431/Maps/Blue%20Sunrise/py_lcshrf.png',
    //     );

    return null;

    // let size = 512;

	// let canvas = document.createElement( 'canvas' );
	// canvas.width = size;
	// canvas.height = size;

	// // get context
	// let context = canvas.getContext( '2d' );

	// // draw gradient
    // context.rect( 0, 0, size, size );
    
    // let gradient = context.createLinearGradient( size/2, size, size/2, 0 );
    
    // let colors = [
    //     //'#80A0B1',
    //     '#1e66b8',
    //     '#4E84A4',
    //     '#CEC5B9',
    //     '#CEC5B9',
    //     // '#A7BACC',
    //     '#c3d4e5',
    //     '#c3d4e5',
    //     '#76aac6',
    //     '#76aac6',
    //     // '#2F67A3'/

    //     // 'red',
    //     // 'green',
    //     // 'blue'
    // ];
    // colors.forEach((c, i) => gradient.addColorStop(i/(colors.length-1), c));

	// //gradient.addColorStop(0, '#99ddff'); // light blue 
	// //gradient.addColorStop(1, '#ffff00'); // dark blue
	// context.fillStyle = gradient;
    // context.fill();
    
    // context.fillStyle = 'rgba(200, 255, 255, 0.4)';
    // context.fill();


    // let texture = new Texture(canvas);

    // texture.needsUpdate = true;
    // scene.background = texture;

    // return null;
  }