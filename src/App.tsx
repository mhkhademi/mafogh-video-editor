import React, { useState, useEffect } from 'react';
import { useProjectStore } from './store/useProject';
import { Header } from './components/Header';
import { SlideSidebar } from './components/SlideSidebar';
import { CanvasStage } from './components/CanvasStage';
import { PropertiesPanel } from './components/PropertiesPanel';
import { TimelineBar } from './components/TimelineBar';
import { ExportModal } from './components/ExportModal';

export const App: React.FC = () => {
  const {
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
    addSlide,
    duplicateSlide,
    deleteSlide,
    updateSlide,
    moveSlide,
    addElement,
    updateElement,
    deleteElement,
    resetToTemplate,
    jumpToSlide,
    setAspectRatio,
  } = useProjectStore();

  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Global Keyboard shortcuts: Spacebar to toggle Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => {
          if (!prev && currentTime >= totalDuration - 0.1) {
            setCurrentTime(0);
          }
          return !prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsPlaying, currentTime, totalDuration, setCurrentTime]);

  // Preview canvas is ALWAYS driven by the scrubber / current time position
  const displaySlide = currentSlideInfo?.slide || activeSlide;
  const displaySlideLocalTime = currentSlideInfo ? currentSlideInfo.slideLocalTime : 0;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Bar */}
      <Header
        project={project}
        onUpdateTitle={(title) => setProject((prev) => ({ ...prev, title }))}
        onResetTemplate={resetToTemplate}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onSelectAspectRatio={setAspectRatio}
        onImportProject={(imported) => {
          setProject(imported);
          if (imported.slides?.[0]?.id) {
            setActiveSlideId(imported.slides[0].id);
          }
        }}
      />

      {/* Main Workspace Workspace: Left Sidebar + Center Stage + Right Properties */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: PowerPoint-style Slide Thumbnails */}
        <SlideSidebar
          slides={project.slides}
          activeSlideId={activeSlideId}
          watermark={project.watermark}
          projectWidth={project.width}
          projectHeight={project.height}
          onSelectSlide={(id) => {
            jumpToSlide(id);
            setSelectedElementId(null);
          }}
          onAddSlide={addSlide}
          onDuplicateSlide={duplicateSlide}
          onDeleteSlide={deleteSlide}
          onMoveSlide={moveSlide}
          onUpdateDuration={(id, dur) => updateSlide(id, { duration: dur })}
        />

        {/* Center: Live Real-time Dynamic Stage with 60fps Smooth Transitions */}
        <CanvasStage
          slide={displaySlide}
          slideLocalTime={displaySlideLocalTime}
          watermark={project.watermark}
          selectedElementId={selectedElementId}
          width={project.width}
          height={project.height}
          onSelectElement={setSelectedElementId}
          onUpdateElement={(elementId, partial) =>
            updateElement(displaySlide.id, elementId, partial)
          }
        />

        {/* Right: Properties & Layer Customizer */}
        <PropertiesPanel
          slide={activeSlide}
          selectedElement={selectedElement}
          onUpdateSlide={(partial) => updateSlide(activeSlide.id, partial)}
          onAddElement={(type) => addElement(activeSlide.id, type)}
          onUpdateElement={(elementId, partial) =>
            updateElement(activeSlide.id, elementId, partial)
          }
          onDeleteElement={(elementId) => deleteElement(activeSlide.id, elementId)}
        />
      </div>

      {/* Bottom: Playback & Timeline Controls */}
      <TimelineBar
        slides={project.slides}
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        onTogglePlay={() => {
          if (!isPlaying && currentTime >= totalDuration - 0.1) {
            setCurrentTime(0);
          }
          setIsPlaying((prev) => !prev);
        }}
        onSeek={(time) => {
          setCurrentTime(time);
        }}
        onRewind={() => {
          setCurrentTime(0);
          if (project.slides[0]) {
            setActiveSlideId(project.slides[0].id);
          }
        }}
        activeSlideId={activeSlideId}
      />

      {/* MP4 Render & Export Modal */}
      <ExportModal
        project={project}
        totalDuration={totalDuration}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

export default App;
