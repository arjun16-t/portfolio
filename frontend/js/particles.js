/*
========================================
CNN FEATURE MAP KERNEL (SMART DATA MASK)
Powered by Three.js & Custom GLSL Shaders
========================================
*/

(() => {
    let scene, camera, renderer, particles;
    let mouseX = -1000, mouseY = -1000;
    let scrollProgress = 0;
    let targetScrollProgress = 0;

    const container = document.createElement('div');
    container.id = 'webgl-container';
    document.body.prepend(container);

    function initWebGL() {
        scene = new THREE.Scene();

        const width = window.innerWidth;
        const height = window.innerHeight;
        camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
        camera.position.z = 100;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
        container.appendChild(renderer.domElement);

        // RESTORED MOUSE TRACKING: No artificial boundaries needed anymore
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX - window.innerWidth / 2;
            mouseY = -(e.clientY - window.innerHeight / 2); 
        });

        window.addEventListener('mouseout', () => {
            mouseX = -1000;
            mouseY = -1000;
        });

        window.addEventListener('scroll', () => {
            const maxScroll = window.innerHeight * 0.8;
            targetScrollProgress = Math.min(window.scrollY / maxScroll, 1.0);
        }, { passive: true });

        window.addEventListener('resize', onWindowResize);

        // THEME SYNC: Dynamically update GPU uniforms when the theme changes
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                // Wait 50ms to ensure app.js has already toggled the 'theme-e-ink' class on the body
                setTimeout(() => {
                    if (particles) {
                        const isEInk = document.body.classList.contains('theme-e-ink');
                        const newColor = isEInk ? '#9c4221' : '#c3fffc';
                        
                        // Push the new color directly to the GPU
                        particles.material.uniforms.uColorBase.value.set(newColor);
                        particles.material.uniforms.uColorHover.value.set(newColor);
                    }
                }, 50);
            });
        }

        loadImageData();
    }

    /*
    ========================================
    CNN TEXTURE MAPPING
    ========================================
    */
    function loadImageData() {
        const img = new Image();
        img.src = 'assets/images/bnw.png'; 

        img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
            
            const scale = Math.min((window.innerHeight * 1.1) / img.height, (window.innerWidth * 0.70) / img.width);
            const drawWidth = img.width * scale;
            const drawHeight = img.height * scale;
            
            tempCanvas.width = window.innerWidth;
            tempCanvas.height = window.innerHeight;

            const startX = window.innerWidth * 0.58; 
            const startY = ((window.innerHeight - drawHeight) / 2) - (window.innerHeight * 0.10);

            ctx.drawImage(img, startX, startY, drawWidth, drawHeight);
            const imgData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

            createParticles(imgData, tempCanvas.width, tempCanvas.height);
        };
    }

    function createParticles(imgData, width, height) {
        if (particles) {
            scene.remove(particles);
            particles.geometry.dispose();
            particles.material.dispose();
        }

        const positions = [];
        const scatters = [];
        const chaosPositions = [];
        const colors = [];
        const baseAlphas = [];
        
        const step = 3; 

        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const index = (y * width + x) * 4;
                const r = imgData[index]; 

                // SMART DATA MASK:
                // Only generate particles if the pixel is NOT pure black background.
                // This completely removes the floating box on the left side of the screen.
                if (r > 8) {
                    const pX = x - width / 2;
                    const pY = -(y - height / 2);

                    positions.push(pX, pY, 0);

                    // Add organic scatter for the abstract "outside kernel" state
                    scatters.push((Math.random() - 0.5) * 3.0, (Math.random() - 0.5) * 3.0, 0);

                    // Scroll dispersion targets
                    const cX = (Math.random() - 0.5) * width;
                    const cY = (Math.random() - 0.5) * height * 1.5 + (height * 0.25);
                    chaosPositions.push(cX, cY, (Math.random() - 0.5) * 500); 

                    // Store the photorealistic color
                    colors.push(r / 255.0, r / 255.0, r / 255.0);

                    // Outside the kernel, keep the image abstract and sparse
                    baseAlphas.push(r > 40 ? (r / 255.0) * 1.0 : 0.0);
                }
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('aScatter', new THREE.Float32BufferAttribute(scatters, 3));
        geometry.setAttribute('aChaos', new THREE.Float32BufferAttribute(chaosPositions, 3));
        geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('aBaseAlpha', new THREE.Float32BufferAttribute(baseAlphas, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uMouse: { value: new THREE.Vector2(-1000, -1000) },
                uScroll: { value: 0.0 },
                uColorBase: { value: new THREE.Color(document.body.classList.contains('theme-e-ink') ? '#9c4221' : '#c3fffc') },
                uColorHover: { value: new THREE.Color(document.body.classList.contains('theme-e-ink') ? '#9c4221' : '#c3fffc') },
                uKernelSize: { value: 60.0 } // Smaller, focused convolution window
            },
            vertexShader: vertexShader(),
            fragmentShader: fragmentShader(),
            transparent: true,
            depthWrite: false
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);
        
        animate();
    }

    /*
    ========================================
    GLSL SHADERS (Chebyshev Kernel)
    ========================================
    */
    function vertexShader() {
        return `
            uniform vec2 uMouse;
            uniform float uScroll;
            uniform float uKernelSize;
            uniform vec3 uColorBase;
            
            attribute vec3 aScatter;
            attribute vec3 aChaos;
            attribute vec3 aColor;
            attribute float aBaseAlpha;
            
            varying vec3 vColor;
            varying float vAlpha;
            varying float vIsEdge;

            void main() {
                // CNN Kernel uses Chebyshev distance to create a perfect square window
                float dx = abs(position.x - uMouse.x);
                float dy = abs(position.y - uMouse.y);
                float dist = max(dx, dy);

                // binary mask: 1.0 if inside the square, 0.0 if outside
                float inside = step(dist, uKernelSize); 
                
                // Disable the kernel effect if the user is scrolling away
                inside *= (1.0 - step(0.1, uScroll));
                
                // Calculate the 3px cyan glowing border of the kernel window
                float edge = step(uKernelSize - 3.0, dist) * inside; 
                vIsEdge = edge;

                // POSITION LOGIC
                vec3 basePos = position;
                basePos += aScatter; // Apply vector scatter
                
                // If inside the kernel, snap perfectly to the exact image grid
                vec3 targetPos = mix(basePos, position, inside);
                
                // Apply scroll dispersion
                targetPos = mix(targetPos, aChaos, uScroll);

                vec4 mvPosition = modelViewMatrix * vec4(targetPos, 1.0);
                
                // SIZE LOGIC
                gl_PointSize = mix(1.5, 3.0, inside);

                // COLOR & ALPHA LOGIC
                vColor = mix(uColorBase, aColor, inside);
                vAlpha = mix(aBaseAlpha, 1.0, inside);

                // PERFORMANCE OPTIMIZATION
                if (inside == 0.0 && aBaseAlpha == 0.0) {
                    gl_PointSize = 0.0;
                }

                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    function fragmentShader() {
        return `
            uniform vec3 uColorHover;

            varying vec3 vColor;
            varying float vAlpha;
            varying float vIsEdge;

            void main() {
                if (vAlpha <= 0.0) discard;

                // Apply the cyan glow to the kernel's bounding box
                vec3 finalColor = mix(vColor, uColorHover, vIsEdge);
                float finalAlpha = mix(vAlpha, 1.0, vIsEdge);

                // Soft point rendering
                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                float r = dot(cxy, cxy);
                if (r > 1.0) discard;

                gl_FragColor = vec4(finalColor, finalAlpha);
            }
        `;
    }

    function animate() {
        requestAnimationFrame(animate);

        scrollProgress += (targetScrollProgress - scrollProgress) * 0.1;

        if (targetScrollProgress > 0.9 && scrollProgress > 0.89) {
            if (container.style.display !== 'none') {
                container.style.display = 'none';
            }
            return; 
        } else {
            if (container.style.display === 'none') {
                container.style.display = 'block';
            }
        }

        if (particles) {
            particles.material.uniforms.uScroll.value = scrollProgress;
            particles.material.uniforms.uMouse.value.x += (mouseX - particles.material.uniforms.uMouse.value.x) * 0.15;
            particles.material.uniforms.uMouse.value.y += (mouseY - particles.material.uniforms.uMouse.value.y) * 0.15;
        }

        renderer.render(scene, camera);
    }

    let resizeTimer;
    function onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.left = width / -2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = height / -2;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(loadImageData, 200);
    }

    initWebGL();
})();