import { Project, Slide } from '../types';
import { calculateMotion } from './motionUtils';
import { getIconSvgDataUri } from './iconRegistry';
import { resolveSlideWatermark } from './watermarkResolver';

/**
 * Splits text on explicit newlines and wraps words within maxWidth using Canvas 2D metrics.
 */
function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const candidate = currentLine ? `${currentLine} ${words[i]}` : words[i];
      if (ctx.measureText(candidate).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = candidate;
      }
    }
    if (currentLine || paragraphs.length > 1) {
      lines.push(currentLine);
    }
  }

  return lines.length > 0 ? lines : [''];
}

function getOrLoadIconImage(
  iconName: string,
  color: string,
  size: number,
  strokeWidth: number,
  imageCache?: Map<string, HTMLImageElement>
): HTMLImageElement {
  const cacheKey = `icon-${iconName}-${color}-${size}-${strokeWidth}`;
  let iconImg = imageCache?.get(cacheKey);
  if (!iconImg) {
    iconImg = new Image();
    iconImg.src = getIconSvgDataUri(iconName, color, size, strokeWidth);
    imageCache?.set(cacheKey, iconImg);
  }
  return iconImg;
}

function drawTintedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  tintColor?: string
) {
  if (!tintColor) {
    ctx.drawImage(img, x, y, w, h);
    return;
  }
  try {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = Math.max(1, Math.ceil(w));
    offCanvas.height = Math.max(1, Math.ceil(h));
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) {
      ctx.drawImage(img, x, y, w, h);
      return;
    }
    offCtx.drawImage(img, 0, 0, w, h);
    offCtx.globalCompositeOperation = 'source-in';
    offCtx.fillStyle = tintColor;
    offCtx.fillRect(0, 0, w, h);
    ctx.drawImage(offCanvas, x, y);
  } catch (_) {
    ctx.drawImage(img, x, y, w, h);
  }
}

