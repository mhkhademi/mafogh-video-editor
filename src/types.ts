export type AnimationType =
  | 'slide-up'
  | 'fade-in'
  | 'pop-in'
  | 'slide-down'
  | 'zoom-in'
  | 'typewriter'
  | 'counter'
  | 'none';

export type ExitAnimationType = 'fade-out' | 'slide-down' | 'slide-up' | 'zoom-out' | 'none';

export interface AnimationConfig {
  type: AnimationType;
  duration: number; // in seconds, e.g. 0.8
  delay: number;    // start delay relative to slide start in seconds, e.g. 0.2
  easing?: string;  // css easing function

  // Exit Animation & In/Out Timing
  outTime?: number;       // second within slide when exit begins
  exitType?: ExitAnimationType;
  exitDuration?: number;  // duration of exit animation in seconds e.g. 0.5

  // Counter options
  counterStart?: number;
  counterEnd?: number;
  counterPrefix?: string;
  counterSuffix?: string;
}

export type ElementType = 'title' | 'subtitle' | 'paragraph' | 'badge' | 'image' | 'card' | 'list-box' | 'icon';

export interface SlideElement {
  id: string;
  type: ElementType;
  content: string; // text, image url, or icon name
  subcontent?: string; // e.g. English translation or secondary line
  
  // Coordinates based on 1920x1080 canvas
  x: number; // percentage (0-100) or pixel
  y: number; // percentage (0-100)
  width?: number; // percentage (0-100)
  
  // Styling
  color?: string;
  fontSize?: number; // scale px in 1080p (or icon size)
  fontWeight?: '300' | '400' | '500' | '600' | '700' | '800' | '900';
  textAlign?: 'right' | 'center' | 'left';
  nowrap?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  padding?: number;
  icon?: string;
  strokeWidth?: number; // for vector icons (e.g. 1, 1.5, 2, 2.5, 3)
  badgeNumber?: string;
  
  // Animation
  animation: AnimationConfig;
  
  // Layer & Lock
  locked?: boolean;
}

export interface SlideBackground {
  type: 'solid' | 'gradient' | 'image';
  color1: string;
  color2?: string;
  gradientAngle?: number; // degrees e.g. 135
  imageUrl?: string;
}

export type TransitionType = 'fade' | 'slide-left' | 'slide-up' | 'none';

export interface Slide {
  id: string;
  title: string;
  duration: number; // duration in seconds e.g. 6.0
  background: SlideBackground;
  transitionOut: TransitionType;
  transitionDuration: number;
  elements: SlideElement[];
}

export interface WatermarkConfig {
  enabled: boolean;
  type: 'text' | 'image';
  text?: string;
  imageUrl?: string;
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right';
  opacity: number;
  size?: number;
}

export interface AudioConfig {
  url?: string;
  name?: string;
  volume: number; // 0 to 1
  loop?: boolean;
}

export type AspectRatioType = '16:9' | '9:16' | '1:1' | '4:5';

export interface Project {
  id: string;
  title: string;
  width: number;
  height: number;
  aspectRatio?: AspectRatioType;
  fps: number;
  slides: Slide[];
  watermark: WatermarkConfig;
  audio?: AudioConfig;
}
