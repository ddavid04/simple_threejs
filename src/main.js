import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// Helper function to get DOM elements
const get = id => document.querySelector(id)
const canvas = get('#canvas')

// Scene setup - make sure this happens regardless of screen size
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xc0f0f0)

// Default values
const defaults = {
    camera: { x: 0, y: 0, z: 5 },
    light: { x: 1, y: 1, z: 2 },
    dode: { x: 0, y: 0, color: '#468585', speedX: 0.01, speedY: 0.01 },
    box: { x: 0, y: -1.2, color: '#b4b4b3', speedY: 0.005 },
    cameraType: 'perspective',
    materialType: 'lambert',
    lightType: 'spot',
}

// State tracking
let isUIChange = false;
let currentMaterialType = defaults.materialType
let currentLightType = defaults.lightType;
let currentDodeColor = defaults.dode.color;
let currentBoxColor = defaults.box.color;
let isAnimating = true; // Flag to track animation state

// Initialize value displays
function updateValueDisplay(id, value) {
    const displayEl = get(`#${id}Value`);
    if (displayEl) {
        displayEl.textContent = parseFloat(value).toFixed(2);
    }
}

// Initialize UI elements
function initUI() {
    // Early return if any element is missing - don't crash
    if (!get('#cameraX') || !get('#cameraY') || !get('#cameraZ')) {
        return;
    }

    get('#cameraX').value = defaults.camera.x;
    updateValueDisplay('cameraX', defaults.camera.x);

    get('#cameraY').value = defaults.camera.y;
    updateValueDisplay('cameraY', defaults.camera.y);

    get('#cameraZ').value = defaults.camera.z;
    updateValueDisplay('cameraZ', defaults.camera.z);

    get('#lightX').value = defaults.light.x;
    updateValueDisplay('lightX', defaults.light.x);

    get('#lightY').value = defaults.light.y;
    updateValueDisplay('lightY', defaults.light.y);

    get('#lightZ').value = defaults.light.z;
    updateValueDisplay('lightZ', defaults.light.z);

    get('#dodeX').value = defaults.dode.x;
    updateValueDisplay('dodeX', defaults.dode.x);

    get('#dodeY').value = defaults.dode.y;
    updateValueDisplay('dodeY', defaults.dode.y);

    get('#dodeColor').value = defaults.dode.color;

    get('#dodeSpeedX').value = defaults.dode.speedX;
    updateValueDisplay('dodeSpeedX', defaults.dode.speedX);

    get('#dodeSpeedY').value = defaults.dode.speedY;
    updateValueDisplay('dodeSpeedY', defaults.dode.speedY);

    get('#boxX').value = defaults.box.x;
    updateValueDisplay('boxX', defaults.box.x);

    get('#boxY').value = defaults.box.y;
    updateValueDisplay('boxY', defaults.box.y);

    get('#boxColor').value = defaults.box.color;

    get('#boxSpeedY').value = defaults.box.speedY;
    updateValueDisplay('boxSpeedY', defaults.box.speedY);

    get('#cameraSelect').value = defaults.cameraType;
    get('#materialSelect').value = defaults.materialType;
    get('#lightSelect').value = defaults.lightType;
}

// Set up cameras
const aspect = window.innerWidth / window.innerHeight
const perspectiveCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
perspectiveCamera.position.set(defaults.camera.x, defaults.camera.y, defaults.camera.z);

const orthographicCamera = new THREE.OrthographicCamera(
    -5 * aspect, 5 * aspect, 5, -5, 0.1, 1000
)
orthographicCamera.position.set(defaults.camera.x, defaults.camera.y, defaults.camera.z);

let activeCamera = perspectiveCamera

// Set up renderer - make sure it's properly configured
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true // Allow transparent background
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x1a1a1a, 1) // Set clear color to match body background

// Set up OrbitControls
let controls = new OrbitControls(activeCamera, renderer.domElement)
controls.enableDamping = true

