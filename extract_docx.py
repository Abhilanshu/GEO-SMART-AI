import zipfile
import xml.etree.ElementTree as ET
import os
import sys

# Set encoding for output to handle emojis
sys.stdout.reconfigure(encoding='utf-8')

def get_docx_text(path):
    if not os.path.exists(path):
        return f"File not found: {path}"
    try:
        with zipfile.ZipFile(path, 'r') as z:
            xml_content = z.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        paragraphs = []
        for p in tree.findall('.//w:p', namespace):
            texts = [node.text for node in p.findall('.//w:t', namespace) if node.text]
            if texts:
                paragraphs.append("".join(texts))
        return "\n".join(paragraphs)
    except Exception as e:
        return f"Error reading docx: {e}"

def get_pptx_text(path):
    if not os.path.exists(path):
        return f"File not found: {path}"
    try:
        text_content = []
        with zipfile.ZipFile(path, 'r') as z:
            # Slides are named slide1.xml, slide2.xml, etc.
            slide_files = sorted([f for f in z.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')])
            for slide_file in slide_files:
                xml_content = z.read(slide_file)
                tree = ET.fromstring(xml_content)
                namespace = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
                texts = [node.text for node in tree.findall('.//a:t', namespace) if node.text]
                if texts:
                    text_content.append(f"--- Slide {slide_file} ---\n" + "\n".join(texts))
        return "\n\n".join(text_content)
    except Exception as e:
        return f"Error reading pptx: {e}"

files = [
    r"C:\Users\ASUS\Downloads\GeoSmart_AI_Actionable_Intelligence_Blueprint.pptx",
    r"C:\Users\ASUS\Downloads\GeoSmart_AI_Mission_Control.pptx",
    r"C:\Users\ASUS\Downloads\Google_AI_Technical_Blueprint.pptx",
    r"C:\Users\ASUS\Downloads\GeoSmart_AI_Solution_Challenge_2026.pptx",
    r"C:\Users\ASUS\Downloads\Now THIS is a proper winning build 🔥.docx"
]

with open("extracted_content.md", "w", encoding="utf-8") as out:
    for f in files:
        out.write(f"# File: {os.path.basename(f)}\n\n")
        if f.endswith(".docx"):
            out.write(get_docx_text(f))
        elif f.endswith(".pptx"):
            out.write(get_pptx_text(f))
        out.write("\n\n---\n\n")

print("Extraction complete. See extracted_content.md")
