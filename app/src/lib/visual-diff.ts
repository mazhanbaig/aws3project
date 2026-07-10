import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export interface VisualDiffResult {
  diffBuffer: Buffer;
  diffPixels: number;
  totalPixels: number;
  diffPercent: number;
  hasChanges: boolean;
  width: number;
  height: number;
}

/**
 * Compare two PNG screenshots and return a visual diff image.
 * Both buffers must be raw PNG data.
 */
export function computeVisualDiff(
  oldPng: Buffer,
  newPng: Buffer
): VisualDiffResult | null {
  try {
    const oldImg = PNG.sync.read(oldPng);
    const newImg = PNG.sync.read(newPng);

    // Use the smaller dimensions for comparison
    const width = Math.min(oldImg.width, newImg.width);
    const height = Math.min(oldImg.height, newImg.height);

    const diffImg = new PNG({ width, height });
    const diffCount = pixelmatch(
      oldImg.data,
      newImg.data,
      diffImg.data,
      width,
      height,
      { threshold: 0.1 }
    );

    const totalPixels = width * height;
    const diffPercent = Math.round((diffCount / totalPixels) * 10000) / 100;
    const diffBuffer = PNG.sync.write(diffImg);

    return {
      diffBuffer,
      diffPixels: diffCount,
      totalPixels,
      diffPercent,
      hasChanges: diffCount > 0,
      width,
      height,
    };
  } catch (err) {
    console.error('[VisualDiff] Failed to compute diff:', err);
    return null;
  }
}

/**
 * Compare two screenshots and return a side-by-side comparison image
 * showing old | diff | new in one image.
 */
export function createComparisonImage(
  oldPng: Buffer,
  newPng: Buffer,
  diffPng?: Buffer
): Buffer | null {
  try {
    const oldImg = PNG.sync.read(oldPng);
    const newImg = PNG.sync.read(newPng);
    const diffImg = diffPng ? PNG.sync.read(diffPng) : null;

    const width = Math.max(oldImg.width, newImg.width);
    const height = Math.max(oldImg.height, newImg.height);

    // Create a wide image: old | diff | new
    const panelWidth = diffImg ? width : width;
    const totalWidth = diffImg ? width * 3 : width * 2;
    const comparison = new PNG({ width: totalWidth, height });

    // Copy old image (left panel)
    for (let y = 0; y < Math.min(oldImg.height, height); y++) {
      for (let x = 0; x < Math.min(oldImg.width, width); x++) {
        const srcIdx = (y * oldImg.width + x) * 4;
        const dstIdx = (y * totalWidth + x) * 4;
        comparison.data[dstIdx] = oldImg.data[srcIdx];
        comparison.data[dstIdx + 1] = oldImg.data[srcIdx + 1];
        comparison.data[dstIdx + 2] = oldImg.data[srcIdx + 2];
        comparison.data[dstIdx + 3] = oldImg.data[srcIdx + 3];
      }
    }

    if (diffImg) {
      // Copy diff image (middle panel)
      const offset = width;
      for (let y = 0; y < Math.min(diffImg.height, height); y++) {
        for (let x = 0; x < Math.min(diffImg.width, width); x++) {
          const srcIdx = (y * diffImg.width + x) * 4;
          const dstIdx = (y * totalWidth + (offset + x)) * 4;
          comparison.data[dstIdx] = diffImg.data[srcIdx];
          comparison.data[dstIdx + 1] = diffImg.data[srcIdx + 1];
          comparison.data[dstIdx + 2] = diffImg.data[srcIdx + 2];
          comparison.data[dstIdx + 3] = diffImg.data[srcIdx + 3];
        }
      }
    }

    // Copy new image (right panel)
    const newOffset = diffImg ? width * 2 : width;
    for (let y = 0; y < Math.min(newImg.height, height); y++) {
      for (let x = 0; x < Math.min(newImg.width, width); x++) {
        const srcIdx = (y * newImg.width + x) * 4;
        const dstIdx = (y * totalWidth + (newOffset + x)) * 4;
        comparison.data[dstIdx] = newImg.data[srcIdx];
        comparison.data[dstIdx + 1] = newImg.data[srcIdx + 1];
        comparison.data[dstIdx + 2] = newImg.data[srcIdx + 2];
        comparison.data[dstIdx + 3] = newImg.data[srcIdx + 3];
      }
    }

    return PNG.sync.write(comparison);
  } catch (err) {
    console.error('[VisualDiff] Failed to create comparison:', err);
    return null;
  }
}