// Create geometries
const geometry = new THREE.DodecahedronGeometry()
const boxGeometry = new THREE.BoxGeometry(2, 0.1, 2)

// Create initial materials
let dodeMaterial = new THREE.MeshLambertMaterial({
    color: currentDodeColor,
    emissive: currentDodeColor
})
let boxMaterial = new THREE.MeshBasicMaterial({ color: currentBoxColor })

// Create meshes
let dodecahedron = new THREE.Mesh(geometry, dodeMaterial)
dodecahedron.position.set(defaults.dode.x, defaults.dode.y, 0);
scene.add(dodecahedron)

let box = new THREE.Mesh(boxGeometry, boxMaterial)
box.position.set(defaults.box.x, defaults.box.y, 0);
scene.add(box)

// Create light
let light = new THREE.SpotLight(0x006769, 100)
light.position.set(defaults.light.x, defaults.light.y, defaults.light.z)
scene.add(light)

// Add ambient light to ensure scene is visible
const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
scene.add(ambientLight)

// Camera update that preserves material and light settings
function updateCameraOnly() {
    // Check if elements exist before reading values
    const cameraX = get('#cameraX');
    const cameraY = get('#cameraY');
    const cameraZ = get('#cameraZ');

    if (!cameraX || !cameraY || !cameraZ) return;

    const x = parseFloat(cameraX.value)
    const y = parseFloat(cameraY.value)
    const z = parseFloat(cameraZ.value)
    activeCamera.position.set(x, y, z)
}

// Create a new material preserving the current color
function updateMaterial() {
    const materialType = currentMaterialType;
    const color = currentDodeColor;
    const pos = dodecahedron.position.clone();
    const rot = dodecahedron.rotation.clone();

    scene.remove(dodecahedron);

    switch (materialType) {
        case 'lambert':
            dodeMaterial = new THREE.MeshLambertMaterial({
                color: color,
                emissive: color
            });
            break;
        case 'phong':
            dodeMaterial = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 100
            });
            break;
        case 'standard':
            dodeMaterial = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.5,
                metalness: 0.5
            });
            break;
        case 'basic':
            dodeMaterial = new THREE.MeshBasicMaterial({
                color: color
            });
            break;
        default:
            dodeMaterial = new THREE.MeshLambertMaterial({
                color: color,
                emissive: color
            });
            break;
    }

    dodecahedron = new THREE.Mesh(geometry, dodeMaterial);
    dodecahedron.position.copy(pos);
    dodecahedron.rotation.copy(rot);
    scene.add(dodecahedron);

    // Update UI to show the current material type if element exists
    const materialSelect = get('#materialSelect');
    if (materialSelect) {
        isUIChange = true;
        materialSelect.value = materialType;
        isUIChange = false;
    }
}

// Update dodecahedron color preserving material type
function updateDodecahedronColor() {
    const dodeColor = get('#dodeColor');
    if (!dodeColor) return;

    currentDodeColor = dodeColor.value;

    // We need to recreate the material to properly apply the color
    // while preserving the material type
    updateMaterial();
}

