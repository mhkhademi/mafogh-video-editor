import { Project, Slide, SlideElement } from '../types';
import { calculateMotion } from './motionUtils';

export function renderSlideToCanvas(
  ctx: CanvasRenderingContext2D,
  slide: Slide,
  slideLocalTime: number,
  watermark: Project['watermark'],
  imageCache?: Map<string, HTMLImageElement>,
  targetWidth = 1920,
  targetHeight = 1080
) {
  const width = 1920;
  const height = 1080;

  ctx.save();
  // Scale canvas context if target resolution is 720p or other dimensions
  if (targetWidth !== 1920 || targetHeight !== 1080) {
    ctx.scale(targetWidth / 1920, targetHeight / 1080);
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
      ctx.drawImage(bgImg, 0, 0, width, height);
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

    // Draw element content based on type
    if (element.type === 'title' || element.type === 'subtitle' || element.type === 'paragraph') {
      const fontSize = element.fontSize || (element.type === 'title' ? 72 : 36);
      const fontWeight = element.fontWeight || (element.type === 'title' ? '800' : '500');
      ctx.font = `${fontWeight} ${fontSize}px 'Vazirmatn', sans-serif`;
      ctx.fillStyle = element.color || '#0f172a';
      ctx.textAlign = (element.textAlign as CanvasTextAlign) || 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';

      // Multi-line word wrap if width is specified and wrapping is not disabled
      if (element.width && !element.nowrap) {
        const maxWidth = (element.width / 100) * width;
        const words = motion.displayText.split(' ');
        let line = '';
        const lines: string[] = [];

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        const lineHeight = fontSize * 1.45;
        const totalH = lines.length * lineHeight;
        let startY = -(totalH / 2) + lineHeight / 2;

        for (const l of lines) {
          ctx.fillText(l.trim(), 0, startY);
          startY += lineHeight;
        }
      } else {
        ctx.fillText(motion.displayText, 0, 0);
      }
    } else if (element.type === 'list-box') {
      // Draw branded dual-language list box
      const boxW = ((element.width || 68) / 100) * width;
      const boxH = 68;
      const rightW = boxW * 0.38;
      const leftW = boxW - rightW;

      ctx.save();
      ctx.translate(-boxW / 2, -boxH / 2);

      // Border & White base
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(157, 23, 77, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(0, 0, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      // Right magenta block (Persian text)
      ctx.fillStyle = element.backgroundColor || '#9d174d';
      ctx.beginPath();
      ctx.roundRect(leftW, 0, rightW, boxH, [0, 8, 8, 0]);
      ctx.fill();

      // Text inside right block (Persian)
      ctx.font = "bold 26px 'Vazirmatn', sans-serif";
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.direction = 'rtl';
      ctx.fillText(motion.displayText, leftW + rightW / 2, boxH / 2);

      // Text inside left block (English)
      if (element.subcontent) {
        ctx.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'left';
        ctx.direction = 'ltr';
        ctx.fillText(element.subcontent, 30, boxH / 2);
      }

      ctx.restore();
    } else if (element.type === 'card') {
      // Circle icon e.g. dollar icon
      const size = (element.fontSize || 80) * 1.6;
      ctx.fillStyle = element.backgroundColor || '#9d174d';
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `900 ${element.fontSize || 80}px 'Vazirmatn', sans-serif`;
      ctx.fillStyle = element.color || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(motion.displayText, 0, 4);
    } else if (element.type === 'image') {
      // Draw image element with aspect-ratio preservation and rounded corners
      const img = imageCache?.get(element.content);
      if (img && img.complete && img.naturalWidth > 0) {
        const imgW = ((element.width ?? 35) / 100) * width;
        const aspect = img.naturalHeight / img.naturalWidth;
        const imgH = imgW * aspect;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-imgW / 2, -imgH / 2, imgW, imgH, 16);
        ctx.clip();
        ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // 4. Render Watermark
  if (watermark && watermark.enabled) {
    ctx.save();
    ctx.globalAlpha = watermark.opacity ?? 0.9;
    const pos = watermark.position || 'bottom-center';
    const targetH = watermark.size ? watermark.size * 1.15 : 36;
    let wmX = width / 2;
    let wmY = height - 60;

    const logoBrand = imageCache?.get('/mafogh-logo-brand.svg');
    if (logoBrand && logoBrand.complete && logoBrand.naturalWidth > 0) {
      const aspectRatio = logoBrand.naturalWidth / logoBrand.naturalHeight;
      const targetW = targetH * aspectRatio;

      if (pos === 'bottom-center') {
        wmX = width / 2;
        wmY = height - 60;
        ctx.drawImage(logoBrand, wmX - targetW / 2, wmY - targetH / 2, targetW, targetH);
      } else if (pos === 'bottom-right') {
        wmX = width - 80;
        wmY = height - 60;
        ctx.drawImage(logoBrand, wmX - targetW, wmY - targetH / 2, targetW, targetH);
      } else if (pos === 'bottom-left') {
        wmX = 80;
        wmY = height - 60;
        ctx.drawImage(logoBrand, wmX, wmY - targetH / 2, targetW, targetH);
      } else if (pos === 'top-right') {
        wmX = width - 80;
        wmY = 60;
        ctx.drawImage(logoBrand, wmX - targetW, wmY - targetH / 2, targetW, targetH);
      }
    } else {
      // Fallback: If SVG image is not cached, draw text and mark with correct Persian RTL alignment
      // Mafogh emblem is on the RIGHT, text is on the LEFT
      const logo = imageCache?.get('/favicon.svg');
      if (logo && logo.complete && logo.naturalWidth > 0) {
        const logoSize = targetH;
        ctx.font = `900 ${Math.round(targetH * 0.9)}px 'Vazirmatn', sans-serif`;
        const metrics = ctx.measureText(watermark.text || 'مافوق');
        const textWidth = metrics.width;
        const totalW = textWidth + 12 + logoSize;

        let startX = wmX - totalW / 2;
        if (pos === 'bottom-right' || pos === 'top-right') {
          startX = width - 80 - totalW;
          wmY = pos === 'top-right' ? 60 : height - 60;
        } else if (pos === 'bottom-left') {
          startX = 80;
          wmY = height - 60;
        }

        // Text on the left
        ctx.fillStyle = '#6b0b45';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.direction = 'rtl';
        ctx.fillText(watermark.text || 'مافوق', startX, wmY);

        // Logo on the right
        ctx.drawImage(logo, startX + textWidth + 12, wmY - logoSize / 2, logoSize, logoSize);
      } else {
        ctx.font = `900 ${Math.round(targetH * 0.9)}px 'Vazirmatn', sans-serif`;
        ctx.fillStyle = '#6b0b45';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.direction = 'rtl';
        ctx.fillText(watermark.text || 'مافوق', wmX, wmY);
      }
    }
    ctx.restore();
  }

  ctx.restore();
}
