from fastapi import APIRouter, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional, List
import re
import io
try:
    from PIL import Image
    import pytesseract
except ImportError:
    pass
import requests
from bs4 import BeautifulSoup
from urllib.parse import unquote
import xml.etree.ElementTree as ET

router = APIRouter()

class SearchResult(BaseModel):
    title: str
    link: str

class AnalyzeResponse(BaseModel):
    eventId: str
    provider: str
    description: str
    searchResults: List[SearchResult]

@router.post("/", response_model=AnalyzeResponse)
async def submit_analysis(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    event_id = "Unknown"
    provider = "Unknown"
    description = ""
    
    # Process File if uploaded
    if file:
        content = await file.read()
        if file.content_type and file.content_type.startswith('image/'):
            try:
                img = Image.open(io.BytesIO(content))
                # Note: Windows users might need to configure tesseract_cmd path 
                # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
                extracted_text = pytesseract.image_to_string(img)
                description = f"(Extracted from Image)\n{extracted_text}"
                text = (text or "") + "\n" + extracted_text
            except Exception as e:
                description = f"OCR Failed: {str(e)}. Please ensure Tesseract-OCR is installed on your system."
        elif file.filename.endswith('.xml'):
            try:
                root = ET.fromstring(content)
                # Simple XML extraction (assuming standard Windows Event XML)
                # This is a basic mock extraction for XML
                description = f"Parsed XML file: {file.filename}"
                text = (text or "") + "\n" + content.decode('utf-8', errors='ignore')
            except Exception as e:
                description = f"XML Parse Failed: {str(e)}"
        else:
            # Fallback for plain text or evtx (as raw string search)
            description = f"Uploaded file: {file.filename}"
            text = (text or "") + "\n" + content.decode('utf-8', errors='ignore')
    
    if not description and text:
        description = "Submitted via Text"

    if text:
        match_id = re.search(r'Event ID[:\s]+(\d+)', text, re.IGNORECASE)
        if match_id:
            event_id = match_id.group(1)
        
        match_source = re.search(r'Source[:\s]+([a-zA-Z0-9\-]+)', text, re.IGNORECASE)
        if match_source:
            provider = match_source.group(1)

    search_query = f'Windows Event ID {event_id} {provider} solution'
    results = []
    
    try:
        # Scrape DuckDuckGo HTML version directly
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        res = requests.get(f'https://html.duckduckgo.com/html/?q={requests.utils.quote(search_query)}', headers=headers, timeout=5)
        soup = BeautifulSoup(res.text, 'html.parser')
        
        links = soup.select('.result__url')
        titles = soup.select('.result__title')
        
        for i in range(min(3, len(links))):
            raw_url = links[i].get('href', '')
            # DuckDuckGo wraps urls in /l/?uddg=...
            if 'uddg=' in raw_url:
                real_url = unquote(raw_url.split('uddg=')[1].split('&')[0])
            else:
                real_url = raw_url
                
            # Fallback title if unavailable
            title_text = titles[i].text.strip() if i < len(titles) else real_url
            results.append(SearchResult(title=title_text, link=real_url))
            
    except Exception as e:
        results.append(SearchResult(title="Error during search", link=str(e)))

    # Fallback if empty
    if not results:
        results.append(SearchResult(title=f"Search for {event_id} on Microsoft", link=f"https://learn.microsoft.com/en-us/search/?terms={event_id}"))

    return AnalyzeResponse(
        eventId=event_id,
        provider=provider,
        description=description,
        searchResults=results
    )
