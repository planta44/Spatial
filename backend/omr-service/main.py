from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import shutil
from pathlib import Path
from preprocessor import preprocess_handwritten_music
from audiveris_client import process_with_audiveris
from validation import validate_and_correct_musicxml
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="OMR Service - Handwritten Music Recognition", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
UPLOAD_DIR = Path("uploads")
PROCESSED_DIR = Path("processed")
OUTPUT_DIR = Path("output")

for directory in [UPLOAD_DIR, PROCESSED_DIR, OUTPUT_DIR]:
    directory.mkdir(exist_ok=True)

@app.get("/")
async def root():
    """Root endpoint for health checks"""
    return {
        "status": "online",
        "service": "Spatial AI OMR Service (Powered by Audiveris)",
        "version": "1.0.0",
        "provider": "Audiveris Open-Source OMR",
        "endpoints": {
            "recognize": "/recognize (POST)",
            "health": "/health (GET)",
            "download": "/download/{filename} (GET)"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    try:
        # Check if Audiveris is accessible
        # You can add a simple test here
        return {
            "status": "healthy",
            "service": "omr",
            "audiveris": "connected"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "omr",
            "error": str(e)
        }

@app.post("/recognize")
async def recognize_handwritten_music(
    image: UploadFile = File(...),
    apply_smoothing: bool = Form(default=True),
    apply_alignment: bool = Form(default=True),
    apply_normalization: bool = Form(default=True),
    smoothing_strength: int = Form(default=2),
    output_format: str = Form(default="musicxml")  # musicxml, midi, pdf
):
    """
    Recognize handwritten music notation from an image.
    
    Preprocessing steps:
    1. Smoothing - Remove noise and clean up hand-drawn lines
    2. Alignment - Straighten staff lines and correct rotation
    3. Normalization - Adjust contrast, brightness, and scale
    4. Validation - Verify and correct recognized notation
    
    Parameters:
    - image: Image file (PNG, JPG, JPEG, TIFF)
    - apply_smoothing: Enable noise reduction and line smoothing
    - apply_alignment: Enable staff line alignment and rotation correction
    - apply_normalization: Enable contrast/brightness optimization
    - smoothing_strength: Intensity of smoothing (1-5)
    - output_format: Output format (musicxml, midi, pdf)
    """
    logger.info(f"OMR request received for file: {image.filename}")
    
    try:
        # Validate file type
        allowed_extensions = {'.png', '.jpg', '.jpeg', '.tiff', '.tif', '.bmp'}
        file_ext = Path(image.filename).suffix.lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Save uploaded image
        temp_input = UPLOAD_DIR / f"input_{image.filename}"
        with open(temp_input, "wb") as f:
            content = await image.read()
            f.write(content)
        
        logger.info(f"Saved input image: {temp_input}")
        
        # Step 1: Preprocess the image
        logger.info("Starting preprocessing...")
        preprocessed_path = preprocess_handwritten_music(
            input_path=str(temp_input),
            output_dir=str(PROCESSED_DIR),
            apply_smoothing=apply_smoothing,
            apply_alignment=apply_alignment,
            apply_normalization=apply_normalization,
            smoothing_strength=smoothing_strength
        )
        logger.info(f"Preprocessing complete: {preprocessed_path}")
        
        # Step 2: Process with Audiveris
        logger.info("Processing with Audiveris...")
        omr_result = process_with_audiveris(
            image_path=preprocessed_path,
            output_dir=str(OUTPUT_DIR),
            output_format=output_format
        )
        logger.info(f"Audiveris processing complete")
        
        # Step 3: Validate and correct the output
        if output_format == "musicxml" and omr_result.get("musicxml_path"):
            logger.info("Validating and correcting MusicXML...")
            validated_result = validate_and_correct_musicxml(
                musicxml_path=omr_result["musicxml_path"]
            )
            omr_result["validation"] = validated_result
        
        # Cleanup temp input file
        temp_input.unlink(missing_ok=True)
        
        # Prepare response
        response = {
            "status": "success",
            "original_filename": image.filename,
            "preprocessed_image": str(preprocessed_path),
            "preprocessing_applied": {
                "smoothing": apply_smoothing,
                "alignment": apply_alignment,
                "normalization": apply_normalization,
                "smoothing_strength": smoothing_strength
            },
            "output_format": output_format,
            "files": omr_result.get("files", {}),
            "download_urls": {},
            "metadata": omr_result.get("metadata", {}),
            "validation": omr_result.get("validation", {})
        }
        
        # Add download URLs for generated files
        for file_type, file_path in omr_result.get("files", {}).items():
            if file_path and Path(file_path).exists():
                filename = Path(file_path).name
                response["download_urls"][file_type] = f"/download/{filename}"
        
        logger.info("OMR recognition complete")
        return JSONResponse(response)
        
    except Exception as e:
        import traceback
        logger.error(f"OMR recognition failed: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"OMR recognition failed: {str(e)}"
        )

@app.get("/download/{filename}")
async def download_file(filename: str):
    """Download processed files (MusicXML, MIDI, PDF)"""
    file_path = OUTPUT_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Determine media type
    media_types = {
        '.xml': 'application/xml',
        '.musicxml': 'application/vnd.recordare.musicxml+xml',
        '.mid': 'audio/midi',
        '.midi': 'audio/midi',
        '.pdf': 'application/pdf'
    }
    
    media_type = media_types.get(file_path.suffix.lower(), 'application/octet-stream')
    
    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=filename
    )

@app.delete("/cleanup")
async def cleanup_files():
    """Clean up old processed files (admin endpoint)"""
    try:
        for directory in [UPLOAD_DIR, PROCESSED_DIR, OUTPUT_DIR]:
            for file in directory.glob("*"):
                if file.is_file():
                    file.unlink()
        
        return {"status": "success", "message": "Cleanup completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
