document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('starfield');
    // Exit if canvas wasn't found (safeguard)
    if (!canvas) return; 
    
    const ctx = canvas.getContext('2d');
    let stars = [];
    const numStars = 200; // Total number of stars
    const baseColor = "#0A0A0A"; // The deep space background color

    // Function to set canvas size to match viewport
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Star class definition
    class Star {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 1.5 + 0.5; // Star size: 0.5px to 2px
            this.alpha = Math.random(); // Initial brightness (0.0 to 1.0)
            this.twinkleSpeed = Math.random() * 0.02 + 0.01; // How fast it twinkles
            this.direction = Math.random() > 0.5 ? 1 : -1; // Random starting direction
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.fill();
        }

        update() {
            // Reverse direction if hitting min/max brightness
            if (this.alpha > 1 || this.alpha < 0) {
                this.direction *= -1;
            }
            this.alpha += this.twinkleSpeed * this.direction;
        }
    }

    function init() {
        resizeCanvas();
        for (let i = 0; i < numStars; i++) {
            stars.push(new Star());
        }
        animate(); // Start the loop
    }

    function animate() {
        requestAnimationFrame(animate);
        
        // 1. Clear the canvas with the base background color
        ctx.fillStyle = baseColor; 
        ctx.fillRect(0, 0, canvas.width, canvas.height); 

        // 2. Update and draw all stars
        stars.forEach(star => {
            star.update();
            star.draw();
        });
    }

    

    // Event listener for screen resizing to keep stars fullscreen
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize the starfield
    init();
});