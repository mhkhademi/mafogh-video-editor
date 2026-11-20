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
    undo,
    redo,
    canUndo,
    canRedo,
    duplicateElement,
    bringForward,
    bringToFront,
    sendBackward,
    sendToBack,
    toggleLockElement,
  } = useProjectStore();

  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Global Keyboard shortcuts: Spacebar, Undo/Redo, Delete, Duplicate, Arrow Keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Spacebar: Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => {
          if (!prev && currentTime >= totalDuration - 0.1) {
            setCurrentTime(0);
          }
          return !prev;
        });
        return;
      }

      // Ctrl+Z: Undo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z: Redo
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete / Backspace: Delete selected element
      if (selectedElementId && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        deleteElement(activeSlide.id, selectedElementId);
        return;
      }

      // Ctrl+D: Duplicate selected element
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (selectedElementId) {
          duplicateElement(activeSlide.id, selectedElementId);
        }
        return;
      }

      // Arrow Keys: Nudge selected element (1% or 0.2% with Shift)
      if (selectedElementId && selectedElement && !selectedElement.locked) {
        const step = e.shiftKey ? 0.2 : 1;
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          updateElement(activeSlide.id, selectedElementId, {
            y: Math.max(0, Math.min(100, Number((selectedElement.y - step).toFixed(1)))),
          });
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          updateElement(activeSlide.id, selectedElementId, {
            y: Math.max(0, Math.min(100, Number((selectedElement.y + step).toFixed(1)))),
          });
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          updateElement(activeSlide.id, selectedElementId, {
            x: Math.max(0, Math.min(100, Number((selectedElement.x - step).toFixed(1)))),
          });
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          updateElement(activeSlide.id, selectedElementId, {
            x: Math.max(0, Math.min(100, Number((selectedElement.x + step).toFixed(1)))),
          });
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setIsPlaying,
    currentTime,
    totalDuration,
    setCurrentTime,
    undo,
    redo,
    selectedElementId,
    selectedElement,
    activeSlide.id,
    deleteElement,
    duplicateElement,
    updateElement,
  ]);

  // Preview canvas is ALWAYS driven by the scrubber / current time position
  const displaySlide = currentSlideInfo?.slide || activeSlide;
  const displaySlideLocalTime = currentSlideInfo ? currentSlideInfo.slideLocalTime : 0;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Bar */}
      <Header
        project={project}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
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
          onDuplicateElement={(elementId) => duplicateElement(activeSlide.id, elementId)}
          onBringForward={(elementId) => bringForward(activeSlide.id, elementId)}
          onBringToFront={(elementId) => bringToFront(activeSlide.id, elementId)}
          onSendBackward={(elementId) => sendBackward(activeSlide.id, elementId)}
          onSendToBack={(elementId) => sendToBack(activeSlide.id, elementId)}
          onToggleLock={(elementId) => toggleLockElement(activeSlide.id, elementId)}
          onSelectElement={setSelectedElementId}
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
        activeSlide={activeSlide}
        selectedElementId={selectedElementId}
        onSelectElement={setSelectedElementId}
        onUpdateElement={(elementId, partial) =>
          updateElement(activeSlide.id, elementId, partial)
        }
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
