/**
 * VERVE AR Rendering Engine
 * Handles Canvas rendering, dynamic clothing transformation, EMA smoothing, and landmark visualization.
 */

// Garment Image Cache
const imageCache = new Map();

/**
 * Preloads a garment image and caches it.
 * @param {string} url 
 * @returns {Promise<HTMLImageElement>}
 */
export function preloadGarmentImage(url) {
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url));
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

/**
 * Exponential Moving Average (EMA) filter to eliminate webcam tracking jitter.
 */
export class TorsoSmoother {
  constructor(alpha = 0.32) {
    this.alpha = alpha;
    this.state = null;
  }

  update(raw) {
    if (!raw) return null;
    if (!this.state) {
      this.state = {
        centerX: raw.shoulderCenter.x,
        centerY: raw.shoulderCenter.y,
        shoulderWidth: raw.shoulderWidth,
        shoulderAngle: raw.shoulderAngle,
        torsoHeight: raw.torsoHeight,
        yawAngle: raw.yawAngle || 0,
        confidence: raw.confidence || 0.8
      };
      return this.state;
    }

    const a = this.alpha;
    this.state.centerX = this.state.centerX * (1 - a) + raw.shoulderCenter.x * a;
    this.state.centerY = this.state.centerY * (1 - a) + raw.shoulderCenter.y * a;
    this.state.shoulderWidth = this.state.shoulderWidth * (1 - a) + raw.shoulderWidth * a;
    
    // Smooth angle handling circular wrapping if needed
    let angleDiff = raw.shoulderAngle - this.state.shoulderAngle;
    if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    this.state.shoulderAngle += angleDiff * a;

    this.state.torsoHeight = this.state.torsoHeight * (1 - a) + raw.torsoHeight * a;
    this.state.yawAngle = this.state.yawAngle * (1 - a) + (raw.yawAngle || 0) * a;
    this.state.confidence = raw.confidence;

    return this.state;
  }

  reset() {
    this.state = null;
  }
}

/**
 * Renders the virtual garment onto a Canvas context aligned to the detected torso.
 * @param {CanvasRenderingContext2D} ctx 
 * @param {HTMLImageElement} garmentImg 
 * @param {Object} garmentData 
 * @param {Object} torso 
 * @param {Object} options 
 */
