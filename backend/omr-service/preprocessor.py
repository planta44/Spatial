"""
Image preprocessing module for handwritten music notation.
Implements smoothing, alignment, and normalization algorithms.
"""

import cv2
import numpy as np
from pathlib import Path
import logging
from typing import Tuple, Optional

logger = logging.getLogger(__name__)


def preprocess_handwritten_music(
    input_path: str,
    output_dir: str,
    apply_smoothing: bool = True,
    apply_alignment: bool = True,
    apply_normalization: bool = True,
    smoothing_strength: int = 2
) -> str:
    """
    Main preprocessing pipeline for handwritten music notation.
    
    Args:
        input_path: Path to input image
        output_dir: Directory to save processed image
        apply_smoothing: Enable smoothing algorithms
        apply_alignment: Enable alignment correction
        apply_normalization: Enable normalization
        smoothing_strength: Smoothing intensity (1-5)
    
    Returns:
        Path to processed image
    """
    logger.info(f"Loading image: {input_path}")
    
    # Load image
    image = cv2.imread(input_path)
    if image is None:
        raise ValueError(f"Failed to load image: {input_path}")
    
    original_image = image.copy()
    
    # Convert to grayscale for processing
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Step 1: Normalization (do this first for better results)
    if apply_normalization:
        logger.info("Applying normalization...")
        gray = normalize_image(gray)
    
    # Step 2: Alignment (straighten staff lines)
    if apply_alignment:
        logger.info("Applying alignment...")
        gray = align_staff_lines(gray)
    
    # Step 3: Smoothing (clean up noise and hand-drawn imperfections)
    if apply_smoothing:
        logger.info(f"Applying smoothing (strength: {smoothing_strength})...")
        gray = smooth_handwritten_notation(gray, strength=smoothing_strength)
    
    # Step 4: Binarization (convert to black and white for better OMR)
    logger.info("Applying adaptive binarization...")
    processed = binarize_image(gray)
    
    # Step 5: Staff line enhancement
    logger.info("Enhancing staff lines...")
    processed = enhance_staff_lines(processed)
    
    # Step 6: Remove small noise
    logger.info("Removing noise...")
    processed = remove_small_noise(processed)
    
    # Save processed image
    output_path = Path(output_dir) / f"preprocessed_{Path(input_path).name}"
    cv2.imwrite(str(output_path), processed)
    
    logger.info(f"Preprocessing complete: {output_path}")
    return str(output_path)


def normalize_image(image: np.ndarray) -> np.ndarray:
    """
    Normalize image contrast and brightness.
    Uses CLAHE (Contrast Limited Adaptive Histogram Equalization).
    """
    # Apply CLAHE for better local contrast
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    normalized = clahe.apply(image)
    
    # Normalize intensity range
    normalized = cv2.normalize(normalized, None, 0, 255, cv2.NORM_MINMAX)
    
    return normalized


