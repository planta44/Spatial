"""
Test client for OMR Service
Demonstrates how to use the handwritten music recognition API
"""

import requests
import sys
from pathlib import Path


def test_omr_service(
    image_path: str,
    service_url: str = "http://localhost:8001",
    smoothing: bool = True,
    smoothing_strength: int = 3,
    output_format: str = "musicxml"
):
    """
    Test the OMR service with a handwritten music image.
    
    Args:
        image_path: Path to the handwritten music image
        service_url: URL of the OMR service
        smoothing: Enable smoothing preprocessing
        smoothing_strength: Smoothing intensity (1-5)
        output_format: Desired output format (musicxml, midi, pdf)
    """
    print(f"🎵 Testing OMR Service with: {image_path}")
    print(f"📡 Service URL: {service_url}")
    print(f"⚙️  Settings: smoothing={smoothing}, strength={smoothing_strength}, format={output_format}")
    print("-" * 60)
    
    # Check if service is healthy
    try:
        health_response = requests.get(f"{service_url}/health", timeout=5)
        if health_response.status_code == 200:
            print("✅ Service is healthy")
            print(f"   {health_response.json()}")
        else:
            print(f"⚠️  Service health check failed: {health_response.status_code}")
    except Exception as e:
        print(f"❌ Cannot connect to service: {e}")
        return
    
    print("-" * 60)
    
    # Check if image file exists
    if not Path(image_path).exists():
        print(f"❌ Image file not found: {image_path}")
        return
    
    # Prepare request
    files = {
        'image': open(image_path, 'rb')
    }
    
    data = {
        'apply_smoothing': str(smoothing).lower(),
        'apply_alignment': 'true',
        'apply_normalization': 'true',
        'smoothing_strength': str(smoothing_strength),
        'output_format': output_format
    }
    
    print("🚀 Uploading image and processing...")
    
    try:
        # Send request
        response = requests.post(
            f"{service_url}/recognize",
            files=files,
            data=data,
            timeout=120  # 2 minute timeout for processing
        )
        
        files['image'].close()
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Processing successful!")
            print("-" * 60)
            
            # Print preprocessing info
            print("📊 Preprocessing Applied:")
            for key, value in result.get('preprocessing_applied', {}).items():
                print(f"   • {key}: {value}")
            
            print("-" * 60)
            
            # Print metadata
            metadata = result.get('metadata', {})
            if metadata:
                print("🎼 Music Metadata:")
                for key, value in metadata.items():
                    if value:
                        print(f"   • {key}: {value}")
            
            print("-" * 60)
            
            # Print validation results
            validation = result.get('validation', {})
            if validation:
                print(f"🔍 Validation Status: {validation.get('status', 'unknown')}")
                
                errors = validation.get('errors', [])
                if errors:
                    print(f"   ❌ Errors ({len(errors)}):")
                    for error in errors[:5]:  # Show first 5
                        print(f"      • {error}")
                
                warnings = validation.get('warnings', [])
                if warnings:
                    print(f"   ⚠️  Warnings ({len(warnings)}):")
                    for warning in warnings[:5]:  # Show first 5
                        print(f"      • {warning}")
                
                stats = validation.get('statistics', {})
                if stats:
                    print(f"   📈 Statistics:")
                    for key, value in stats.items():
                        if not isinstance(value, list):
                            print(f"      • {key}: {value}")
            
            print("-" * 60)
            
            # Print download URLs
            download_urls = result.get('download_urls', {})
            if download_urls:
                print("⬇️  Download URLs:")
                for file_type, url in download_urls.items():
                    full_url = f"{service_url}{url}"
                    print(f"   • {file_type.upper()}: {full_url}")
                
                # Optionally download files
                print("\n💾 Downloading files...")
                for file_type, url in download_urls.items():
                    try:
                        download_url = f"{service_url}{url}"
                        filename = f"output_{Path(image_path).stem}_{file_type}.{file_type}"
                        
                        dl_response = requests.get(download_url, timeout=30)
                        if dl_response.status_code == 200:
                            with open(filename, 'wb') as f:
                                f.write(dl_response.content)
                            print(f"   ✅ Downloaded: {filename}")
                        else:
                            print(f"   ❌ Failed to download {file_type}")
                    except Exception as e:
                        print(f"   ❌ Error downloading {file_type}: {e}")
            
            print("-" * 60)
            print("✨ All done!")
            
        else:
            print(f"❌ Processing failed with status {response.status_code}")
            try:
                error_detail = response.json()
                print(f"   Error: {error_detail}")
            except:
                print(f"   Response: {response.text}")
    
    except requests.exceptions.Timeout:
        print("❌ Request timed out (processing took > 2 minutes)")
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        import traceback
        traceback.print_exc()


def main():
    """Main function to run the test client."""
    if len(sys.argv) < 2:
        print("Usage: python test_client.py <image_path> [service_url] [smoothing_strength]")
        print("\nExamples:")
        print("  python test_client.py handwritten_music.png")
        print("  python test_client.py handwritten_music.png http://localhost:8001")
        print("  python test_client.py handwritten_music.png http://localhost:8001 4")
        sys.exit(1)
    
    image_path = sys.argv[1]
    service_url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8001"
    smoothing_strength = int(sys.argv[3]) if len(sys.argv) > 3 else 3
    
    test_omr_service(
        image_path=image_path,
        service_url=service_url,
        smoothing_strength=smoothing_strength
    )


if __name__ == "__main__":
    main()