// Light settings update
function updateLightSettings() {
    // Store current material and dode state
    const materialType = currentMaterialType;
    const color = currentDodeColor;
    const dodePosition = dodecahedron.position.clone();
    const dodeRotation = dodecahedron.rotation.clone();

    // Update light
    const lightType = currentLightType;
    const lightColor = 0x006769;

    // Check if elements exist before reading values
    const lightX = get('#lightX');
    const lightY = get('#lightY');
    const lightZ = get('#lightZ');

    if (!lightX || !lightY || !lightZ) return;

    const pos = new THREE.Vector3(
        parseFloat(lightX.value),
        parseFloat(lightY.value),
        parseFloat(lightZ.value)
    );

    if (light) scene.remove(light);

    switch (lightType) {
        case 'spot': light = new THREE.SpotLight(lightColor, 100); break;
        case 'directional': light = new THREE.DirectionalLight(lightColor, 2); break;
        case 'point': light = new THREE.PointLight(lightColor, 2, 100); break;
        case 'ambient': light = new THREE.AmbientLight(lightColor, 1); break;
        default: light = new THREE.SpotLight(lightColor, 100); break;
    }

    if ('position' in light) {
        light.position.copy(pos);
    }

    scene.add(light);

    // Recreate the material with the stored properties
    scene.remove(dodecahedron);

    switch (materialType) {
        case 'lambert':
            dodeMaterial = new THREE.MeshLambertMaterial({
                color: color,
                emissive: color
            });
            break;
        case 'phong':
            dodeMaterial = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 100
            });
            break;
        case 'standard':
            dodeMaterial = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.5,
                metalness: 0.5
            });
            break;
        case 'basic':
            dodeMaterial = new THREE.MeshBasicMaterial({
                color: color
            });
            break;
        default:
            dodeMaterial = new THREE.MeshLambertMaterial({
                color: color,
                emissive: color
            });
            break;
    }

    dodecahedron = new THREE.Mesh(geometry, dodeMaterial);
    dodecahedron.position.copy(dodePosition);
    dodecahedron.rotation.copy(dodeRotation);
    scene.add(dodecahedron);

    // Update UI to reflect current settings if elements exist
    const lightSelect = get('#lightSelect');
    const dodeColor = get('#dodeColor');

    if (lightSelect && dodeColor) {
        isUIChange = true;
        lightSelect.value = lightType;
        dodeColor.value = color;
        isUIChange = false;
    }
}

// Light position update
function updateLightPosition() {
    if (!('position' in light)) return;

    const lightX = get('#lightX');
    const lightY = get('#lightY');
    const lightZ = get('#lightZ');

    if (!lightX || !lightY || !lightZ) return;

    light.position.set(
        parseFloat(lightX.value),
        parseFloat(lightY.value),
        parseFloat(lightZ.value)
    );
}

// Object position updates
function updateObjectPositions() {
    // Check if elements exist before reading values
    const dodeX = get('#dodeX');
    const dodeY = get('#dodeY');
    const boxX = get('#boxX');
    const boxY = get('#boxY');

    if (!dodeX || !dodeY || !boxX || !boxY) return;

    // Update dodecahedron position
    dodecahedron.position.set(
        parseFloat(dodeX.value),
        parseFloat(dodeY.value),
        dodecahedron.position.z
    );

    // Update box position
    box.position.set(
        parseFloat(boxX.value),
        parseFloat(boxY.value),
        box.position.z
    );
}

// Update box color
function updateBoxColor() {
    const boxColorEl = get('#boxColor');
    if (!boxColorEl) return;

    currentBoxColor = boxColorEl.value;

    // Create new material with the updated color
    const newMaterial = new THREE.MeshBasicMaterial({ color: currentBoxColor });

    // Store position and rotation
    const pos = box.position.clone();
    const rot = box.rotation.clone();

    // Remove old box
    scene.remove(box);

    // Create new box with the new material
    box = new THREE.Mesh(boxGeometry, newMaterial);
    box.position.copy(pos);
    box.rotation.copy(rot);
    scene.add(box);
}

// Update UI sliders to match camera
function updateSlidersFromCamera() {
    if (isUIChange) return;

    // Check if elements exist before updating
    const cameraX = get('#cameraX');
    const cameraY = get('#cameraY');
    const cameraZ = get('#cameraZ');
    const cameraXValue = get('#cameraXValue');
    const cameraYValue = get('#cameraYValue');
    const cameraZValue = get('#cameraZValue');

    if (!cameraX || !cameraY || !cameraZ) return;

    isUIChange = true;

    // Get the current camera position
    const x = activeCamera.position.x;
    const y = activeCamera.position.y;
    const z = activeCamera.position.z;

    // Update sliders
    cameraX.value = x.toFixed(2);
    cameraY.value = y.toFixed(2);
    cameraZ.value = z.toFixed(2);

    // Update value displays if they exist
    if (cameraXValue) cameraXValue.textContent = x.toFixed(2);
    if (cameraYValue) cameraYValue.textContent = y.toFixed(2);
    if (cameraZValue) cameraZValue.textContent = z.toFixed(2);

    isUIChange = false;
}