export function renderSlideToCanvas(
  ctx: CanvasRenderingContext2D,
  slide: Slide,
  slideLocalTime: number,
  watermark: Project['watermark'],
  imageCache?: Map<string, HTMLImageElement>,
  targetWidth = 1920,
  targetHeight = 1080,
  logicalWidth = 1920,
  logicalHeight = 1080
) {
  const width = logicalWidth;
  const height = logicalHeight;

  ctx.save();
  ctx.clearRect(0, 0, targetWidth, targetHeight);

  // Uniformly scale from the project's logical design dimensions (e.g. 1080x1080, 1080x1350, 1080x1920, 1920x1080)
  // to the output pixel resolution (e.g. 1080p or 720p) without aspect ratio distortion.
  if (targetWidth !== width || targetHeight !== height) {
    ctx.scale(targetWidth / width, targetHeight / height);
  }

  // 1. Draw Background
  if (slide.background.type === 'gradient' && slide.background.color2) {
    const angle = ((slide.background.gradientAngle || 135) * Math.PI) / 180;
    const x2 = Math.abs(width * Math.cos(angle)) || width;
    const y2 = Math.abs(height * Math.sin(angle)) || height;
    const grad = ctx.createLinearGradient(0, 0, x2, y2);
    grad.addColorStop(0, slide.background.color1 || '#ffffff');
    grad.addColorStop(1, slide.background.color2 || '#fdf2f8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (slide.background.type === 'image' && slide.background.imageUrl) {
    const bgImg = imageCache?.get(slide.background.imageUrl);
    if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
      // Match CSS backgroundSize: 'cover', backgroundPosition: 'center'
      const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
      const canvasAspect = width / height;
      let drawW = width;
      let drawH = height;
      let drawX = 0;
      let drawY = 0;
      if (imgAspect > canvasAspect) {
        drawH = height;
        drawW = height * imgAspect;
        drawX = (width - drawW) / 2;
      } else {
        drawW = width;
        drawH = width / imgAspect;
        drawY = (height - drawH) / 2;
      }
      ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = slide.background.color1 || '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    ctx.fillStyle = slide.background.color1 || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Render each element with unified motion engine
  for (const element of slide.elements) {
    const motion = calculateMotion(
      element.content,
      element.animation,
      slideLocalTime,
      slide.duration
    );

    if (!motion.isVisible) continue;

    ctx.save();
    ctx.globalAlpha = motion.opacity;

    const posX = (element.x / 100) * width;
    const posY = (element.y / 100) * height + motion.offsetY;

    ctx.translate(posX, posY);
    if (motion.scale !== 1) {
      ctx.scale(Math.max(0, motion.scale), Math.max(0, motion.scale));
    }
    if (element.rotation) {
      ctx.rotate((element.rotation * Math.PI) / 180);
    }

    // Draw element content based on type
    if (element.type === 'title' || element.type === 'subtitle' || element.type === 'paragraph') {
      const fontSize = element.fontSize || (element.type === 'title' ? 72 : 36);
      const defaultWeight = element.type === 'title' ? '800' : element.type === 'paragraph' ? '500' : '400';
      const fontWeight = element.fontWeight || defaultWeight;
      const align = (element.textAlign as CanvasTextAlign) || 'center';
      ctx.font = `${fontWeight} ${fontSize}px 'YekanBakhFaNum', 'Vazirmatn', sans-serif`;
      ctx.fillStyle = element.color || '#0f172a';
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';

      const lineMult = element.type === 'title' ? 1.25 : element.type === 'subtitle' ? 1.4 : 1.8;
      const lineHeight = fontSize * lineMult;

      if (!element.nowrap) {
        // Match SlideElement.tsx maxWidth: '90%' when width is unspecified
        const maxWidth = ((element.width || 90) / 100) * width;
        const lines = wrapTextLines(ctx, motion.displayText, maxWidth);
        const totalH = lines.length * lineHeight;
        let startY = -(totalH / 2) + lineHeight / 2;

        // Match full-width textAlign anchor within explicit width box
        let anchorX = 0;
        if (element.width) {
          if (align === 'right') anchorX = maxWidth / 2;
          else if (align === 'left') anchorX = -maxWidth / 2;
        }

        for (const l of lines) {
          ctx.fillText(l.trim(), anchorX, startY);
          startY += lineHeight;
        }
      } else {
        ctx.fillText(motion.displayText, 0, 0);
      }
    } else if (element.type === 'list-box') {
      const boxW = ((element.width || 68) / 100) * width;
      const boxH = 68;
      const rightW = boxW * 0.4;
      const leftW = boxW - rightW;

      ctx.save();
      ctx.translate(-boxW / 2, -boxH / 2);

      // Clip outer rounded box cleanly
      ctx.beginPath();
      ctx.roundRect(0, 0, boxW, boxH, 8);
      ctx.clip();

      // White base
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, boxW, boxH);

      // Right magenta block (Persian text)
      ctx.fillStyle = element.backgroundColor || '#9d174d';
      ctx.fillRect(leftW, 0, rightW, boxH);

      // Outer border
      ctx.strokeStyle = 'rgba(157, 23, 77, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(0, 0, boxW, boxH, 8);
      ctx.stroke();

      // Text inside right block (Persian) — clipped & auto-fitted to rightW
      ctx.save();
      ctx.beginPath();
      ctx.rect(leftW, 0, rightW, boxH);
      ctx.clip();
      let faSize = 28;
      const faMaxW = Math.max(40, rightW - 24);
      while (faSize > 15) {
        ctx.font = `bold ${faSize}px 'YekanBakhFaNum', 'Vazirmatn', sans-serif`;
        if (ctx.measureText(motion.displayText).width <= faMaxW) break;
        faSize -= 1;
      }
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      ctx.fillText(motion.displayText, leftW + rightW / 2, boxH / 2);
      ctx.restore();

      // Text inside left block (English) — clipped & auto-fitted to leftW
      if (element.subcontent) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, leftW, boxH);
        ctx.clip();
        let enSize = 24;
        const enMaxW = Math.max(60, leftW - 40);
        while (enSize > 14) {
          ctx.font = `500 ${enSize}px 'YekanBakhFaNum', 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif`;
          if (ctx.measureText(element.subcontent).width <= enMaxW) break;
          enSize -= 1;
        }
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.direction = 'ltr';
        ctx.fillText(element.subcontent, 20, boxH / 2);
        ctx.restore();
      }

      ctx.restore();
    } else if (element.type === 'card') {
      const cardW = ((element.width || 76) / 100) * width;
      const padY = element.padding ?? 28;
      const padX = 36;
      const fontSize = element.fontSize || 28;
      const radius = element.borderRadius ?? 24;

      ctx.font = `${element.fontWeight || '600'} ${fontSize}px 'YekanBakhFaNum', 'Vazirmatn', sans-serif`;
      const iconGap = element.icon ? 76 : 0;
      const textMaxW = Math.max(80, cardW - padX * 2 - iconGap);
      const lines = wrapTextLines(ctx, motion.displayText, textMaxW);

      const lineHeight = fontSize * 1.7;
      const mainTextH = lines.length * lineHeight;

      const subFontSize = Math.max(16, Math.round(fontSize * 0.7));
      let subLines: string[] = [];
      let subTextH = 0;
      if (element.subcontent) {
        ctx.font = `500 ${subFontSize}px 'YekanBakhFaNum', 'Vazirmatn', sans-serif`;
        subLines = wrapTextLines(ctx, element.subcontent, textMaxW);
        subTextH = 6 + subLines.length * (subFontSize * 1.5);
      }

      const contentH = mainTextH + subTextH;
      const cardH = Math.max(90, contentH + padY * 2);

      ctx.save();
      ctx.translate(-cardW / 2, -cardH / 2);

      // Card Background
      ctx.fillStyle = element.backgroundColor || '#ffffff';
      ctx.beginPath();
      ctx.roundRect(0, 0, cardW, cardH, radius);
      ctx.fill();

      // Card Border
      ctx.strokeStyle = element.borderColor || '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Icon on Right (RTL start) if present
      let textStartX = cardW - padX;
      if (element.icon) {
        const iconSize = 30;
        const iconBoxSize = 56;
        const iconBoxX = cardW - padX - iconBoxSize;
        const iconBoxY = (cardH - iconBoxSize) / 2;

        ctx.fillStyle = element.color ? `${element.color}15` : 'rgba(107, 11, 69, 0.08)';
        ctx.beginPath();
        ctx.roundRect(iconBoxX, iconBoxY, iconBoxSize, iconBoxSize, 16);
        ctx.fill();

        const iconImg = getOrLoadIconImage(element.icon, element.color || '#6B0B45', iconSize, 2.5, imageCache);
        if (iconImg.complete && iconImg.naturalWidth > 0) {
          ctx.drawImage(
            iconImg,
            iconBoxX + (iconBoxSize - iconSize) / 2,
            iconBoxY + (iconBoxSize - iconSize) / 2,
            iconSize,
            iconSize
          );
        }

        textStartX = iconBoxX - 20;
      }

      // Draw Main Text lines
      ctx.fillStyle = element.color || '#1E293B';
      ctx.font = `${element.fontWeight || '600'} ${fontSize}px 'YekanBakhFaNum', 'Vazirmatn', sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';

      let startY = (cardH - contentH) / 2 + lineHeight / 2;
      for (const l of lines) {
        ctx.fillText(l.trim(), textStartX, startY);
        startY += lineHeight;
      }

      // Draw Subcontent lines if present
      if (subLines.length > 0) {
        const subLineH = subFontSize * 1.5;
        ctx.fillStyle = '#94A3B8';
        ctx.font = `500 ${subFontSize}px 'YekanBakhFaNum', 'Vazirmatn', sans-serif`;
        let subY = (cardH - contentH) / 2 + mainTextH + 6 + subLineH / 2;
        for (const sl of subLines) {
          ctx.fillText(sl.trim(), textStartX, subY);
          subY += subLineH;
        }
      }

      ctx.restore();
    } else if (element.type === 'badge') {
      const fontSize = element.fontSize || 20;
      ctx.font = `${element.fontWeight || '700'} ${fontSize}px 'YekanBakhFaNum', 'Vazirmatn', sans-serif`;

      const shouldShowBadgeNum = Boolean(
        element.badgeNumber &&
          !motion.displayText.includes(element.badgeNumber) &&
          !motion.displayText.startsWith('نکته')
      );
      const label = shouldShowBadgeNum ? `${element.badgeNumber} ${motion.displayText}` : motion.displayText;

      const iconSize = element.icon ? Math.round(fontSize * 0.9) : 0;
      const iconGap = element.icon ? 8 : 0;
      const textMetrics = ctx.measureText(label);
      const padX = 22;
      const padY = element.padding ? element.padding / 2 : 8;
      const badgeW = textMetrics.width + padX * 2 + iconSize + iconGap;
      const badgeH = fontSize + padY * 2;
      const radius = element.borderRadius ?? 999;

      ctx.save();
      ctx.translate(-badgeW / 2, -badgeH / 2);

      // Badge Background
      ctx.fillStyle = element.backgroundColor || '#FBF4F8';
      ctx.beginPath();
      ctx.roundRect(0, 0, badgeW, badgeH, radius);
      ctx.fill();

      // Badge Border
      ctx.strokeStyle = element.borderColor || '#EABAD7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Badge Icon (if any) on RTL right side
      if (element.icon) {
        const iconImg = getOrLoadIconImage(element.icon, element.color || '#6B0B45', iconSize, 2.5, imageCache);
        if (iconImg.complete && iconImg.naturalWidth > 0) {
          ctx.drawImage(iconImg, badgeW - padX - iconSize, (badgeH - iconSize) / 2, iconSize, iconSize);
        }
      }

      // Badge Text
      ctx.fillStyle = element.color || '#6B0B45';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      const textCenterX = element.icon ? (badgeW - iconSize - iconGap) / 2 : badgeW / 2;
      ctx.fillText(label, textCenterX, badgeH / 2 + 1);

      ctx.restore();
    } else if (element.type === 'image') {
      const img = imageCache?.get(element.content);
      if (img && img.complete && img.naturalWidth > 0) {
        let imgW = ((element.width ?? 35) / 100) * width;
        const aspect = img.naturalHeight / img.naturalWidth;
        let imgH = imgW * aspect;
        // Match max-h-[600px] object-contain from SlideElement.tsx
        if (imgH > 600) {
          imgH = 600;
          imgW = imgH / aspect;
        }

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-imgW / 2, -imgH / 2, imgW, imgH, 16);
        ctx.clip();
        ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
        ctx.restore();
      }
    } else if (element.type === 'icon') {
      const size = element.fontSize || 84;
      const strokeWidth = element.strokeWidth || 2;
      const color = element.color || '#6b0b45';
      const hasBg = Boolean(element.backgroundColor && element.backgroundColor !== 'transparent');
      const pad = element.padding ?? (hasBg ? 20 : 0);
      const totalW = size + pad * 2;
      const totalH = size + pad * 2;

      ctx.save();
      if (hasBg) {
        ctx.fillStyle = element.backgroundColor!;
        const radius = element.borderRadius !== undefined ? element.borderRadius : 999;
        ctx.beginPath();
        ctx.roundRect(-totalW / 2, -totalH / 2, totalW, totalH, radius);
        ctx.fill();

        if (element.borderColor) {
          ctx.strokeStyle = element.borderColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      const iconImg = getOrLoadIconImage(element.content || 'Sparkles', color, size, strokeWidth, imageCache);
      if (iconImg.complete && iconImg.naturalWidth > 0) {
        ctx.drawImage(iconImg, -size / 2, -size / 2, size, size);
      }
      ctx.restore();
    } else if (element.type === 'arrow' || (element.type === 'shape' && element.shapeKind !== 'divider')) {
      const color = element.color || '#6b0b45';
      const strokeWidth = element.strokeWidth || 6;
      const arrowW = ((element.width || 25) / 100) * width;
      const headW = Math.max(strokeWidth * 3.5, 22);
      const headH = Math.max(strokeWidth * 3, 20);

      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      const startX = -arrowW / 2;
      const endX = arrowW / 2 - headW + 2;

      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(endX, 0);
      ctx.stroke();

      const tipX = arrowW / 2;
      const baseX = arrowW / 2 - headW;

      ctx.beginPath();
      ctx.moveTo(baseX, -headH / 2);
      ctx.lineTo(tipX, 0);
      ctx.lineTo(baseX, headH / 2);
      ctx.closePath();
      ctx.fill();
    } else if (element.type === 'divider' || (element.type === 'shape' && element.shapeKind === 'divider')) {
      const color = element.color || '#6b0b45';
      const strokeWidth = element.strokeWidth || 3;
      const divW = ((element.width || 60) / 100) * width;

      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';

      if (element.backgroundColor === 'solid') {
        ctx.strokeStyle = color;
      } else {
        const grad = ctx.createLinearGradient(-divW / 2, 0, divW / 2, 0);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, color);
        grad.addColorStop(1, 'transparent');
        ctx.strokeStyle = grad;
      }

      ctx.beginPath();
      ctx.moveTo(-divW / 2, 0);
      ctx.lineTo(divW / 2, 0);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 4. Render Watermark with Smart Auto-Contrast and Per-Slide Override
  const wm = resolveSlideWatermark(watermark, slide);
  if (wm.visible) {
    ctx.save();
    ctx.globalAlpha = wm.opacity ?? 0.95;
    const pos = wm.position || 'bottom-center';
    const targetH = wm.size ? wm.size * 1.15 : 55;
    const marginY = 40; // bottom-10 / top-10 (40px)
    const marginX = 48; // right-12 / left-12 (48px)
    let wmX = width / 2;
    let wmY = height - marginY - targetH / 2;

    if (wm.type === 'text') {
      const text = wm.text || 'مافوق';
      ctx.font = `900 ${Math.round(targetH * 0.9)}px 'YekanBakhFaNum', 'Vazirmatn', sans-serif`;
      ctx.fillStyle = wm.color || '#6b0b45';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';

      if (pos === 'bottom-center') {
        wmX = width / 2;
        wmY = height - marginY - targetH / 2;
        ctx.textAlign = 'center';
      } else if (pos === 'bottom-right') {
        wmX = width - marginX;
        wmY = height - marginY - targetH / 2;
        ctx.textAlign = 'right';
      } else if (pos === 'bottom-left') {
        wmX = marginX;
        wmY = height - marginY - targetH / 2;
        ctx.textAlign = 'left';
      } else if (pos === 'top-right') {
        wmX = width - marginX;
        wmY = marginY + targetH / 2;
        ctx.textAlign = 'right';
      }
      ctx.fillText(text, wmX, wmY);
    } else {
      const logoUrl = wm.imageUrl || '/mafogh-logo-brand.svg';
      const logoImg =
        imageCache?.get(logoUrl) ||
        imageCache?.get('/mafogh-logo-brand.svg') ||
        imageCache?.get('/mafogh-logo.svg');

      if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
        const aspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;
        const targetW = targetH * aspectRatio;

        if (pos === 'bottom-center') {
          wmX = width / 2;
          wmY = height - marginY - targetH / 2;
          drawTintedImage(ctx, logoImg, wmX - targetW / 2, wmY - targetH / 2, targetW, targetH, wm.color);
        } else if (pos === 'bottom-right') {
          wmX = width - marginX;
          wmY = height - marginY - targetH / 2;
          drawTintedImage(ctx, logoImg, wmX - targetW, wmY - targetH / 2, targetW, targetH, wm.color);
        } else if (pos === 'bottom-left') {
          wmX = marginX;
          wmY = height - marginY - targetH / 2;
          drawTintedImage(ctx, logoImg, wmX, wmY - targetH / 2, targetW, targetH, wm.color);
        } else if (pos === 'top-right') {
          wmX = width - marginX;
          wmY = marginY + targetH / 2;
          drawTintedImage(ctx, logoImg, wmX - targetW, wmY - targetH / 2, targetW, targetH, wm.color);
        }
      } else {
        ctx.font = `900 ${Math.round(targetH * 0.9)}px 'YekanBakhFaNum', 'Vazirmatn', sans-serif`;
        ctx.fillStyle = wm.color || '#6b0b45';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.direction = 'rtl';
        ctx.fillText(wm.text || 'مافوق', wmX, wmY);
      }
    }
    ctx.restore();
  }

  ctx.restore();
}
