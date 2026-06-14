"use client";

import React, { useEffect, useRef } from "react";

export function ParticleNetwork() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let particles: Particle[] = [];
        const particleCount = Math.floor((width * height) / 12000); // Amount of dust particles
        let animationFrameId: number;

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            baseOpacity: number;
            blur: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                // Move slowly upwards and slightly horizontally
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = -(Math.random() * 0.3 + 0.1); 
                
                // Varied sizes for depth of field
                const z = Math.random();
                if (z > 0.8) {
                    this.radius = Math.random() * 4 + 3; // Large
                    this.blur = Math.random() * 4 + 2;
                    this.baseOpacity = Math.random() * 0.15 + 0.05;
                } else if (z > 0.4) {
                    this.radius = Math.random() * 2 + 1.5; // Medium
                    this.blur = Math.random() * 2 + 1;
                    this.baseOpacity = Math.random() * 0.3 + 0.1;
                } else {
                    this.radius = Math.random() * 1 + 0.5; // Small
                    this.blur = 0;
                    this.baseOpacity = Math.random() * 0.5 + 0.2;
                }
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Wrap around when floating off screen
                if (this.x < -50) this.x = width + 50;
                if (this.x > width + 50) this.x = -50;
                if (this.y < -50) {
                    this.y = height + 50;
                    this.x = Math.random() * width;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                
                if (this.blur > 0) {
                    ctx.shadowBlur = this.blur;
                    ctx.shadowColor = `rgba(255, 255, 255, ${this.baseOpacity})`;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.fillStyle = `rgba(255, 255, 255, ${this.baseOpacity})`;
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-80 mix-blend-screen"
        />
    );
}