// Set up event listeners - with checks to handle missing elements
function setupEventListeners() {
    // Camera position sliders
    const cameraX = get('#cameraX');
    const cameraY = get('#cameraY');
    const cameraZ = get('#cameraZ');

    if (cameraX) cameraX.addEventListener('input', updateCameraOnly);
    if (cameraY) cameraY.addEventListener('input', updateCameraOnly);
    if (cameraZ) {
        cameraZ.addEventListener('input', () => {
            updateCameraOnly();
            validateCameraZ();
        });
    }

    // Camera type selector
    const cameraSelect = get('#cameraSelect');
    if (cameraSelect) {
        cameraSelect.addEventListener('change', () => {
            if (isUIChange) return;

            const prevPos = activeCamera.position.clone();
            activeCamera = cameraSelect.value === 'perspective' ? perspectiveCamera : orthographicCamera;
            activeCamera.position.copy(prevPos);
            controls.object = activeCamera;
            validateCameraZ();
        });
    }

    // Material type selector
    const materialSelect = get('#materialSelect');
    if (materialSelect) {
        materialSelect.addEventListener('change', () => {
            if (isUIChange) return;

            currentMaterialType = materialSelect.value;
            updateMaterial();
        });
    }

    // Light type selector
    const lightSelect = get('#lightSelect');
    if (lightSelect) {
        lightSelect.addEventListener('change', () => {
            if (isUIChange) return;

            currentLightType = lightSelect.value;
            updateLightSettings();
        });
    }

    // Light position sliders
    const lightX = get('#lightX');
    const lightY = get('#lightY');
    const lightZ = get('#lightZ');

    if (lightX) lightX.addEventListener('input', updateLightPosition);
    if (lightY) lightY.addEventListener('input', updateLightPosition);
    if (lightZ) lightZ.addEventListener('input', updateLightPosition);

    // Object position sliders
    const dodeX = get('#dodeX');
    const dodeY = get('#dodeY');
    const boxX = get('#boxX');
    const boxY = get('#boxY');

    if (dodeX) dodeX.addEventListener('input', updateObjectPositions);
    if (dodeY) dodeY.addEventListener('input', updateObjectPositions);
    if (boxX) boxX.addEventListener('input', updateObjectPositions);
    if (boxY) boxY.addEventListener('input', updateObjectPositions);

    // Dodecahedron color
    const dodeColor = get('#dodeColor');
    if (dodeColor) {
        dodeColor.addEventListener('input', () => {
            if (isUIChange) return;
            updateDodecahedronColor();
        });
    }

    // Box color
    const boxColor = get('#boxColor');
    if (boxColor) {
        boxColor.addEventListener('input', () => {
            if (isUIChange) return;
            updateBoxColor();
        });
    }

    // Rotation speed controls
    const dodeSpeedX = get('#dodeSpeedX');
    const dodeSpeedY = get('#dodeSpeedY');
    const boxSpeedY = get('#boxSpeedY');

    if (dodeSpeedX) {
        dodeSpeedX.addEventListener('input', () => {
            updateValueDisplay('dodeSpeedX', dodeSpeedX.value);
        });
    }

    if (dodeSpeedY) {
        dodeSpeedY.addEventListener('input', () => {
            updateValueDisplay('dodeSpeedY', dodeSpeedY.value);
        });
    }

    if (boxSpeedY) {
        boxSpeedY.addEventListener('input', () => {
            updateValueDisplay('boxSpeedY', boxSpeedY.value);
        });
    }

    // Mouse wheel zoom handler
    if (canvas) {
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            let newZ = activeCamera.position.z + (e.deltaY * 0.01);
            newZ = Math.max(-10, Math.min(20, newZ));

            // Apply safety validation for perspective camera
            if (activeCamera === perspectiveCamera) {
                const minZ = 0.2;
                if (newZ > -minZ && newZ < minZ) {
                    newZ = newZ < 0 ? -minZ : minZ;
                }
            }

            // Only update the Z position, preserving X and Y
            activeCamera.position.z = newZ;
            updateSlidersFromCamera();
        }, { passive: false });
    }

    // Window resize handler with responsive behavior
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Update renderer and camera
        renderer.setSize(width, height);

        perspectiveCamera.aspect = width / height;
        perspectiveCamera.updateProjectionMatrix();

        orthographicCamera.left = -5 * width / height;
        orthographicCamera.right = 5 * width / height;
        orthographicCamera.top = 5;
        orthographicCamera.bottom = -5;
        orthographicCamera.updateProjectionMatrix();

        // Handle responsive visibility
        const controls = document.getElementById('controls');
        const mobileMessage = document.getElementById('mobile-message');

        if (width <= 1000) {
            if (controls) controls.style.display = 'none';
            if (mobileMessage) mobileMessage.style.display = 'block';
        } else {
            if (controls) controls.style.display = 'flex';
            if (mobileMessage) mobileMessage.style.display = 'none';
        }
    });

    // OrbitControls change event
    controls.addEventListener('change', updateSlidersFromCamera);
}

