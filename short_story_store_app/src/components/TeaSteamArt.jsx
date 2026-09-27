import { useEffect, useRef } from 'react';

const sky = '#5fb0e0';
const skyDeep = '#2f8fcf';
const butter = '#ffe29a';
const pink = '#ffc2d4';
const pinkDeep = '#ef7fa8';

const particleColors = [
  'rgba(95, 176, 224, ',
  'rgba(255, 226, 154, ',
  'rgba(255, 194, 212, ',
  'rgba(255, 255, 255, ',
];

const STEAM_PATH = [
  'M 310,270',
  'C 305,250 280,240 270,220',
  'C 255,190 285,160 320,165',
  'C 360,170 380,210 340,230',
  'C 300,250 240,210 250,160',
  'C 260,110 330,110 350,80',
  'C 370,50 320,30 295,45',
  'C 280,55 275,70 290,80',
  'C 310,95 345,75 360,40',
].join(' ');

export default function TeaSteamArt() {
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const strokePathRef = useRef(null);
  const glowPathRef = useRef(null);
  const leadingGlowRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const strokePath = strokePathRef.current;
    const glowPath = glowPathRef.current;
    const leadingGlow = leadingGlowRef.current;

    let destroyed = false;
    let rafId = null;
    let loopTimeout = null;
    let pathLength = 0;
    let progress = 0;
    let holding = false;
    let lastTimestamp = null;
    let particles = [];
    const riseDuration = 6000;
    const particleEmitRate = 0.72;
    const visiblePaths = [strokePath, glowPath];

    function resizeCanvas() {
      const rect = card.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    function updateOffset(p) {
      const offset = pathLength - p * pathLength;
      visiblePaths.forEach((el) => {
        el.style.strokeDashoffset = offset;
      });
    }

    function setupPath() {
      visiblePaths.forEach((p) => p.setAttribute('d', STEAM_PATH));
      pathLength = strokePath.getTotalLength();
      visiblePaths.forEach((p) => {
        p.style.strokeDasharray = `${pathLength} ${pathLength}`;
      });
      updateOffset(0);
    }

    class SoftParticle {
      constructor(x, y, tangentX, tangentY, sizeScale = 1) {
        const side = Math.random() < 0.5 ? -1 : 1;

        const outward = Math.random() * 0.18 + 0.05;
        const tangent = Math.random() * 0.16 + 0.06;
        const angle = Math.random() * Math.PI * 2;
        const birthSpread = Math.random() * 0.8;

        this.x = x + Math.cos(angle) * birthSpread;
        this.y = y + Math.sin(angle) * birthSpread;

        this.vx =
          tangentX * tangent +
          (-tangentY) * side * outward;

        this.vy =
          tangentY * tangent +
          tangentX * side * outward;

        this.wobblePhase = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.03 + 0.012;
        this.swirl = Math.random() * 0.004 + 0.0015;

        // Particle size now depends on where we are along the steam.
        const baseSize =
          Math.random() < 0.6
            ? Math.random() * 3.5 + 2.5
            : Math.random() * 1.8 + 1.4;

        this.size = baseSize * sizeScale;

        this.maxLife = Math.random() * 105 + 120;
        this.life = this.maxLife;

        this.maxOpacity = Math.random() * 0.5 + 0.3;

        this.colorBase =
          particleColors[Math.floor(Math.random() * particleColors.length)];
      }
      update() {
        const aged = 1 - this.life / this.maxLife; // 0 at birth, 1 near death
        const spread = 1 + aged * 0.28;
        this.wobblePhase += this.wobbleSpeed;

        // A small rotational force makes each particle peel away from the steam
        // instead of looking like a second straight line beside it.
        const swirlX = Math.cos(this.wobblePhase) * this.swirl * spread;
        const swirlY = Math.sin(this.wobblePhase) * this.swirl * spread;
        this.x += this.vx * spread + swirlX;
        this.y += this.vy * spread + swirlY;

        this.vx *= 1.0015;
        this.vy *= 0.9985;
        this.life--;
      }

      draw(context) {
        const lifeRatio = this.life / this.maxLife;
        const opacity = Math.sin(lifeRatio * Math.PI) * this.maxOpacity;

        context.save();
        context.globalCompositeOperation = 'screen';

        const halo = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.2);
        halo.addColorStop(0, this.colorBase + opacity * 0.45 + ')');
        halo.addColorStop(1, this.colorBase + '0)');
        context.beginPath();
        context.arc(this.x, this.y, this.size * 2.2, 0, Math.PI * 2);
        context.fillStyle = halo;
        context.fill();

        const core = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        core.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.95})`);
        core.addColorStop(0.55, this.colorBase + opacity * 0.85 + ')');
        core.addColorStop(1, this.colorBase + opacity * 0.1 + ')');
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = core;
        context.fill();

        context.restore();
      }
    }

    function toCanvasPoint(point) {
      return {
        x: point.x * (canvas.width / 620),
        y: point.y * (canvas.height / 480),
      };
    }

    function emitFromSteamHead(currentDist, delta) {
      if (pathLength <= 0 || currentDist <= 0) return;

      const point = strokePath.getPointAtLength(currentDist);
      const before = strokePath.getPointAtLength(
        Math.max(0, currentDist - 5)
      );

      const head = toCanvasPoint(point);
      const previous = toCanvasPoint(before);

      const dx = head.x - previous.x;
      const dy = head.y - previous.y;
      const length = Math.hypot(dx, dy) || 1;

      const tangentX = dx / length;
      const tangentY = dy / length;

      // 0 = bottom of steam
      // 1 = very tip of steam
      const steamProgress = currentDist / pathLength;

      /*
      * Gradually reduce particle emission toward the tip.
      *
      * Bottom: ~100%
      * Middle: ~55%
      * Tip: ~15%
      *
      * The small minimum keeps the tip from looking completely dead.
      */
      const emissionMultiplier =
        0.08 + 0.92 * Math.pow(1 - steamProgress, 2.2);

      const expected =
        (delta / 16.67) *
        particleEmitRate *
        emissionMultiplier;

      const count =
        Math.floor(expected) +
        (Math.random() < expected % 1 ? 1 : 0);

      /*
      * Particle size also decreases toward the tip.
      *
      * Bottom: 100%
      * Tip: ~35%
      */
      const sizeScale =
        0.35 + 0.65 * Math.pow(1 - steamProgress, 1.1);

      for (let i = 0; i < count; i++) {
        particles.push(
          new SoftParticle(
            head.x,
            head.y,
            tangentX,
            tangentY,
            sizeScale
          )
        );
      }
    }

    function resetLoop() {
      progress = 0;
      holding = false;
      lastTimestamp = null;
      updateOffset(0);
      leadingGlow.setAttribute('opacity', '1');
    }

    function animate(timestamp) {
      if (destroyed) return;
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!holding) {
        progress += delta / riseDuration;
        if (progress >= 1) {
          progress = 1;
          holding = true;
          leadingGlow.setAttribute('opacity', '0');
          updateOffset(progress);
          loopTimeout = setTimeout(() => {
            if (!destroyed) resetLoop();
          }, 1400);
        } else {
          updateOffset(progress);
        }

        const currentDist = progress * pathLength;
        if (!holding) {
          leadingGlow.setAttribute('opacity', '1');
          const pt = strokePath.getPointAtLength(currentDist);
          leadingGlow.setAttribute('cx', pt.x);
          leadingGlow.setAttribute('cy', pt.y);
        }
        emitFromSteamHead(currentDist, delta);
      } else {
        // No new particles are created while the steam is holding at the top.
        // Existing particles finish their slow, natural dispersion before the loop resets.
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) particles.splice(i, 1);
      }

      rafId = requestAnimationFrame(animate);
    }

    resizeCanvas();
    setupPath();
    window.addEventListener('resize', resizeCanvas);
    rafId = requestAnimationFrame(animate);

    return () => {
      destroyed = true;
      window.removeEventListener('resize', resizeCanvas);
      if (rafId) cancelAnimationFrame(rafId);
      if (loopTimeout) clearTimeout(loopTimeout);
    };
  }, []);

  return (
    <div className="tea-art-card glass" ref={cardRef} aria-hidden="true">
      <svg viewBox="0 0 620 480" className="tea-art-svg">
        <defs>
          <linearGradient id="steamGradLoose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={sky} />
            <stop offset="45%" stopColor={butter} />
            <stop offset="100%" stopColor={pink} />
          </linearGradient>
          <linearGradient id="cupGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
            <stop offset="50%" stopColor="rgba(240,248,255,0.5)" />
            <stop offset="100%" stopColor="rgba(214,239,250,0.7)" />
          </linearGradient>
          <linearGradient id="teaWarmthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(245,185,63,0.55)" />
            <stop offset="50%" stopColor="rgba(239,127,168,0.45)" />
            <stop offset="100%" stopColor="rgba(47,143,207,0.35)" />
          </linearGradient>
          <filter id="teaSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="teaSaucerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
          </filter>
          <radialGradient id="teaTipGlowGrad">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor={pinkDeep} stopOpacity="0.6" />
            <stop offset="100%" stopColor={skyDeep} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g>
          <ellipse cx="310" cy="405" rx="145" ry="20" fill="rgba(239,127,168,0.22)" filter="url(#teaSaucerGlow)" />
          <ellipse cx="310" cy="400" rx="135" ry="18" fill="url(#cupGlassGrad)" stroke="rgba(255,255,255,0.95)" strokeWidth="2" />
          <ellipse cx="310" cy="398" rx="100" ry="12" fill="rgba(255,255,255,0.4)" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />

          <path d="M 385 295 C 435 295, 440 370, 375 375" fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="11" strokeLinecap="round" />
          <path d="M 385 295 C 435 295, 440 370, 375 375" fill="none" stroke="url(#cupGlassGrad)" strokeWidth="7" strokeLinecap="round" />

          <path d="M 230 280 C 230 380, 250 395, 310 395 C 370 395, 390 380, 390 280 Z" fill="url(#cupGlassGrad)" stroke="rgba(255,255,255,0.95)" strokeWidth="2" />
          <path d="M 238 290 C 242 370, 258 385, 310 385 C 362 385, 378 370, 382 290 Z" fill="url(#teaWarmthGrad)" opacity="0.85" />

          <ellipse cx="310" cy="280" rx="80" ry="15" fill="rgba(255,255,255,0.65)" stroke="rgba(255,255,255,0.98)" strokeWidth="2.2" />
          <ellipse cx="310" cy="280" rx="72" ry="11" fill="rgba(255,226,154,0.35)" />

          <path d="M 245 298 C 248 340, 258 375, 280 385" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3.5" strokeLinecap="round" />
        </g>

        <path ref={glowPathRef} fill="none" stroke="url(#steamGradLoose)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" filter="url(#teaSoftGlow)" />
        <path ref={strokePathRef} fill="none" stroke="url(#steamGradLoose)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />

        <circle ref={leadingGlowRef} cx="310" cy="270" r="11" fill="url(#teaTipGlowGrad)" opacity="0" />
      </svg>
      <canvas ref={canvasRef} className="tea-art-canvas" />
    </div>
  );
}
