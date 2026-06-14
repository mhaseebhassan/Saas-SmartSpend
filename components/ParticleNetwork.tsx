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
        const particleCount = Math.floor((width * height) / 8000); // Dense starfield
        let animationFrameId: number;

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            baseOpacity: number;
            twinkleSpeed: number;
            twinklePhase: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                // Very slow drift
                this.vx = (Math.random() - 0.5) * 0.1;
                this.vy = -(Math.random() * 0.1 + 0.05); 
                
                // Microscopic sizes
                this.radius = Math.random() * 0.8 + 0.2; // 0.2px to 1px
                
                // Opacity and twinkling
                this.baseOpacity = Math.random() * 0.5 + 0.1;
                this.twinkleSpeed = Math.random() * 0.02 + 0.005;
                this.twinklePhase = Math.random() * Math.PI * 2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.twinklePhase += this.twinkleSpeed;

                // Wrap around when floating off screen
                if (this.x < -10) this.x = width + 10;
                if (this.x > width + 10) this.x = -10;
                if (this.y < -10) {
                    this.y = height + 10;
                    this.x = Math.random() * width;
                }
            }

            draw() {
                if (!ctx) return;
                
                // Calculate pulsing opacity (twinkle effect)
                const currentOpacity = this.baseOpacity + Math.sin(this.twinklePhase) * 0.3;
                // Clamp opacity between 0.05 and 0.8
                const finalOpacity = Math.max(0.05, Math.min(0.8, currentOpacity));

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                
                // Very subtle glow on larger stars
                if (this.radius > 0.6 && finalOpacity > 0.5) {
                    ctx.shadowBlur = 3;
                    ctx.shadowColor = `rgba(255, 255, 255, ${finalOpacity})`;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
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
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-100 mix-blend-screen"
        />
    );
}
