import * as THREE from 'three';
import { useEffect, useRef } from 'react';

import { EarnedLabel, EarnedAmountLabel, PriceAndLabelWrapper } from './styled';

function Blob ({ earned }) {
  const container = useRef();
  useEffect(function () {
    if (container.current) {
      container.current.appendChild(renderer.domElement);
      resize();
    }
  }, []);
  return (
    <div ref={container} className="Blob">
      <PriceAndLabelWrapper>
        <EarnedAmountLabel>${earned}</EarnedAmountLabel>
        <EarnedLabel>Earned</EarnedLabel>
      </PriceAndLabelWrapper>
    </div>
  );
}

export default Blob;

let camera, scene, renderer;
let geometry, material, mesh;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const brightness = { value: 0.85, target: 0.85 };
const time = {
  get value () {
    return (Date.now() % 5000) * 0.0002;
  }
};
const waves = [
  { value: new THREE.Vector4() },
  { value: new THREE.Vector4() },
  { value: new THREE.Vector4() },
  { value: new THREE.Vector4() }
];
let lastWave = -1;

camera = new THREE.PerspectiveCamera(70, 1, 0.01, 10);
camera.position.z = 0.49;

scene = new THREE.Scene();

geometry = new THREE.SphereGeometry(0.2, 52, 32);
material = new THREE.MeshNormalMaterial();

material.onBeforeCompile = function (misc) {
  misc.uniforms.time = time;
  misc.uniforms.wave0 = waves[0];
  misc.uniforms.wave1 = waves[1];
  misc.uniforms.wave2 = waves[2];
  misc.uniforms.wave3 = waves[3];
  misc.uniforms.brightness = brightness;
  misc.vertexShader =
    `
            uniform float time;
            uniform vec4 wave0;
            uniform vec4 wave1;
            uniform vec4 wave2;
            uniform vec4 wave3;
            float waveFront( float x ) { return x / ((1.0 + x * x) * (1.0 + x * x)); }
            ` +
    misc.vertexShader.replace(
      '#include <displacementmap_vertex>',
      `
            const int N = 9;
            vec3 v = transformed;
            for( int i = 1; i <= N; i += 1) {
                float h = ( 2.0 * float( i ) - 1.0 ) / float( N ) - 1.0;
                float phi = acos( h );
                float theta = sqrt( float( N ) * 3.14159265 ) * phi;
                float r = sin( phi );
                // direction
                vec3 d = vec3( r * sin( theta ), r * cos( theta ), cos( phi ) );
                // center
                vec3 c = d * ( 0.1 + 0.025 * sin( time * 6.2831853 + 23.4 * theta * theta - phi ) );
                // bloat
                vec3 u = v - c; float U = length( u );
                float den = ( 1.0 + 87.6 * U * U );
                transformed += c / den;
                transformedNormal += u * max(5e-4, dot(u, c)) * 1e4;
            }
            // waves
            transformedNormal = normalize(transformedNormal);
            if( length( wave0 ) > 0.0 ) {
            	vec3 wave0radius = v - wave0.xyz;
            	float wave0arg = length( wave0radius ) - wave0.w;
            	transformedNormal += normalize( wave0radius ) * waveFront( wave0arg * 42.0 );
            }
            if( length( wave1 ) > 0.0 ) {
            	vec3 wave1radius = v - wave1.xyz;
            	float wave1arg = length( wave1radius ) - wave1.w;
            	transformedNormal += normalize( wave1radius ) * waveFront( wave1arg * 42.0 );
            }
            if( length( wave2 ) > 0.0 ) {
            	vec3 wave2radius = v - wave2.xyz;
            	float wave2arg = length( wave2radius ) - wave2.w;
            	transformedNormal += normalize( wave2radius ) * waveFront( wave2arg * 42.0 );
            }
            if( length( wave3 ) > 0.0 ) {
            	vec3 wave3radius = v - wave3.xyz;
            	float wave3arg = length( wave3radius ) - wave3.w;
            	transformedNormal += normalize( wave3radius ) * waveFront( wave3arg * 42.0 );
            }
            vNormal = normalize( transformedNormal );
            //if( length( transformed - waveAt ) < 0.05 ) vNormal = vec3( 1.0 );
            `
    );
  misc.fragmentShader =
    'uniform float brightness;\n' +
    misc.fragmentShader.replace(
      'opacity );',
      'opacity ); gl_FragColor.rgb *= brightness;'
    );
  // console.log( window.m = misc )
};

mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

geometry = new THREE.SphereGeometry(0.2, 16, 10);
mesh = new THREE.Mesh(
  geometry,
  new THREE.MeshBasicMaterial({
    /* color: 'white', wireframe: true */ visible: false
  })
);
scene.add(mesh);

const v = new THREE.Vector3();
const d = new THREE.Vector3();
const c = new THREE.Vector3();
const u = new THREE.Vector3();
const p = geometry.attributes.position.clone();
mesh.updateMatrixWorld = function (force) {
  THREE.Mesh.prototype.updateMatrixWorld.call(this, force);

  const N = 9;
  for (let k = 0; k < p.count; k++) {
    v.fromBufferAttribute(p, k);
    for (let i = 1; i <= N; i++) {
      const h = (2 * i - 1) / N - 1;
      const phi = Math.acos(h);
      const theta = Math.sqrt(N * 3.14159265) * phi;
      const r = Math.sin(phi);
      // direction
      d.set(r * Math.sin(theta), r * Math.cos(theta), Math.cos(phi));
      // center
      c.copy(d).multiplyScalar(
        0.1 +
          0.025 * Math.sin(time.value * 6.2831853 + 23.4 * theta * theta - phi)
      );
      // bloat
      u.copy(v).sub(c);
      const U = u.length();
      const den = 1.0 + 87.6 * U * U;
      v.addScaledVector(c, 1 / den);
    }
    geometry.attributes.position.setXYZ(k, v.x, v.y, v.z);
  }
  // geometry.attributes.position.needsUpdate = true;
};
mesh.scale.setScalar(1.05);

// renderer = new THREE.WebGLRenderer({ antialias: true });
renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // init like this
renderer.setClearColor(0xffffff, 0); // second param is opacity, 0 => transparent
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

let last = Date.now();
const handleMouse = function (event, override) {
  const now = override ? last + 300 : Date.now();
  if (now - last < 200) return;
  else last = now;
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / renderer.domElement.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / renderer.domElement.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(mesh);
  if (intersects[0]) {
    lastWave++;
    lastWave %= waves.length;

    mesh.worldToLocal(waves[lastWave].value.copy(intersects[0].point));
    waves[lastWave].value.w = override || 0;

    brightness.target += 0.2;
  }
};
window.addEventListener('mousemove', handleMouse, false);
window.addEventListener(
  'click',
  function (event) {
    handleMouse(event, 0.01);
    handleMouse(event, 0.08);
    handleMouse(event, 0.15);
  },
  false
);

function resize () {
  if (!renderer.domElement.parentNode) return;

  const width = renderer.domElement.parentNode.offsetWidth;
  const height = renderer.domElement.parentNode.offsetHeight;
  renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

function animation (time) {
  if (!renderer.domElement.parentNode) return;

  for (let i = 0; i < waves.length; i++) {
    if (waves[i].value.length() > 0) {
      if ((waves[i].value.w += 0.006) > 0.3) {
        waves[i].value.setScalar(0);
      }
    }
  }

  brightness.target = 0.7 + (brightness.target - 0.7) * 0.96;
  brightness.value =
    brightness.target + (brightness.value - brightness.target) * 0.96;

  renderer.render(scene, camera);
}
