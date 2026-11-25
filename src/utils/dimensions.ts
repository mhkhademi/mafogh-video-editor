import { AspectRatioType } from '../types';

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Returns canonical 1080p-tier design dimensions for a given aspect ratio.
 */
export function getAspectDimensions(ratio?: AspectRatioType): Dimensions {
  switch (ratio) {
    case '9:16':
      return { width: 1080, height: 1920 };
    case '1:1':
      return { width: 1080, height: 1080 };
    case '4:5':
      return { width: 1080, height: 1350 };
    case '16:9':
    default:
      return { width: 1920, height: 1080 };
  }
}

/**
 * Resolves the logical design dimensions of a project, preferring explicit
 * canonical dimensions matching its aspectRatio so preview and export align.
 */
export function getProjectLogicalDimensions(project: {
  aspectRatio?: AspectRatioType;
  width?: number;
  height?: number;
}): Dimensions {
  if (project.aspectRatio) {
    return getAspectDimensions(project.aspectRatio);
  }
  return {
    width: project.width || 1920,
    height: project.height || 1080,
  };
}