export function renderVirtualGarment(ctx, garmentImg, garmentData, torso, options = {}) {
  if (!ctx || !garmentImg || !torso) return;

  const {
    scaleMultiplier = 1.0,
    verticalOffset = 0,
    opacity = 1.0,
    showSkeleton = false,
    mirror = false
  } = options;

  const anchor = garmentData.anchor || {
    shoulderSpanRatio: 0.62,
    shoulderYRatio: 0.171,
    collarOffsetY: 0.171,
    aspectRatio: 1.0,
    scaleMultiplier: 1.02,
    verticalAdjustment: -0.02
  };

  // 1. Calculate dimensions
  // Target width calibrated so the garment shoulder seam matches the human shoulder width
  const spanRatio = anchor.shoulderSpanRatio || 0.62;
  const baseScale = (anchor.scaleMultiplier || 1.02) * scaleMultiplier;
  const targetWidth = (torso.shoulderWidth / spanRatio) * baseScale;
  const currentAspect = (garmentImg && garmentImg.naturalWidth && garmentImg.naturalHeight)
    ? (garmentImg.naturalWidth / garmentImg.naturalHeight)
    : (anchor.aspectRatio || 1.0);
  const targetHeight = targetWidth / currentAspect;

  // 2. Position calculations:
  // Center point on user's shoulder line (midpoint between left and right acromion joints)
  const cx = torso.centerX || torso.shoulderCenter.x;
  const vertAdjustment = torso.torsoHeight * (anchor.verticalAdjustment || 0);
  const cy = (torso.centerY || torso.shoulderCenter.y) + verticalOffset + vertAdjustment;
  const angle = torso.shoulderAngle || 0;
  const yaw = torso.yawAngle || 0;

  ctx.save();

  // Draw Skeleton Landmarks if enabled
  if (showSkeleton && torso.rawLandmarks) {
    drawLandmarksOverlay(ctx, torso, mirror);
  }

  // Set opacity and blending
  ctx.globalAlpha = Math.max(0.1, Math.min(1.0, opacity));
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Apply subtle 3D torso yaw foreshortening
  if (Math.abs(yaw) > 0.05) {
    ctx.scale(1 - Math.abs(yaw) * 0.15, 1);
  }

  // Draw natural ambient drop shadow behind shirt for realistic depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;

  // The garment's shoulder seam is located at (targetHeight * shoulderAnchorY).
  // By drawing from y = -targetHeight * shoulderAnchorY, the shoulder seam lands precisely at y = 0 (which is cy)!
  const shoulderAnchorY = anchor.shoulderYRatio || anchor.collarOffsetY || 0.171;
  const drawX = -targetWidth * 0.5;
  const drawY = -targetHeight * shoulderAnchorY;

  ctx.drawImage(garmentImg, drawX, drawY, targetWidth, targetHeight);

  // Subtle fabric ambient illumination overlay
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Neck crease soft shadow gradient for realistic collar depth
  const neckGrad = ctx.createLinearGradient(0, drawY + (targetHeight * 0.08), 0, drawY + (targetHeight * 0.18));
  neckGrad.addColorStop(0, 'rgba(0, 0, 0, 0.22)');
  neckGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.ellipse(0, drawY + (targetHeight * 0.13), targetWidth * 0.16, targetHeight * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws body pose landmark points and connecting lines.
 */
function drawLandmarksOverlay(ctx, torso, mirror) {
  if (!torso) return;

  ctx.save();
  ctx.lineWidth = 2.5;

  const left = torso.screenLeftShoulder;
  const right = torso.screenRightShoulder;

  // Shoulder line
  ctx.strokeStyle = '#00f3ff';
  ctx.beginPath();
  ctx.moveTo(left.x, left.y);
  ctx.lineTo(right.x, right.y);
  ctx.stroke();

  // Draw Points
  const drawPoint = (p, color, label) => {
    if (!p) return;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (label) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(label, p.x + 8, p.y - 4);
    }
  };

  drawPoint(left, '#00f3ff', 'L-Shoulder');
  drawPoint(right, '#00f3ff', 'R-Shoulder');
  drawPoint(torso.shoulderCenter, '#ff007f', 'Shoulder Center');

  if (torso.hipCenter) {
    drawPoint(torso.hipCenter, '#ffe600', 'Hip Mid');
    ctx.strokeStyle = 'rgba(255, 230, 0, 0.6)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(torso.shoulderCenter.x, torso.shoulderCenter.y);
    ctx.lineTo(torso.hipCenter.x, torso.hipCenter.y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Captures the current canvas as a high-resolution snapshot with studio branding.
 * @param {HTMLCanvasElement} canvas 
 * @param {string} garmentName 
 * @returns {string} Data URL
 */
export function captureStudioSnapshot(canvas, garmentName = '') {
  // Create an offscreen canvas to stamp branding
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const eCtx = exportCanvas.getContext('2d');

  // Copy main canvas
  eCtx.drawImage(canvas, 0, 0);

  // Fashion studio watermark overlay
  eCtx.save();
  const padding = 28;
  const bottom = canvas.height - padding;

  // Semi-transparent badge plate
  eCtx.fillStyle = 'rgba(10, 11, 15, 0.75)';
  eCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  eCtx.lineWidth = 1;
  const badgeW = 280;
  const badgeH = 50;
  eCtx.beginPath();
  eCtx.roundRect(padding, bottom - badgeH, badgeW, badgeH, 8);
  eCtx.fill();
  eCtx.stroke();

  // Studio text
  eCtx.fillStyle = '#ffffff';
  eCtx.font = '700 13px Outfit, sans-serif';
  eCtx.letterSpacing = '2px';
  eCtx.fillText('VERVE AR STUDIO', padding + 16, bottom - 28);

  eCtx.fillStyle = '#94a3b8';
  eCtx.font = '400 10px JetBrains Mono, monospace';
  eCtx.fillText(`ITEM: ${garmentName.toUpperCase().slice(0, 24)}`, padding + 16, bottom - 12);

  // Timestamp
  const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  eCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  eCtx.font = '500 10px JetBrains Mono, monospace';
  eCtx.textAlign = 'right';
  eCtx.fillText(now, canvas.width - padding, canvas.height - padding);

  eCtx.restore();

  return exportCanvas.toDataURL('image/png', 0.95);
}
