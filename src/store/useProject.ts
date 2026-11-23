import { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, Slide, SlideElement, ElementType, AnimationConfig, AspectRatioType } from '../types';
import { ltvTemplate } from '../templates/ltvTemplate';

export function useProjectStore() {
  const [project, setProject] = useState<Project>(() => {
    const saved = localStorage.getItem('mafogh_editor_project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved project', e);
      }
    }
    return ltvTemplate;
  });

  const [activeSlideId, setActiveSlideId] = useState<string>(() => project.slides[0]?.id || '');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // History Stack for Undo/Redo (Ctrl+Z / Ctrl+Y)
  const [past, setPast] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);

  // Push current state to past history stack
  const saveSnapshot = useCallback(() => {
    setPast((prev) => [...prev.slice(-30), project]);
    setFuture([]);
  }, [project]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setPast(newPast);
    setFuture((prev) => [project, ...prev]);
    setProject(previous);
  }, [past, project]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setFuture(newFuture);
    setPast((prev) => [...prev, project]);
    setProject(next);
  }, [future, project]);

  // Auto-save project changes to localStorage
  useEffect(() => {
    localStorage.setItem('mafogh_editor_project', JSON.stringify(project));
  }, [project]);

  // Compute total duration of the project
  const totalDuration = useMemo(() => {
    return project.slides.reduce((acc, s) => acc + (s.duration || 5), 0);
  }, [project.slides]);

  // Find active slide object
  const activeSlide = useMemo(() => {
    return project.slides.find((s) => s.id === activeSlideId) || project.slides[0];
  }, [project.slides, activeSlideId]);

  // Find selected element
  const selectedElement = useMemo(() => {
    if (!selectedElementId || !activeSlide) return null;
    return activeSlide.elements.find((el) => el.id === selectedElementId) || null;
  }, [activeSlide, selectedElementId]);

  // Compute slide time bounds map: { [slideId]: { start: number, end: number, slide: Slide } }
  const slideTiming = useMemo(() => {
    let accumulated = 0;
    const mapping: Record<string, { start: number; end: number; index: number; slide: Slide }> = {};
    project.slides.forEach((slide, index) => {
      const dur = slide.duration || 5;
      mapping[slide.id] = {
        start: accumulated,
        end: accumulated + dur,
        index,
        slide,
      };
      accumulated += dur;
    });
    return mapping;
  }, [project.slides]);

  // Get current active slide by global time during playback or scrubbing
  const currentSlideInfo = useMemo(() => {
    let acc = 0;
    for (let i = 0; i < project.slides.length; i++) {
      const slide = project.slides[i];
      const dur = slide.duration || 5;
      const isLast = i === project.slides.length - 1;
      // Use strict < on boundary so clicking a slide's start time selects that slide, not previous
      if (currentTime >= acc && (isLast ? currentTime <= acc + dur : currentTime < acc + dur)) {
        return {
          slide,
          slideIndex: i,
          slideLocalTime: currentTime - acc,
          start: acc,
          end: acc + dur,
        };
      }
      acc += dur;
    }
    const lastSlide = project.slides[project.slides.length - 1];
    return {
      slide: lastSlide,
      slideIndex: project.slides.length - 1,
      slideLocalTime: lastSlide ? lastSlide.duration : 0,
      start: acc - (lastSlide ? lastSlide.duration : 0),
      end: acc,
    };
  }, [project.slides, currentTime]);

  // Playback timer loop (60 FPS smooth time progression)
  useEffect(() => {
    if (!isPlaying) return;

    let animFrame: number;
    let lastTimestamp = performance.now();

    const loop = (now: number) => {
      // Guard against huge deltas if user switches tabs
      const delta = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= totalDuration) {
          return totalDuration;
        }
        return next;
      });

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, totalDuration]);

  // Stop playback when reaching the end of the video
  useEffect(() => {
    if (isPlaying && currentTime >= totalDuration) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentTime, totalDuration]);

  // Sync active slide with current playback position or scrubber position
  useEffect(() => {
    if (currentSlideInfo?.slide && currentSlideInfo.slide.id !== activeSlideId) {
      setActiveSlideId(currentSlideInfo.slide.id);
    }
  }, [currentSlideInfo?.slide?.id, activeSlideId]);

  // Slide Management
  const addSlide = useCallback(() => {
    const newSlideId = `slide-${Date.now()}`;
    const newSlide: Slide = {
      id: newSlideId,
      title: `اسلاید ${project.slides.length + 1}`,
      duration: 5.0,
      background: {
        type: 'solid',
        color1: '#ffffff',
      },
      transitionOut: 'fade',
      transitionDuration: 0.5,
      elements: [
        {
          id: `el-${Date.now()}`,
          type: 'title',
          content: 'عنوان اسلاید جدید',
          x: 50,
          y: 40,
          color: '#0f172a',
          fontSize: 64,
          fontWeight: '800',
          textAlign: 'center',
          animation: {
            type: 'slide-up',
            duration: 0.7,
            delay: 0.2,
          },
        },
      ],
    };

    setProject((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
    setActiveSlideId(newSlideId);
  }, [project.slides.length]);

  const duplicateSlide = useCallback((id: string) => {
    const slideToCopy = project.slides.find((s) => s.id === id);
    if (!slideToCopy) return;

    const copy: Slide = {
      ...JSON.parse(JSON.stringify(slideToCopy)),
      id: `slide-${Date.now()}`,
      title: `${slideToCopy.title} (کپی)`,
    };

    const index = project.slides.findIndex((s) => s.id === id);
    const newSlides = [...project.slides];
    newSlides.splice(index + 1, 0, copy);

    setProject((prev) => ({ ...prev, slides: newSlides }));
    setActiveSlideId(copy.id);
  }, [project.slides]);

  const deleteSlide = useCallback((id: string) => {
    if (project.slides.length <= 1) {
      alert('حداقل یک اسلاید باید در پروژه باقی بماند.');
      return;
    }
    const filtered = project.slides.filter((s) => s.id !== id);
    setProject((prev) => ({ ...prev, slides: filtered }));
    if (activeSlideId === id) {
      setActiveSlideId(filtered[0].id);
    }
  }, [project.slides, activeSlideId]);

  const updateSlide = useCallback((id: string, partial: Partial<Slide>) => {
    setProject((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => (s.id === id ? { ...s, ...partial } : s)),
    }));
  }, []);

  const moveSlide = useCallback((index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.slides.length) return;

    const newSlides = [...project.slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIndex, 0, moved);

    setProject((prev) => ({ ...prev, slides: newSlides }));
  }, [project.slides]);

  // Element Management
  const addElement = useCallback((slideId: string, type: ElementType) => {
    const defaultAnim: AnimationConfig = {
      type: 'slide-up',
      duration: 0.6,
      delay: 0.3,
    };

    let newEl: SlideElement;
    const baseId = `el-${Date.now()}`;

    switch (type) {
      case 'title':
        newEl = {
          id: baseId,
          type: 'title',
          content: 'تیتر جدید',
          x: 50,
          y: 35,
          color: '#0f172a',
          fontSize: 60,
          fontWeight: '800',
          textAlign: 'center',
          animation: defaultAnim,
        };
        break;
      case 'subtitle':
        newEl = {
          id: baseId,
          type: 'subtitle',
          content: 'زیرنویس یا متن تکمیلی',
          x: 50,
          y: 50,
          color: '#64748b',
          fontSize: 34,
          fontWeight: '500',
          textAlign: 'center',
          animation: { ...defaultAnim, delay: 0.5 },
        };
        break;
      case 'paragraph':
        newEl = {
          id: baseId,
          type: 'paragraph',
          content: 'توضیحات کامل و پاراگراف متنی خود را در این بخش وارد نمایید.',
          x: 50,
          y: 55,
          width: 80,
          color: '#334155',
          fontSize: 32,
          fontWeight: '400',
          textAlign: 'center',
          animation: { ...defaultAnim, delay: 0.4 },
        };
        break;
      case 'list-box':
        newEl = {
          id: baseId,
          type: 'list-box',
          content: 'مورد شماره جدید',
          subcontent: 'توضیح کوتاه انگلیسی یا فارسی',
          x: 50,
          y: 50,
          width: 70,
          color: '#ffffff',
          backgroundColor: '#9d174d',
          animation: defaultAnim,
        };
        break;
      case 'image':
        newEl = {
          id: baseId,
          type: 'image',
          content: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop',
          x: 50,
          y: 50,
          width: 30,
          animation: { type: 'pop-in', duration: 0.7, delay: 0.3 },
        };
        break;
      case 'card':
        newEl = {
          id: baseId,
          type: 'card',
          content: 'نکته کلیدی و راهبردی خود را اینجا بنویسید...',
          subcontent: 'توضیحات تکمیلی یا منبع نکته',
          icon: 'Lightbulb',
          x: 50,
          y: 60,
          width: 76,
          fontSize: 26,
          fontWeight: '600',
          color: '#2F041E',
          backgroundColor: '#FFFFFF',
          borderColor: '#E2E8F0',
          borderRadius: 24,
          padding: 26,
          animation: { type: 'slide-up', duration: 0.7, delay: 0.3 },
        };
        break;
      case 'icon':
        newEl = {
          id: baseId,
          type: 'icon',
          content: 'Sparkles',
          x: 50,
          y: 40,
          fontSize: 54,
          color: '#6B0B45',
          strokeWidth: 2,
          backgroundColor: '#FBF4F8',
          borderColor: '#EABAD7',
          borderRadius: 999,
          padding: 18,
          animation: { type: 'pop-in', duration: 0.6, delay: 0.2 },
        };
        break;
      case 'arrow':
      case 'shape':
        newEl = {
          id: baseId,
          type: 'arrow',
          content: '',
          x: 50,
          y: 50,
          width: 25,
          rotation: 0,
          color: '#6b0b45',
          strokeWidth: 5,
          animation: { type: 'pop-in', duration: 0.5, delay: 0.2 },
        };
        break;
      case 'divider':
        newEl = {
          id: baseId,
          type: 'divider',
          content: '',
          x: 50,
          y: 50,
          width: 60,
          strokeWidth: 3,
          color: '#6b0b45',
          backgroundColor: 'gradient',
          animation: { type: 'fade-in', duration: 0.5, delay: 0.2 },
        };
        break;
      default:
        newEl = {
          id: baseId,
          type: 'paragraph',
          content: 'محتوا',
          x: 50,
          y: 50,
          animation: defaultAnim,
        };
    }

    setProject((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === slideId ? { ...s, elements: [...s.elements, newEl] } : s
      ),
    }));
    setSelectedElementId(newEl.id);
  }, []);

  const updateElement = useCallback(
    (slideId: string, elementId: string, partial: Partial<SlideElement>) => {
      setProject((prev) => ({
        ...prev,
        slides: prev.slides.map((s) =>
          s.id === slideId
            ? {
                ...s,
                elements: s.elements.map((el) =>
                  el.id === elementId ? { ...el, ...partial } : el
                ),
              }
            : s
        ),
      }));
    },
    []
  );

  const deleteElement = useCallback((slideId: string, elementId: string) => {
    saveSnapshot();
    setProject((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === slideId
          ? {
              ...s,
              elements: s.elements.filter((el) => el.id !== elementId),
            }
          : s
      ),
    }));
    setSelectedElementId(null);
  }, [saveSnapshot]);

  const duplicateElement = useCallback((slideId: string, elementId: string) => {
    saveSnapshot();
    setProject((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => {
        if (s.id !== slideId) return s;
        const el = s.elements.find((e) => e.id === elementId);
        if (!el) return s;
        const copy: SlideElement = {
          ...JSON.parse(JSON.stringify(el)),
          id: `el-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          x: Math.min(95, el.x + 3),
          y: Math.min(95, el.y + 3),
        };
        setTimeout(() => setSelectedElementId(copy.id), 0);
        return {
          ...s,
          elements: [...s.elements, copy],
        };
      }),
    }));
  }, [saveSnapshot]);

  const bringForward = useCallback((slideId: string, elementId: string) => {
    saveSnapshot();
    setProject((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => {
        if (s.id !== slideId) return s;
        const idx = s.elements.findIndex((e) => e.id === elementId);
        if (idx === -1 || idx === s.elements.length - 1) return s;
        const newEls = [...s.elements];
        const [moved] = newEls.splice(idx, 1);
        newEls.splice(idx + 1, 0, moved);
        return { ...s, elements: newEls };
      }),
    }));
  }, [saveSnapshot]);

  const bringToFront = useCallback((slideId: string, elementId: string) => {
    saveSnapshot();
    setProject((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => {
        if (s.id !== slideId) return s;
        const idx = s.elements.findIndex((e) => e.id === elementId);
        if (idx === -1 || idx === s.elements.length - 1) return s;
        const newEls = [...s.elements];
        const [moved] = newEls.splice(idx, 1);
        newEls.push(moved);
        return { ...s, elements: newEls };
      }),
    }));
  }, [saveSnapshot]);

  const sendBackward = useCallback((slideId: string, elementId: string) => {
    saveSnapshot();
    setProject((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => {
        if (s.id !== slideId) return s;
        const idx = s.elements.findIndex((e) => e.id === elementId);
        if (idx <= 0) return s;
        const newEls = [...s.elements];
        const [moved] = newEls.splice(idx, 1);
        newEls.splice(idx - 1, 0, moved);
        return { ...s, elements: newEls };
      }),
    }));
  }, [saveSnapshot]);

  const sendToBack = useCallback((slideId: string, elementId: string) => {
    saveSnapshot();
    setProject((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => {
        if (s.id !== slideId) return s;
        const idx = s.elements.findIndex((e) => e.id === elementId);
        if (idx <= 0) return s;
        const newEls = [...s.elements];
        const [moved] = newEls.splice(idx, 1);
        newEls.unshift(moved);
        return { ...s, elements: newEls };
      }),
    }));
  }, [saveSnapshot]);

  const toggleLockElement = useCallback((slideId: string, elementId: string) => {
    saveSnapshot();
    setProject((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === slideId
          ? {
              ...s,
              elements: s.elements.map((el) =>
                el.id === elementId ? { ...el, locked: !el.locked } : el
              ),
            }
          : s
      ),
    }));
  }, [saveSnapshot]);

  const setAspectRatio = useCallback((ratio: AspectRatioType) => {
    saveSnapshot();
    setProject((prev) => {
      let width = 1920;
      let height = 1080;
      if (ratio === '9:16') {
        width = 1080;
        height = 1920;
      } else if (ratio === '1:1') {
        width = 1080;
        height = 1080;
      } else if (ratio === '4:5') {
        width = 1080;
        height = 1350;
      } else {
        width = 1920;
        height = 1080;
      }
      return {
        ...prev,
        aspectRatio: ratio,
        width,
        height,
      };
    });
  }, [saveSnapshot]);

  const resetToTemplate = useCallback(() => {
    if (confirm('آیا مایلید تمام اسلایدها با قالب پیش‌فرض LTV بازنشانی شوند؟')) {
      setProject(ltvTemplate);
      setActiveSlideId(ltvTemplate.slides[0].id);
      setSelectedElementId(null);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, []);

  // Jump to specific slide in timeline
  const jumpToSlide = useCallback(
    (slideId: string) => {
      const timing = slideTiming[slideId];
      if (timing) {
        setCurrentTime(timing.start);
        setActiveSlideId(slideId);
      }
    },
    [slideTiming]
  );

  // Update global watermark & logo config
  const updateWatermark = useCallback(
    (partial: Partial<Project['watermark']>) => {
      saveSnapshot();
      setProject((prev) => ({
        ...prev,
        watermark: {
          ...prev.watermark,
          ...partial,
        },
      }));
    },
    [saveSnapshot]
  );

  return {
    project,
    setProject,
    activeSlideId,
    setActiveSlideId,
    activeSlide,
    selectedElementId,
    setSelectedElementId,
    selectedElement,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    totalDuration,
    currentSlideInfo,
    slideTiming,
    addSlide,
    duplicateSlide,
    deleteSlide,
    updateSlide,
    moveSlide,
    addElement,
    updateElement,
    updateWatermark,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    saveSnapshot,
    duplicateElement,
    bringForward,
    bringToFront,
    sendBackward,
    sendToBack,
    toggleLockElement,
    deleteElement,
    setAspectRatio,
    resetToTemplate,
    jumpToSlide,
  };
}