// Validate camera Z position to avoid rendering issues
function validateCameraZ() {
    if (activeCamera !== perspectiveCamera) return;

    const minZ = 0.2;
    const currentZ = activeCamera.position.z;

    if (currentZ > -minZ && currentZ < minZ) {
        // If too close to zero, move the camera to a safer position
        const newZ = currentZ < 0 ? -minZ : minZ;
        activeCamera.position.z = newZ;

        const cameraZ = get('#cameraZ');
        if (cameraZ) {
            cameraZ.value = newZ.toFixed(2);
            updateValueDisplay('cameraZ', newZ);
        }
    }
}

// Animation loop with error handling
function animate() {
    if (!isAnimating) return;

    try {
        requestAnimationFrame(animate);

        // Get current speeds from UI elements if they exist
        const dodeSpeedX = get('#dodeSpeedX');
        const dodeSpeedY = get('#dodeSpeedY');
        const boxSpeedY = get('#boxSpeedY');

        const speedX = dodeSpeedX ? parseFloat(dodeSpeedX.value) : 0.01;
        const speedY = dodeSpeedY ? parseFloat(dodeSpeedY.value) : 0.01;
        const speedBoxY = boxSpeedY ? parseFloat(boxSpeedY.value) : 0.005;

        // Update rotations
        if (dodecahedron) {
            dodecahedron.rotation.x += speedX;
            dodecahedron.rotation.y += speedY;
        }

        if (box) {
            box.rotation.y += speedBoxY;
        }

        // Update controls
        controls.update();

        // Render the scene
        renderer.render(scene, activeCamera);
    } catch (error) {
        isAnimating = false; // Stop animation if there's an error
    }
}

// Initialize and start the application with improved error handling
try {
    // Check if critical elements exist
    if (!canvas) {
        throw new Error('Canvas element not found');
    }

    // Initialize UI if controls are present
    if (document.getElementById('controls')) {
        initUI();
        setupEventListeners();
    }

    // Check initial screen size for responsive behavior
    const initialWidth = window.innerWidth;
    const controls = document.getElementById('controls');
    const mobileMessage = document.getElementById('mobile-message');

    if (initialWidth <= 1000) {
        if (controls) controls.style.display = 'none';
        if (mobileMessage) mobileMessage.style.display = 'block';
    } else {
        if (controls) controls.style.display = 'flex';
        if (mobileMessage) mobileMessage.style.display = 'none';
    }

    // Force a renderer resize to ensure proper initialization
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Start animation
    animate();
} catch (error) {
    console.log('An error has occurred: ', error);
}