import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
import pypdf

PDF_OUTPUT_PATH = os.path.abspath("AI_Virtual_Fashion_TryOn_Project_Report.pdf")

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages 2 to 5)
        if self._pageNumber > 1:
            self.drawString(18 * mm, 287 * mm, "AI-Powered Virtual Fashion Try-On Website — Engineering Project Report")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(18 * mm, 284 * mm, 192 * mm, 284 * mm)
            
        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(18 * mm, 15 * mm, 192 * mm, 15 * mm)
        self.drawString(18 * mm, 11 * mm, "CONFIDENTIAL & PROPRIETARY — ACADEMIC & TECHNICAL ARCHITECTURE")
        self.drawRightString(192 * mm, 11 * mm, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf():
    # Target exact 5 pages: 18mm left/right margins, 18mm top/bottom
    doc = SimpleDocTemplate(
        PDF_OUTPUT_PATH,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm
    )

    styles = getSampleStyleSheet()
    
    # Custom Typography Palette
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#0284C7'),
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=8,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.3,
        leading=11.3,
        textColor=colors.HexColor('#334155'),
        spaceAfter=4.5
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11,
        textColor=colors.HexColor('#334155'),
        leftIndent=12,
        firstLineIndent=-7,
        spaceAfter=2.5
    )

    meta_callout_style = ParagraphStyle(
        'MetaCallout',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#475569')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=9.8,
        textColor=colors.HexColor('#1E293B')
    )

    table_cell_code = ParagraphStyle(
        'TableCellCode',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=9.8,
        textColor=colors.HexColor('#0284C7')
    )

    story = []

    # ==========================================
    # PAGE 1: INTRODUCTION AND ABSTRACT
    # ==========================================
    story.append(Paragraph("AI-POWERED VIRTUAL FASHION TRY-ON WEBSITE", title_style))
    story.append(Paragraph("Full-Stack Architectural Design, Computer Vision Pipeline & Neural Fabric Simulation", subtitle_style))
    
    # Metadata Info Box
    meta_data = [
        [
            Paragraph("<b>Project Domain:</b> E-Commerce / Computer Vision / AR", meta_callout_style),
            Paragraph("<b>Target Platform:</b> Cross-Device Web (Desktop & Mobile)", meta_callout_style)
        ],
        [
            Paragraph("<b>Core Frameworks:</b> FastAPI (Python) & Vite (Vanilla ES6+)", meta_callout_style),
            Paragraph("<b>Vision Stack:</b> MediaPipe Pose, OpenCV & IDM-VTON", meta_callout_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[87 * mm, 87 * mm])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("1. Introduction and Abstract", h1_style))
    story.append(Paragraph(
        "<b>1.1 Executive Summary & Abstract:</b> The digital apparel industry continues to confront substantial hurdles "
        "originating from consumer hesitation and excessive product return frequencies, predominantly triggered by the visual disconnection "
        "between two-dimensional catalogue photography and personalized garment fit. This project delivers an enterprise-grade, "
        "<b>AI-Powered Virtual Fashion Try-On & Augmented Reality Atelier Studio</b> named <b>VERVE AR</b>. Built upon an asynchronous "
        "FastAPI Python micro-backend and a high-performance Vanilla JavaScript/CSS frontend bundled via Vite, the system seamlessly unifies "
        "two distinct interactive experiences: (1) <i>Live Webcam Augmented Reality Mirror</i> running real-time 60 FPS skeletal body tracking, "
        "and (2) <i>Photorealistic AI Virtual Try-On</i> operating state-of-the-art neural diffusion draping with an automatic local OpenCV fallback. "
        "Additionally, the platform incorporates real-time anatomical body dimension estimation (chest, torso, waist, shoulder span) and automated "
        "custom garment cataloguing with AI vision extraction.",
        body_style
    ))

    story.append(Paragraph("1.2 Problem Statement", h2_style))
    story.append(Paragraph(
        "Modern online e-commerce platforms suffer from acute operational and technical limitations that impair customer conversion:",
        body_style
    ))
    story.append(Paragraph("• <b>High Return Rates:</b> In e-commerce fashion, up to 30-40% of ordered garments are returned due to sizing discrepancy, poor draping alignment, or mismatched customer expectations.", bullet_style))
    story.append(Paragraph("• <b>Flat Catalogue Visuals:</b> Conventional studio catalogue cards show static flat-lay shirts or standardized mannequin portraits, failing to represent unique customer postures, identities, and body types.", bullet_style))
    story.append(Paragraph("• <b>Computational Latency & Fragility:</b> Heavy neural diffusion models frequently hit GPU quota barriers, while browser-based AR solutions introduce severe jitter or horizontal aspect-ratio distortion when handling variable phone camera feeds.", bullet_style))
    story.append(Paragraph("• <b>Lack of Mobile Optimization:</b> Many complex web try-on applications fail completely on touchscreens, suffering from overlapping viewports, frozen camera streams, and unresponsiveness.", bullet_style))

    story.append(Paragraph("1.3 Objectives & Purpose", h2_style))
    story.append(Paragraph(
        "The project was designed to address these problems through rigorous software engineering and computer vision paradigms:",
        body_style
    ))
    story.append(Paragraph("• <b>Identity-Preserving Photorealistic Try-On:</b> Synthesize garments onto genuine user-uploaded photographs or camera snapshots while preserving facial facial hair, jawlines, skin tones, postures, and backgrounds with zero distortion.", bullet_style))
    story.append(Paragraph("• <b>Real-Time 60 FPS AR Draping:</b> Track 33 keypoints using Google MediaPipe Pose directly in client-side WebAssembly, applying Exponential Moving Average (EMA) filtering for jitter-free real-time live video draping.", bullet_style))
    story.append(Paragraph("• <b>High-Availability Resilient AI Pipeline:</b> Couple state-of-the-art cloud diffusion (IDM-VTON) with a robust deterministic local OpenCV mathematical warp engine to ensure continuous service availability regardless of cloud token quotas.", bullet_style))
    story.append(Paragraph("• <b>Zero-Friction Mobile Adaptation:</b> Provide a dedicated, touch-optimized responsive layout featuring multi-camera lens flipping, swipeable garment selectors, and dynamic viewport scaling across Android and iOS smartphones.", bullet_style))

    story.append(PageBreak())

    # ==========================================
    # PAGE 2: TECHNOLOGIES USED
    # ==========================================
    story.append(Paragraph("2. Technologies Used", h1_style))
    story.append(Paragraph(
        "The technology stack was selected to achieve optimal computational separation between real-time client-side rendering "
        "and intensive server-side computer vision inference. Every listed framework, library, and tool exists and operates directly in the codebase:",
        body_style
    ))

    tech_data = [
        [Paragraph("Category", table_header_style), Paragraph("Technology / Library", table_header_style), Paragraph("Exact Role & Implementation Scope in Project", table_header_style)],
        
        [
            Paragraph("Backend Framework", table_cell_style),
            Paragraph("FastAPI 0.110+ (Python 3.11)", table_cell_code),
            Paragraph("Asynchronous ASGI web server hosting REST endpoints (/api/garments, /api/tryon, /api/garments/process, /api/garments/save) with CORS middleware.", table_cell_style)
        ],
        [
            Paragraph("ASGI Server", table_cell_style),
            Paragraph("Uvicorn 0.28+", table_cell_code),
            Paragraph("High-performance lightning-fast ASGI server managing concurrent HTTP request cycles and multi-part image uploads.", table_cell_style)
        ],
        [
            Paragraph("Computer Vision", table_cell_style),
            Paragraph("OpenCV (Headless 4.9+)", table_cell_code),
            Paragraph("Executes Haar-cascade facial detection, bilateral contour matting, GrabCut segmentation, alpha masking, Lanczos-4 resampling, and anatomical warp math.", table_cell_style)
        ],
        [
            Paragraph("Numerical & Matrix", table_cell_style),
            Paragraph("NumPy 1.26+", table_cell_code),
            Paragraph("High-speed N-dimensional array manipulations, color distance delta calculations, 3D alpha compositing, and landmark coordinates transformations.", table_cell_style)
        ],
        [
            Paragraph("Image Processing", table_cell_style),
            Paragraph("Pillow (PIL 10.2+)", table_cell_code),
            Paragraph("Image format conversions, buffer stream serialization, base64 payload decoding, and pre-processing pipeline handoffs.", table_cell_style)
        ],
        [
            Paragraph("Schema Validation", table_cell_style),
            Paragraph("Pydantic 2.6+", table_cell_code),
            Paragraph("Validates JSON payload schemas for garment persistence, catalog attribute definitions, and API response typing.", table_cell_style)
        ],
        [
            Paragraph("Diffusion Client", table_cell_style),
            Paragraph("Gradio Client 0.17+", table_cell_code),
            Paragraph("Remote API client communicating with HuggingFace ZeroGPU hosting the IDM-VTON virtual try-on neural diffusion pipeline.", table_cell_style)
        ],
        [
            Paragraph("Multimodal AI", table_cell_style),
            Paragraph("Google GenAI (Gemini SDK)", table_cell_code),
            Paragraph("Utilizes Gemini Vision to analyze user-uploaded garment images, automatically extracting fabric, style, tagline, and descriptive metadata.", table_cell_style)
        ],
        [
            Paragraph("Frontend Bundler", table_cell_style),
            Paragraph("Vite 8.3+", table_cell_code),
            Paragraph("Next-generation lightning-fast frontend dev server and production builder with Hot Module Replacement (HMR) and optimized rollup chunking.", table_cell_style)
        ],
        [
            Paragraph("Frontend Logic", table_cell_style),
            Paragraph("Vanilla ES6+ JavaScript", table_cell_code),
            Paragraph("Lightweight, reactive state machine without heavy virtual-DOM overhead, driving dynamic canvas 2D loops and asynchronous REST requests.", table_cell_style)
        ],
        [
            Paragraph("Styling System", table_cell_style),
            Paragraph("Vanilla Modern CSS3", table_cell_code),
            Paragraph("Atelier haute-couture luxury design system with HSL variables, glassmorphic blurs, responsive flex/grid layouts, and mobile media queries.", table_cell_style)
        ],
        [
            Paragraph("Body Landmark AR", table_cell_style),
            Paragraph("Google MediaPipe Pose", table_cell_code),
            Paragraph("WebAssembly/JS pose tracking yielding 33 anatomical 3D landmarks for real-time live webcam orientation, shoulder span, and yaw estimation.", table_cell_style)
        ],
        [
            Paragraph("3D Graphics Engine", table_cell_style),
            Paragraph("Three.js 0.186+", table_cell_code),
            Paragraph("WebGL rendering engine generating an anatomical 3D studio avatar with PBR skin shaders, directional studio lighting, and interactive orbital rotation.", table_cell_style)
        ],
        [
            Paragraph("Media Devices API", table_cell_style),
            Paragraph("Web Navigator MediaDevices", table_cell_code),
            Paragraph("HTML5 getUserMedia API managing video stream lifecycles, resolution constraints (1280x720), and dual-facingMode front/rear camera lens switching.", table_cell_style)
        ],
    ]

    tech_table = Table(tech_data, colWidths=[30 * mm, 45 * mm, 99 * mm])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("2.1 Computational Strategy & Separation of Concerns", h2_style))
    story.append(Paragraph(
        "By intentionally avoiding heavy client-side UI frameworks (such as React or Angular), the frontend runtime thread is completely "
        "dedicated to the 60 FPS HTML5 Canvas rendering loop and MediaPipe WebAssembly calculations. Complex OpenCV image segmentation, "
        "diffusion model inference, and multimodal product cataloguing are safely offloaded to the asynchronous Python backend.",
        body_style
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 3: SYSTEM ARCHITECTURE AND WORKFLOW
    # ==========================================
    story.append(Paragraph("3. System Architecture and Workflow", h1_style))
    story.append(Paragraph(
        "The system architecture employs an event-driven decoupled client-server model designed for maximum responsiveness, high frame rates, "
        "and zero photo distortion. The diagram and flow descriptions below illustrate the system data pipeline:",
        body_style
    ))

    # Architecture Overview Table/Box
    arch_flow_data = [
        [Paragraph("Layer", table_header_style), Paragraph("Component", table_header_style), Paragraph("Functional Responsibilities", table_header_style)],
        [
            Paragraph("Client Layer", table_cell_style),
            Paragraph("Vite SPA Runtime<br/>(main.js, style.css)", table_cell_code),
            Paragraph("Manages client UI state, responsive breakpoints, HTML5 video capture, modal management, drag-and-drop file inputs, and before/after comparison sliders.", table_cell_style)
        ],
        [
            Paragraph("Vision AR Layer", table_cell_style),
            Paragraph("poseDetector.js & arEngine.js", table_cell_code),
            Paragraph("Acquires 33 landmark points from MediaPipe, applies Exponential Moving Average smoothing filter (alpha=0.32), and transforms garment cutout sprites in real-time.", table_cell_style)
        ],
        [
            Paragraph("API Service Layer", table_cell_style),
            Paragraph("FastAPI Microservice (main.py)", table_cell_code),
            Paragraph("Handles multipart/form-data uploads, base64 payload encoding, JSON schemas, exception mapping (HTTP 429 quota handling), and model orchestration.", table_cell_style)
        ],
        [
            Paragraph("Inference Engine", table_cell_style),
            Paragraph("Dual AI Virtual Try-On Pipeline", table_cell_code),
            Paragraph("Primary: IDM-VTON neural diffusion over HuggingFace ZeroGPU. Fallback: Local OpenCV anatomical landmark warp with chin/jawline Gaussian protection ramp.", table_cell_style)
        ],
        [
            Paragraph("3D Avatar Layer", table_cell_style),
            Paragraph("Three.js Studio (avatar3d.js)", table_cell_code),
            Paragraph("Builds a customized 3D mannequin scaled to estimated anatomical body measurements (shoulder breadth, chest, waist, torso) with interactive orbital drag.", table_cell_style)
        ],
    ]
    arch_table = Table(arch_flow_data, colWidths=[28 * mm, 44 * mm, 102 * mm])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("3.1 End-to-End System Workflow Execution", h2_style))
    story.append(Paragraph(
        "<b>Workflow 1: AI Photorealistic Try-On Pipeline</b><br/>"
        "1. <i>Image Input & Ingestion:</i> The user uploads a portrait photo (JPEG/PNG/WebP) or triggers the integrated Live Camera Snapshot modal.<br/>"
        "2. <i>Device Camera Capture & Flip:</i> On smartphones or multi-camera setups, users can flip between front (selfie) and rear cameras, capture a 1280x720 snapshot, and ingest it into the local state without server round-trips.<br/>"
        "3. <i>API Payload Dispatch:</i> Clicking 'Generate Try-On' transmits the portrait binary alongside the selected authentic garment identifier to <code>/api/tryon/photorealistic</code>.<br/>"
        "4. <i>Neural Diffusion Inference:</i> The backend invokes IDM-VTON via Gradio client. The AI inpainting model isolates garment topology, draping the selected linen/flannel over the torso while respecting lighting conditions and fabric creases.<br/>"
        "5. <i>Automated Dimension Normalization:</i> The resulting image is dynamically resized with high-order Lanczos-4 interpolation to ensure its dimensions exactly mirror the original input photograph, completely eliminating aspect-ratio distortion.<br/>"
        "6. <i>Anatomical Measurement Extraction:</i> Facial bounding boxes and shoulder anchors compute calibrated metrics (shoulder breadth, chest circumference, torso length, and waist size).<br/>"
        "7. <i>Client Rendering & Comparison:</i> The frontend receives high-res Base64 representations, rendering a dual-view Before/After inspection toggle.",
        body_style
    ))

    story.append(Paragraph(
        "<b>Workflow 2: Live Webcam AR 60 FPS Mirror</b><br/>"
        "1. <i>Stream Initialization:</i> WebRTC initializes the camera feed at ideal 1280x720 with selectable mirroring.<br/>"
        "2. <i>Landmark Detection:</i> Google MediaPipe Pose processes incoming video frames via WebAssembly, predicting 3D coordinates for nose, shoulders, elbows, and hips.<br/>"
        "3. <i>EMA Filter Smoothing:</i> Raw landmark jitter is attenuated using <code>TorsoSmoother</code> (alpha = 0.32).<br/>"
        "4. <i>Affine Transformation & Canvas Blending:</i> The authentic shirt PNG cutout is translated, rotated along the shoulder angle, and scaled dynamically onto the HTML5 2D canvas at 60 FPS.",
        body_style
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 4: CHALLENGES FACED AND SOLUTIONS
    # ==========================================
    story.append(Paragraph("4. Challenges Faced and Solutions", h1_style))
    story.append(Paragraph(
        "During the engineering and evolution of the platform, several intricate computer vision, responsive layout, and infrastructure challenges were encountered. "
        "The table and detailed analyses below explain how each problem was definitively solved:",
        body_style
    ))

    challenges_summary_data = [
        [Paragraph("Technical Challenge", table_header_style), Paragraph("Underlying Cause", table_header_style), Paragraph("Implemented Engineering Solution", table_header_style)],
        [
            Paragraph("Photo Aspect Ratio Distortion", table_cell_style),
            Paragraph("Diffusion models output fixed 3:4 (768x1024) resolutions while CSS flex layouts forced full width stretching.", table_cell_style),
            Paragraph("Applied width: auto, height: auto, object-fit: contain in CSS, and added backend Lanczos-4 dimension matching.", table_cell_style)
        ],
        [
            Paragraph("Multi-Camera Lens Switching", table_cell_style),
            Paragraph("Mobile smartphones default to front selfie cameras with no mechanism to access rear lenses.", table_cell_style),
            Paragraph("Engineered dedicated Flip Camera button leveraging navigator.mediaDevices constraints with ideal facingMode switching.", table_cell_style)
        ],
        [
            Paragraph("Cloud AI Token Quota Exhaustion", table_cell_style),
            Paragraph("Third-party zero-GPU diffusion spaces impose strict 429 rate and concurrency quotas.", table_cell_style),
            Paragraph("Implemented seamless auto-fallback to local OpenCV anatomical landmark warp engine with user-friendly alerts.", table_cell_style)
        ],
        [
            Paragraph("Mobile UI Collision & Overflow", table_cell_style),
            Paragraph("Desktop two-column studio layout collapsed on smartphones, hiding controls and cropping garment items.", table_cell_style),
            Paragraph("Created a dedicated smartphone breakpoint converting grids into touch-swipe strips and stacking the studio viewport.", table_cell_style)
        ],
        [
            Paragraph("Webcam Pose Tracking Jitter", table_cell_style),
            Paragraph("Frame-to-frame sensor noise in camera feeds caused clothing overlays to tremble erratically.", table_cell_style),
            Paragraph("Integrated an Exponential Moving Average (EMA) mathematical smoother with circular angle interpolation.", table_cell_style)
        ]
    ]
    challenges_table = Table(challenges_summary_data, colWidths=[40 * mm, 54 * mm, 80 * mm])
    challenges_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(challenges_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("4.1 Deep-Dive: Resolution Distortion & Aspect Ratio Preservation", h2_style))
    story.append(Paragraph(
        "<b>The Issue:</b> Standard state-of-the-art virtual try-on diffusion architectures (such as IDM-VTON) are trained on VITON-HD dataset "
        "standards, strictly producing outputs fixed at 768x1024 pixels. When users uploaded high-resolution landscape images or smartphone photos "
        "possessing 9:16 or 4:3 ratios, the inference output returned in 3:4. Furthermore, frontend CSS containers lacked box-sizing boundary constraints, "
        "causing the image element to horizontally compress or stretch.<br/>"
        "<b>The Resolution:</b> Two synchronized solutions were applied: (1) In <code>backend/main.py</code>, upon receiving generated frames from IDM-VTON, "
        "the engine reads the original input dimensions <code>(orig_h, orig_w)</code> and applies Lanczos-4 high-order interpolation to normalize "
        "the output back to the original proportions. (2) In <code>src/style.css</code>, <code>.compare-slider-container</code>, <code>.compare-img-after</code>, "
        "and <code>.clean-preview-img</code> were refactored with <code>object-fit: contain</code>, <code>width: auto</code>, and <code>height: auto</code>, "
        "guaranteeing complete natural visual fidelity on all displays.",
        body_style
    ))

    story.append(Paragraph("4.2 Deep-Dive: Hardware Camera Switching on Mobile Smartphones", h2_style))
    story.append(Paragraph(
        "<b>The Issue:</b> Mobile browsers frequently fail when attempting to switch between front and rear cameras if active video streams are not "
        "properly torn down first, leading to black screens or PermissionDenied exceptions.<br/>"
        "<b>The Resolution:</b> In <code>src/main.js</code>, an asynchronous camera management pipeline was built. When the user taps the <i>Flip Camera</i> button, "
        "the application stops all tracks on the active <code>MediaStream</code> via <code>captureStream.getTracks().forEach(t => t.stop())</code>, nullifies "
        "the video element source, toggles between <code>facingMode: 'user'</code> and <code>facingMode: 'environment'</code>, and re-invokes <code>getUserMedia()</code>. "
        "It includes graceful single-camera detection and fallback recovery if a secondary sensor is absent.",
        body_style
    ))

    story.append(PageBreak())

    # ==========================================
    # PAGE 5: TESTING, RESULTS, LIMITATIONS, ENHANCEMENTS & CONCLUSION
    # ==========================================
    story.append(Paragraph("5. Testing, Results, Limitations, Enhancements & Conclusion", h1_style))
    
    story.append(Paragraph("5.1 Verification and Testing Results", h2_style))
    story.append(Paragraph(
        "The codebase was subjected to systematic verification across functional, responsive, and cross-platform criteria:",
        body_style
    ))

    test_results_data = [
        [Paragraph("Feature Under Test", table_header_style), Paragraph("Test Condition / Viewport", table_header_style), Paragraph("Observed Behavior & Verification Status", table_header_style)],
        [
            Paragraph("Vite Production Compilation", table_cell_style),
            Paragraph("Rollup bundling (vite build)", table_cell_style),
            Paragraph("PASS: 10 modules transformed, 0 syntax/lint errors, clean chunking (pose: 46kB, app: 57kB).", table_cell_style)
        ],
        [
            Paragraph("Aspect Ratio Integrity", table_cell_style),
            Paragraph("Square & Portrait uploads", table_cell_style),
            Paragraph("PASS: Uploaded photos and try-on results display in exact original proportions without horizontal squeezing.", table_cell_style)
        ],
        [
            Paragraph("Live Camera Snap Modal", table_cell_style),
            Paragraph("Desktop Chrome & Mobile", table_cell_style),
            Paragraph("PASS: Modal renders video preview, shutter snap, and dual Flip Mirror & Flip Camera buttons correctly.", table_cell_style)
        ],
        [
            Paragraph("Mobile Layout Breakpoints", table_cell_style),
            Paragraph("375px (iPhone) to 768px (iPad)", table_cell_style),
            Paragraph("PASS: Studio navbar auto-stacks, shirt grid becomes swipeable, and side panel scrolls cleanly with no clipping.", table_cell_style)
        ],
        [
            Paragraph("Local AI Fallback Engine", table_cell_style),
            Paragraph("Simulated 429 quota condition", table_cell_style),
            Paragraph("PASS: System intercepts rate limits and triggers deterministic OpenCV anatomical draping with toast feedback.", table_cell_style)
        ]
    ]
    test_table = Table(test_results_data, colWidths=[42 * mm, 46 * mm, 86 * mm])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')])
    ]))
    story.append(test_table)
    story.append(Spacer(1, 5))

    story.append(Paragraph("5.2 Current System Limitations", h2_style))
    story.append(Paragraph("• <b>Dependence on Public Diffusion Endpoints:</b> High-resolution neural diffusion try-on relies on HuggingFace ZeroGPU Gradio endpoints which can experience intermittent queue latency during global peak traffic hours.", bullet_style))
    story.append(Paragraph("• <b>Upper-Body Garment Focus:</b> The current anatomical landmarking and segmentation algorithms are specialized for overshirts, linen shirts, and flannels, without lower-body (trousers, skirts) draping.", bullet_style))
    story.append(Paragraph("• <b>Complex Lighting Extreme Postures:</b> Extreme side-profile postures (beyond 60-degree yaw) degrade single-camera 2D skeletal tracking accuracy.", bullet_style))

    story.append(Paragraph("5.3 Future Enhancements", h2_style))
    story.append(Paragraph("• <b>Local GPU TensorRT Deployment:</b> Containerize IDM-VTON / CatVTON models directly using ONNX Runtime or NVIDIA TensorRT for sub-second offline server inference without third-party API dependencies.", bullet_style))
    story.append(Paragraph("• <b>Full-Body AR Landmarking:</b> Expand the landmarking pipeline to include hip, knee, and ankle keypoints for two-piece suit and dress simulations.", bullet_style))
    story.append(Paragraph("• <b>Photorealistic 3D Mesh Deformation:</b> Replace flat 2D sprite transformations with dynamic WebGL 3D cloth physics simulations driven by Three.js particle cloth constraints.", bullet_style))

    story.append(Paragraph("5.4 Conclusion", h2_style))
    story.append(Paragraph(
        "The <b>AI-Powered Virtual Fashion Try-On Website (VERVE AR)</b> provides a comprehensive, production-ready solution to the digital apparel "
        "industry's most pressing consumer friction point. By harmonizing real-time MediaPipe skeletal tracking at 60 FPS, state-of-the-art neural diffusion "
        "fabric draping, automated Gemini vision garment cataloguing, and a fully responsive mobile-first atelier interface, the system achieves "
        "high fidelity, seamless user interaction, and robust fault-tolerant architecture. The implementation proves that modern browser standards "
        "combined with lean computer vision backends can deliver luxury virtual shopping experiences without proprietary app downloads.",
        body_style
    ))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)

    # Verify exact page count using pypdf
    reader = pypdf.PdfReader(PDF_OUTPUT_PATH)
    actual_pages = len(reader.pages)
    print(f"[PDF Verification] Generated PDF contains exactly {actual_pages} pages.")
    return actual_pages

if __name__ == "__main__":
    pages = build_pdf()
    if pages != 5:
        print(f"WARNING: Target is 5 pages, but generated {pages}. Please adjust spacing.")
        sys.exit(1)
    else:
        print("SUCCESS: Exact 5-page PDF successfully created.")
