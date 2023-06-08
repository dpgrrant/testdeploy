import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ThreeGlobe from 'three-globe';
import countries from './data/countries.json';
import { TextureLoader } from 'three';
import * as d3 from 'd3';
import * as d3Dsv from 'd3-dsv';

const Globe = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let renderer, camera, scene, controls;
    let mouseX = 0;
    let mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    let Globe;

    init();
    initGlobe();
    animate();

    function init() {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Set alpha to true for transparent background
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current.appendChild(renderer.domElement);

      scene = new THREE.Scene();

      const ambientLight = new THREE.AmbientLight(0xbbbbbb, 0.3);
      scene.add(ambientLight);

      camera = new THREE.PerspectiveCamera();
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      const dLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dLight.position.set(-800, 2000, 4000);
      camera.add(dLight);

      const dLight1 = new THREE.DirectionalLight(0x7982f6, 1);
      dLight1.position.set(-200, 500, 200);
      camera.add(dLight1);

      const dLight2 = new THREE.DirectionalLight(0x8566cc, 0.5);
      dLight1.position.set(-200, 500, 200);
      camera.add(dLight2);

      camera.position.z = 400;
      camera.position.x = 0;
      camera.position.y = 0;
      scene.add(camera);

      scene.fog = new THREE.Fog(0x53ef3, 400, 2000);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.enableZoom = false; // Disable zoom
      controls.minDistance = 200;
      controls.maxDistance = 500;
      controls.rotateSpeed = 0.8;

      controls.minPolarAngle = Math.PI / 3.5;
      controls.maxPolarAngle = Math.PI - Math.PI / 3;
      window.addEventListener('resize', onWindowResize, false);
      document.addEventListener('mousemove', onMouseMove);
    }

    function initGlobe() {
      const weightColor = d3.scaleSequentialSqrt(d3.interpolateYlOrRd).domain([0, 1e7]);
      Globe = new ThreeGlobe({
        animateIn: true,
      })
      
        .hexBinPointWeight('pop')
        .hexAltitude((d) => d.sumWeight * 0.00000003)
        .hexBinResolution(4)
        .hexTopColor((d) => weightColor(d.sumWeight))
        .hexSideColor((d) => weightColor(d.sumWeight))
        .hexBinMerge(true)
        .hexBinResolution(3.04)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png');

      fetch('../../src/pop.csv')
        .then((res) => res.text())
        .then((csv) => d3.csvParse(csv, ({ lat, lng, pop }) => ({ lat: +lat, lng: +lng, pop: +pop })))
        .then((data) => Globe.hexBinPointsData(data));

      const textureLoader = new TextureLoader();
      const texture = textureLoader.load('//unpkg.com/three-globe/example/img/earth-night.jpg');

      Globe.rotateY(-Math.PI * (5 / 9));
      Globe.rotateZ(-Math.PI * 6);
      const globeMaterial = Globe.globeMaterial();
      // globeMaterial.map = texture;
      globeMaterial.bumpScale = 20;

      scene.add(Globe);
    }

    function onMouseMove(event) {
      mouseX = (event.clientX - windowHalfX) / 2;
      mouseY = (event.clientY - windowHalfY) / 2;
    }

    function onWindowResize() {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      camera.lookAt(scene.position);
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    // Clean up when the component unmounts
    return () => {
      window.removeEventListener('resize', onWindowResize, false);
      document.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} />;
};

export default Globe;