def align_staff_lines(image: np.ndarray) -> np.ndarray:
    """
    Detect and correct rotation to align staff lines horizontally.
    Uses Hough Line Transform to detect dominant line angle.
    """
    # Edge detection for line detection
    edges = cv2.Canny(image, 50, 150, apertureSize=3)
    
    # Hough Line Transform to detect lines
    lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=np.pi/180,
        threshold=100,
        minLineLength=100,
        maxLineGap=10
    )
    
    if lines is None or len(lines) == 0:
        logger.warning("No lines detected for alignment")
        return image
    
    # Calculate angles of detected lines
    angles = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
        # Filter out vertical lines (we want horizontal staff lines)
        if -45 < angle < 45:
            angles.append(angle)
    
    if not angles:
        logger.warning("No horizontal lines detected")
        return image
    
    # Calculate median angle for robustness
    median_angle = np.median(angles)
    logger.info(f"Detected rotation angle: {median_angle:.2f} degrees")
    
    # Only rotate if angle is significant (> 0.5 degrees)
    if abs(median_angle) > 0.5:
        # Rotate image to correct alignment
        height, width = image.shape
        center = (width // 2, height // 2)
        rotation_matrix = cv2.getRotationMatrix2D(center, median_angle, 1.0)
        
        # Calculate new dimensions to avoid cropping
        cos = np.abs(rotation_matrix[0, 0])
        sin = np.abs(rotation_matrix[0, 1])
        new_width = int((height * sin) + (width * cos))
        new_height = int((height * cos) + (width * sin))
        
        # Adjust rotation matrix for new dimensions
        rotation_matrix[0, 2] += (new_width / 2) - center[0]
        rotation_matrix[1, 2] += (new_height / 2) - center[1]
        
        rotated = cv2.warpAffine(
            image,
            rotation_matrix,
            (new_width, new_height),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE
        )
        
        logger.info("Image rotation applied")
        return rotated
    
    return image


def smooth_handwritten_notation(image: np.ndarray, strength: int = 2) -> np.ndarray:
    """
    Smooth hand-drawn lines while preserving musical notation structure.
    
    Args:
        image: Input grayscale image
        strength: Smoothing strength (1-5)
    
    Returns:
        Smoothed image
    """
    # Clamp strength to valid range
    strength = max(1, min(5, strength))
    
    # Calculate kernel size based on strength
    kernel_size = 2 * strength + 1
    
    # Apply bilateral filter to smooth while preserving edges
    # This is crucial for handwritten notation
    smoothed = cv2.bilateralFilter(
        image,
        d=kernel_size,
        sigmaColor=75 + (strength * 10),
        sigmaSpace=75 + (strength * 10)
    )
    
    # Apply morphological operations to clean up lines
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    
    # Close small gaps in lines
    smoothed = cv2.morphologyEx(smoothed, cv2.MORPH_CLOSE, kernel)
    
    # Optional: Apply mild Gaussian blur for additional smoothing
    if strength >= 3:
        smoothed = cv2.GaussianBlur(smoothed, (3, 3), 0)
    
    return smoothed


def binarize_image(image: np.ndarray) -> np.ndarray:
    """
    Convert to binary (black and white) using adaptive thresholding.
    This works better for handwritten notation with varying lighting.
    """
    # Apply adaptive thresholding
    binary = cv2.adaptiveThreshold(
        image,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=15,
        C=8
    )
    
    # Invert if needed (OMR expects black notation on white background)
    # Check which color is more dominant
    white_pixels = np.sum(binary == 255)
    black_pixels = np.sum(binary == 0)
    
    if black_pixels > white_pixels:
        # Image is inverted (white on black), so invert it
        binary = cv2.bitwise_not(binary)
    
    return binary


def enhance_staff_lines(image: np.ndarray) -> np.ndarray:
    """
    Enhance and strengthen staff lines for better recognition.
    """
    # Create kernel for horizontal line detection
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    
    # Detect horizontal lines (staff lines)
    detected_lines = cv2.morphologyEx(
        image,
        cv2.MORPH_OPEN,
        horizontal_kernel,
        iterations=2
    )
    
    # Strengthen detected staff lines
    # Use a weighted addition to enhance staff lines
    enhanced = cv2.addWeighted(image, 0.7, detected_lines, 0.3, 0)
    
    return enhanced


def remove_small_noise(image: np.ndarray, min_size: int = 5) -> np.ndarray:
    """
    Remove small isolated noise pixels that might interfere with OMR.
    """
    # Find connected components
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(
        cv2.bitwise_not(image),
        connectivity=8
    )
    
    # Create output image
    cleaned = image.copy()
    
    # Remove small components (noise)
    for i in range(1, num_labels):  # Skip background (label 0)
        area = stats[i, cv2.CC_STAT_AREA]
        if area < min_size:
            # Remove this component
            cleaned[labels == i] = 255
    
    return cleaned


def estimate_staff_line_spacing(image: np.ndarray) -> Optional[int]:
    """
    Estimate the spacing between staff lines.
    Useful for scaling and normalization.
    """
    # Use horizontal projection to find staff lines
    horizontal_projection = np.sum(image == 0, axis=1)
    
    # Find peaks (staff lines)
    from scipy.signal import find_peaks
    peaks, _ = find_peaks(horizontal_projection, distance=5, prominence=50)
    
    if len(peaks) < 2:
        return None
    
    # Calculate average spacing
    spacings = np.diff(peaks)
    avg_spacing = np.median(spacings)
    
    logger.info(f"Estimated staff line spacing: {avg_spacing:.1f} pixels")
    return int(avg_spacing)


def scale_to_standard_size(image: np.ndarray, target_spacing: int = 20) -> np.ndarray:
    """
    Scale image so that staff line spacing matches a standard size.
    This helps Audiveris achieve better recognition.
    """
    current_spacing = estimate_staff_line_spacing(image)
    
    if current_spacing is None or current_spacing == 0:
        logger.warning("Could not estimate staff spacing, skipping scaling")
        return image
    
    scale_factor = target_spacing / current_spacing
    
    if 0.8 < scale_factor < 1.2:
        # Spacing is already close to target, no need to scale
        return image
    
    # Resize image
    height, width = image.shape[:2]
    new_width = int(width * scale_factor)
    new_height = int(height * scale_factor)
    
    scaled = cv2.resize(
        image,
        (new_width, new_height),
        interpolation=cv2.INTER_CUBIC if scale_factor > 1 else cv2.INTER_AREA
    )
    
    logger.info(f"Scaled image by factor {scale_factor:.2f}")
    return scaled
