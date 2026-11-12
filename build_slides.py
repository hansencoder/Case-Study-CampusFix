import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]
    
    # Colors
    C_NAVY = RGBColor(50, 54, 83)       # #323653
    C_LIGHT_BG = RGBColor(248, 242, 237)# #F8F2ED
    C_WHITE = RGBColor(255, 255, 255)
    C_ACCENT = RGBColor(46, 91, 136)    # #2E5B88
    C_DARK = RGBColor(35, 38, 55)
    C_MUTED = RGBColor(100, 105, 120)
    C_BORDER = RGBColor(215, 220, 228)
    C_GREEN = RGBColor(40, 167, 69)
    C_AMBER = RGBColor(220, 130, 20)
    C_CARD_BG = RGBColor(255, 255, 255)
    C_TAG_BG = RGBColor(235, 240, 246)
    
    # Image paths
    IMG_HOME = r"C:\Users\Hans\.gemini\antigravity\brain\c19f061d-ca1b-4b8e-ba5c-f04db010b3dc\.user_uploaded\media_1794407262819_fe69a986.jpg"
    IMG_CREATE = r"C:\Users\Hans\.gemini\antigravity\brain\c19f061d-ca1b-4b8e-ba5c-f04db010b3dc\.user_uploaded\media_1794407284988_f91a0e4a.jpg"
    IMG_REPORTS = r"C:\Users\Hans\.gemini\antigravity\brain\c19f061d-ca1b-4b8e-ba5c-f04db010b3dc\.user_uploaded\media_1794407303648_73e8e238.jpg"
    IMG_DETAILS = r"C:\Users\Hans\.gemini\antigravity\brain\c19f061d-ca1b-4b8e-ba5c-f04db010b3dc\.user_uploaded\media_1794407331589_6a7aecb2.jpg"

    def set_slide_background(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="CAMPUSFIX MOBILE CASE STUDY"):
        # Category pill
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.5), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.name = "Segoe UI"
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_ACCENT
        
        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.5), Inches(0.65))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.name = "Segoe UI"
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = C_NAVY

    def add_card(slide, left, top, width, height, bg_color=C_WHITE, border_color=C_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1)
        else:
            card.line.fill.background()
        return card

    # =========================================================
    # SLIDE 1: Title Slide (Dark Navy Branding)
    # =========================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1, C_NAVY)
    
    # Accent badge shape
    accent_bar = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.2), Inches(2.2), Inches(0.38))
    accent_bar.fill.solid()
    accent_bar.fill.fore_color.rgb = RGBColor(65, 71, 105)
    accent_bar.line.fill.background()
    p_acc = accent_bar.text_frame.paragraphs[0]
    p_acc.text = "⚡ MOBILE CASE STUDY 2026"
    p_acc.font.name = "Segoe UI"
    p_acc.font.size = Pt(9.5)
    p_acc.font.bold = True
    p_acc.font.color.rgb = RGBColor(240, 244, 250)
    p_acc.alignment = PP_ALIGN.CENTER
    
    # Title Text Box
    tbox1 = slide1.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(11.5), Inches(2.2))
    tf1 = tbox1.text_frame
    tf1.word_wrap = True
    
    p1 = tf1.paragraphs[0]
    p1.text = "CampusFix"
    p1.font.name = "Segoe UI"
    p1.font.size = Pt(48)
    p1.font.bold = True
    p1.font.color.rgb = C_WHITE
    
    p1_sub = tf1.add_paragraph()
    p1_sub.text = "Mobile Maintenance & Facility Issue Reporting System"
    p1_sub.font.name = "Segoe UI"
    p1_sub.font.size = Pt(20)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = RGBColor(195, 204, 213)
    p1_sub.space_before = Pt(8)
    
    p1_desc = tf1.add_paragraph()
    p1_desc.text = "A cross-platform mobile application prototype built with Ionic 9, Angular 22 & Capacitor 8"
    p1_desc.font.name = "Segoe UI"
    p1_desc.font.size = Pt(13)
    p1_desc.font.color.rgb = RGBColor(210, 215, 228)
    p1_desc.space_before = Pt(6)

    # 4 Presenter Cards at the bottom
    members = [
        ("Hans", "Project Lead & Mobile Architecture"),
        ("Cedrick", "UI / UX & Application Demo"),
        ("Manuel", "Capacitor & Services Lead"),
        ("Ashley", "QA, Testing & Documentation")
    ]
    card_w = Inches(2.7)
    card_h = Inches(1.8)
    card_y = Inches(4.8)
    for idx, (m_name, m_role) in enumerate(members):
        card_x = Inches(0.8 + idx * 2.95)
        c_shape = add_card(slide1, card_x, card_y, card_w, card_h, bg_color=RGBColor(42, 45, 68), border_color=RGBColor(65, 70, 98))
        tf_c = c_shape.text_frame
        tf_c.word_wrap = True
        tf_c.vertical_anchor = MSO_ANCHOR.MIDDLE
        
        p_c1 = tf_c.paragraphs[0]
        p_c1.text = f"Speaker {idx+1}"
        p_c1.font.name = "Segoe UI"
        p_c1.font.size = Pt(10)
        p_c1.font.bold = True
        p_c1.font.color.rgb = RGBColor(195, 204, 213)
        p_c1.alignment = PP_ALIGN.CENTER
        
        p_c2 = tf_c.add_paragraph()
        p_c2.text = m_name
        p_c2.font.name = "Segoe UI"
        p_c2.font.size = Pt(14)
        p_c2.font.bold = True
        p_c2.font.color.rgb = C_WHITE
        p_c2.alignment = PP_ALIGN.CENTER
        p_c2.space_before = Pt(4)
        
        p_c3 = tf_c.add_paragraph()
        p_c3.text = m_role
        p_c3.font.name = "Segoe UI"
        p_c3.font.size = Pt(10)
        p_c3.font.color.rgb = RGBColor(170, 180, 200)
        p_c3.alignment = PP_ALIGN.CENTER
        p_c3.space_before = Pt(2)

    # =========================================================
    # SLIDE 2: The Campus Maintenance Dilemma (The Problem)
    # =========================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2, C_LIGHT_BG)
    add_header(slide2, "The Campus Maintenance Dilemma: Why Hazards Persist Unrepaired", "PART 1: PROBLEM STATEMENT")
    
    # 3 Problem Columns
    problems = [
        (
            "🛑 High Friction & Overhead",
            "Complex Systems Deter Reporting",
            [
                "Traditional work-order systems require complex university desktop portal logins.",
                "Multi-page bureaucratic forms discourage students from reporting small defects.",
                "In-person reporting requires locating building administrator desks during restricted class hours."
            ],
            C_WHITE
        ),
        (
            "📷 Zero Photographic Proof",
            "Lack of Visual Context for Staff",
            [
                "Verbal complaints like 'sink is leaking' or 'light is out' lack critical diagnostic details.",
                "Facilities staff cannot identify required parts or toolsets prior to dispatching workers.",
                "Results in wasted technician trips, delayed repairs, and extended facility downtime."
            ],
            C_WHITE
        ),
        (
            "❓ Complete Lack of Tracking",
            "Student Apathy & Duplicate Reports",
            [
                "Once an issue is logged, students receive no confirmation ticket or resolution timeline.",
                "Multiple students report the exact same defect, creating duplicate work tickets.",
                "Students assume nothing is being done, fostering distrust in campus facility management."
            ],
            C_WHITE
        )
    ]
    
    col_w = Inches(3.7)
    col_h = Inches(5.0)
    col_y = Inches(1.7)
    for idx, (p_title, p_sub, p_points, bg_col) in enumerate(problems):
        col_x = Inches(0.8 + idx * 4.0)
        c_shape = add_card(slide2, col_x, col_y, col_w, col_h, bg_color=bg_col, border_color=C_BORDER)
        tf = c_shape.text_frame
        tf.word_wrap = True
        
        p_t = tf.paragraphs[0]
        p_t.text = p_title
        p_t.font.name = "Segoe UI"
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = C_NAVY
        
        p_s = tf.add_paragraph()
        p_s.text = p_sub
        p_s.font.name = "Segoe UI"
        p_s.font.size = Pt(10.5)
        p_s.font.bold = True
        p_s.font.color.rgb = C_ACCENT
        p_s.space_before = Pt(3)
        p_s.space_after = Pt(12)
        
        for pt in p_points:
            p_pt = tf.add_paragraph()
            p_pt.text = f"•  {pt}"
            p_pt.font.name = "Segoe UI"
            p_pt.font.size = Pt(10)
            p_pt.font.color.rgb = C_DARK
            p_pt.space_after = Pt(8)

    # =========================================================
    # SLIDE 3: The Proposed Solution — CampusFix
    # =========================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3, C_LIGHT_BG)
    add_header(slide3, "Our Proposed Solution: CampusFix — A 60-Second Mobile Pipeline", "PART 1: PROPOSED SOLUTION")
    
    # Left Column: Feature highlights
    left_card = add_card(slide3, Inches(0.8), Inches(1.7), Inches(7.5), Inches(5.0))
    tf_l = left_card.text_frame
    tf_l.word_wrap = True
    
    p_lt = tf_l.paragraphs[0]
    p_lt.text = "Student-Centric Mobile Architecture"
    p_lt.font.name = "Segoe UI"
    p_lt.font.size = Pt(16)
    p_lt.font.bold = True
    p_lt.font.color.rgb = C_NAVY
    p_lt.space_after = Pt(12)
    
    features = [
        ("⚡ 6 Instant Category Tiles", "Categorize problems instantly (Plumbing, Electrical, HVAC, Locks, Safety, Other) with dedicated visual icons."),
        ("📍 Precise Location Pinning", "Specify building, floor, and room number with an interactive campus GPS geolocation shortcut."),
        ("📸 Native Photo Evidence", "Capture hardware camera photos or upload existing gallery images; saved securely in app private storage."),
        ("⏱️ Three Urgency SLA Tiers", "Select Low (within 3d), Standard (within 24h), or Urgent (immediate alert), giving facility teams clear priority."),
        ("📊 Transparent Status Tracking", "Dynamic 4-stage resolution timeline: Report Received → Assigned → Technician On-Site → Resolved.")
    ]
    for f_title, f_desc in features:
        p_ft = tf_l.add_paragraph()
        p_ft.text = f_title
        p_ft.font.name = "Segoe UI"
        p_ft.font.size = Pt(11.5)
        p_ft.font.bold = True
        p_ft.font.color.rgb = C_ACCENT
        p_ft.space_before = Pt(6)
        
        p_fd = tf_l.add_paragraph()
        p_fd.text = f_desc
        p_fd.font.name = "Segoe UI"
        p_fd.font.size = Pt(10)
        p_fd.font.color.rgb = C_DARK
        p_fd.space_after = Pt(4)

    # Right Column: Screenshot Preview
    if os.path.exists(IMG_HOME):
        slide3.shapes.add_picture(IMG_HOME, Inches(8.7), Inches(1.7), width=Inches(3.8))

    # =========================================================
    # SLIDE 4: System Architecture & Scope
    # =========================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4, C_LIGHT_BG)
    add_header(slide4, "System Architecture: 3-Tier Client Architecture & Scope", "PART 1: ARCHITECTURE & SCOPE")
    
    # 3 Layers
    layers = [
        ("Layer 1: Presentation / UI Layer", "Ionic 9 + Angular 22", 
         "• 4 Focused Pages: HomePage, CreateReportPage, MyReportsPage, ReportDetailsPage\n"
         "• Shared BrandHeader & BottomNav components with active routing highlights\n"
         "• Reactive Forms with strict nonBlankValidator and live character counters\n"
         "• Cohesive design system tokens (#323653 Navy & #F8F2ED) within 4 kB SCSS budget",
         C_WHITE),
        ("Layer 2: Service / Business Logic", "ReportService (Single Source of Truth)", 
         "• Centralized CRUD: createReport(), getReports(), updateReport(), deleteReport()\n"
         "• Data Normalization: sanitizes categories, formats ISO timestamps, generates unique #CF codes\n"
         "• Defensive JSON parsing with try/catch preventing storage corruption crashes\n"
         "• Asynchronous photo URI resolution via Capacitor.convertFileSrc()",
         C_WHITE),
        ("Layer 3: Native Device Hardware", "Capacitor 8 Native Plugins", 
         "• @capacitor/camera: Camera & Gallery capture with single-tap permission guard\n"
         "• @capacitor/filesystem: Sandboxed Directory.Data/campusfix-photos/ storage\n"
         "• @capacitor/preferences: Serialized JSON storage under 'campusfix_reports' key\n"
         "• @ionic/pwa-elements: Web preview component fallback for browser testing",
         C_WHITE)
    ]
    
    for idx, (l_title, l_tech, l_bullets, bg_col) in enumerate(layers):
        c_layer = add_card(slide4, Inches(0.8), Inches(1.6 + idx * 1.55), Inches(8.0), Inches(1.4))
        tf = c_layer.text_frame
        tf.word_wrap = True
        
        p_t = tf.paragraphs[0]
        p_t.text = f"{l_title} — {l_tech}"
        p_t.font.name = "Segoe UI"
        p_t.font.size = Pt(11.5)
        p_t.font.bold = True
        p_t.font.color.rgb = C_NAVY
        p_t.space_after = Pt(3)
        
        p_b = tf.add_paragraph()
        p_b.text = l_bullets
        p_b.font.name = "Segoe UI"
        p_b.font.size = Pt(9.5)
        p_b.font.color.rgb = C_DARK

    # Right side: Scope Callout Card
    scope_card = add_card(slide4, Inches(9.1), Inches(1.6), Inches(3.4), Inches(4.5), bg_color=RGBColor(240, 245, 252), border_color=C_ACCENT)
    tf_sc = scope_card.text_frame
    tf_sc.word_wrap = True
    
    p_st = tf_sc.paragraphs[0]
    p_st.text = "🎯 Academic Scope Callout"
    p_st.font.name = "Segoe UI"
    p_st.font.size = Pt(13)
    p_st.font.bold = True
    p_st.font.color.rgb = C_ACCENT
    p_st.space_after = Pt(10)
    
    scope_pts = [
        "In accordance with course guidelines, this is an honest client-side prototype.",
        "Reports & photos are persisted securely on the device filesystem and key-value store.",
        "External backend servers, campus email SMTP, and staff push notification APIs are intentionally decoupled.",
        "Demonstrates complete offline capability, data privacy, and zero server dependency."
    ]
    for sp in scope_pts:
        p_sp = tf_sc.add_paragraph()
        p_sp.text = f"✔  {sp}"
        p_sp.font.name = "Segoe UI"
        p_sp.font.size = Pt(9.5)
        p_sp.font.color.rgb = C_DARK
        p_sp.space_after = Pt(8)

    # =========================================================
    # SLIDE 5: Live App Demonstration (4 Core Screens)
    # =========================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5, C_LIGHT_BG)
    add_header(slide5, "Application Walkthrough: 4 Core Mobile Interfaces", "PART 2: APPLICATION DEMO")
    
    # 4 Screenshots side-by-side with labels
    screens = [
        ("1. Home Dashboard", IMG_HOME, "Live metric overview tiles, instant dispatch hero & emergency notice"),
        ("2. Report an Issue", IMG_CREATE, "4-step wizard, 6 category tiles, room GPS & camera photo evidence"),
        ("3. My Reports & Search", IMG_REPORTS, "Interactive search, filter pills, dispatch status & report history"),
        ("4. Report Details & Lifecycle", IMG_DETAILS, "4-stage resolution timeline, full photo modal, Edit & Cancel actions")
    ]
    
    for idx, (s_title, img_path, s_desc) in enumerate(screens):
        x = Inches(0.8 + idx * 2.95)
        # Title box
        t_box = slide5.shapes.add_textbox(x, Inches(1.5), Inches(2.7), Inches(0.5))
        p = t_box.text_frame.paragraphs[0]
        p.text = s_title
        p.font.name = "Segoe UI"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_NAVY
        p.alignment = PP_ALIGN.CENTER
        
        # Image
        if os.path.exists(img_path):
            slide5.shapes.add_picture(img_path, x, Inches(2.0), width=Inches(2.7))
            
        # Description
        d_box = slide5.shapes.add_textbox(x, Inches(6.5), Inches(2.7), Inches(0.7))
        p_d = d_box.text_frame.paragraphs[0]
        p_d.text = s_desc
        p_d.font.name = "Segoe UI"
        p_d.font.size = Pt(8.5)
        p_d.font.color.rgb = C_MUTED
        p_d.alignment = PP_ALIGN.CENTER

    # =========================================================
    # SLIDE 6: Important Code Snippets
    # =========================================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide6, C_LIGHT_BG)
    add_header(slide6, "Technical Implementation: Selected Important Code Snippets", "PART 3: CODE SNIPPETS")
    
    code_cards = [
        (
            "1. Camera Permissions & Denial Handling",
            "ReportService.captureIssuePhoto()",
            "// Handles Android 11+ single-tap denial\n"
            "if (Capacitor.isNativePlatform()) {\n"
            "  const permState = await Camera.checkPermissions();\n"
            "  let cameraStatus = permState.camera;\n"
            "  if (cameraStatus !== 'granted') {\n"
            "    const req = await Camera.requestPermissions({ permissions: ['camera'] });\n"
            "    cameraStatus = req.camera;\n"
            "  }\n"
            "  if (cameraStatus !== 'granted') {\n"
            "    return { status: 'denied', message: 'Camera permission denied.' };\n"
            "  }\n"
            "}\n"
            "const media = await Camera.takePhoto({ quality: 75, targetWidth: 1600, ... });"
        ),
        (
            "2. Sandboxed Filesystem & URI Resolution",
            "ReportService.persistCapturedPhoto() & resolvePhotoUrl()",
            "// Copy to sandboxed private app storage\n"
            "const destPath = `${PHOTO_DIRECTORY}/report-${Date.now()}-${hash}.jpg`;\n"
            "await Filesystem.copy({\n"
            "  from: sourceUri, to: destPath, toDirectory: Directory.Data\n"
            "});\n\n"
            "// Convert native internal path to safe WebView URL\n"
            "const { uri } = await Filesystem.getUri({\n"
            "  path: photoPath, directory: Directory.Data\n"
            "});\n"
            "return Capacitor.convertFileSrc(uri);"
        ),
        (
            "3. Persistent CRUD & Image Cleanup",
            "ReportService.updateReport() & deleteReport()",
            "// Update fields while preserving original ID & creation timestamp\n"
            "async updateReport(id: string, changes: CreateReportInput) {\n"
            "  const existing = await this.getReports();\n"
            "  existing[index] = { ...existing[index], ...changes };\n"
            "  await this.saveAll(existing);\n"
            "}\n\n"
            "// Permanently cancel report and unlink stored photo file\n"
            "async deleteReport(id: string) {\n"
            "  await this.saveAll(existing.filter(r => r.id !== id));\n"
            "  await this.deletePhotoFile(target.photoPath);\n"
            "}"
        )
    ]
    
    c_w = Inches(3.7)
    c_h = Inches(5.1)
    for idx, (cd_title, cd_sub, cd_code) in enumerate(code_cards):
        cx = Inches(0.8 + idx * 4.0)
        c_box = add_card(slide6, cx, Inches(1.7), c_w, c_h, bg_color=C_WHITE, border_color=C_BORDER)
        tf = c_box.text_frame
        tf.word_wrap = True
        
        p1 = tf.paragraphs[0]
        p1.text = cd_title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(11.5)
        p1.font.bold = True
        p1.font.color.rgb = C_NAVY
        
        p2 = tf.add_paragraph()
        p2.text = cd_sub
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(9.5)
        p2.font.bold = True
        p2.font.color.rgb = C_ACCENT
        p2.space_before = Pt(2)
        p2.space_after = Pt(8)
        
        p_code = tf.add_paragraph()
        p_code.text = cd_code
        p_code.font.name = "Consolas"
        p_code.font.size = Pt(8.5)
        p_code.font.color.rgb = RGBColor(36, 41, 46)

    # =========================================================
    # SLIDE 7: Quality Assurance & Basic Testing
    # =========================================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide7, C_LIGHT_BG)
    add_header(slide7, "Quality Assurance & Evaluation: 100% Test Pass Rate", "PART 4: TESTING & EVALUATION")
    
    # 3 Summary metric tiles
    metrics = [
        ("Static Analysis", "0 Lint Errors", "All TypeScript, templates & SCSS files pass `ng lint` cleanly.", C_NAVY),
        ("Automated Unit Tests", "24 / 24 Tests Passed", "Vitest test suite covering validation, storage mocks, and error fallbacks.", C_ACCENT),
        ("Android Device E2E", "13 / 13 Scenarios Passed", "End-to-end tests on Android 16 (API 36) emulator & Android hardware.", C_GREEN)
    ]
    for idx, (m_title, m_stat, m_desc, m_color) in enumerate(metrics):
        m_x = Inches(0.8 + idx * 4.0)
        m_card = add_card(slide7, m_x, Inches(1.6), Inches(3.7), Inches(1.2), bg_color=C_WHITE)
        tf = m_card.text_frame
        tf.word_wrap = True
        
        p_mt = tf.paragraphs[0]
        p_mt.text = m_title.upper()
        p_mt.font.name = "Segoe UI"
        p_mt.font.size = Pt(9)
        p_mt.font.bold = True
        p_mt.font.color.rgb = C_MUTED
        
        p_ms = tf.add_paragraph()
        p_ms.text = m_stat
        p_ms.font.name = "Segoe UI"
        p_ms.font.size = Pt(16)
        p_ms.font.bold = True
        p_ms.font.color.rgb = m_color
        p_ms.space_before = Pt(1)
        
        p_md = tf.add_paragraph()
        p_md.text = m_desc
        p_md.font.name = "Segoe UI"
        p_md.font.size = Pt(8.5)
        p_md.font.color.rgb = C_DARK

    # Testing Table
    t_rows = 9
    t_cols = 4
    table_shape = slide7.shapes.add_table(t_rows, t_cols, Inches(0.8), Inches(3.1), Inches(11.7), Inches(3.8))
    table = table_shape.table
    table.columns[0].width = Inches(1.0)
    table.columns[1].width = Inches(3.2)
    table.columns[2].width = Inches(6.3)
    table.columns[3].width = Inches(1.2)
    
    tbl_headers = ["Test ID", "Feature / Task Tested", "Observed Test Result & Evidence", "Status"]
    for c_i, h in enumerate(tbl_headers):
        cell = table.cell(0, c_i)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_NAVY
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.name = "Segoe UI"
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = C_WHITE
        if c_i in [0, 3]:
            p.alignment = PP_ALIGN.CENTER
            
    test_data = [
        ("TC-01", "App Launch & Navigation", "Home dashboard loads cleanly with status counters and active routing tabs.", "PASS"),
        ("TC-02", "Form Validation on Empty Submit", "Submission blocked; required alerts appear for Category, Title, Location, Description.", "PASS"),
        ("TC-04", "Capture Native Camera Photo", "Android Camera launches; compressed JPEG saved to Directory.Data with preview.", "PASS"),
        ("TC-06", "Runtime Camera Permission Denial", "Denying permission returns graceful in-app alert; app does not crash or loop.", "PASS"),
        ("TC-08", "Data Persistence Across Restarts", "Force-stopping and relaunching app preserves all saved reports and photo files.", "PASS"),
        ("TC-10", "Missing Photo Graceful Fallback", "Manually deleting photo shows missing-photo badge; all text details remain viewable.", "PASS"),
        ("TC-11", "Edit Existing Report Details", "Editing report updates fields and persists changes while keeping original ticket code.", "PASS"),
        ("TC-12", "Cancel Report & Photo Cleanup", "Confirmation alert shown; confirming deletes ticket and removes photo from storage.", "PASS")
    ]
    for r_i, (t_id, t_feat, t_res, t_st) in enumerate(test_data, start=1):
        for c_i, val in enumerate([t_id, t_feat, t_res, t_st]):
            cell = table.cell(r_i, c_i)
            cell.fill.solid()
            cell.fill.fore_color.rgb = C_WHITE if r_i % 2 == 1 else RGBColor(245, 248, 252)
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.name = "Segoe UI"
            p.font.size = Pt(8.5)
            if c_i == 0:
                p.font.bold = True
                p.alignment = PP_ALIGN.CENTER
                p.font.color.rgb = C_NAVY
            elif c_i == 3:
                p.font.bold = True
                p.alignment = PP_ALIGN.CENTER
                p.font.color.rgb = C_GREEN
            else:
                p.font.color.rgb = C_DARK

    # =========================================================
    # SLIDE 8: Limitations vs. Future Roadmap
    # =========================================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide8, C_LIGHT_BG)
    add_header(slide8, "Project Scope: Known Limitations vs. Future Production Roadmap", "PART 4: LIMITATIONS & FUTURE SCOPE")
    
    # Left Card: Current Limitations
    c_lim = add_card(slide8, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.0))
    tf_lim = c_lim.text_frame
    tf_lim.word_wrap = True
    
    p = tf_lim.paragraphs[0]
    p.text = "⚠️ Known Prototype Limitations"
    p.font.name = "Segoe UI"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_AMBER
    p.space_after = Pt(12)
    
    lim_items = [
        ("Local-Only Data Storage", "Reports exist solely on the device where they were created; they are not synced to a centralized university server."),
        ("App Data Wipe Risk", "Uninstalling CampusFix or clearing app storage in Android settings permanently deletes stored tickets and photo files."),
        ("Static Technician Updates", "Work order dispatch, staff comments, and resolution timelines are currently simulated for demonstration."),
        ("Simulated Voice & GPS Shortcuts", "GPS location pin and microphone dictation trigger helpful guidance toasts rather than live sensors.")
    ]
    for li_t, li_d in lim_items:
        p_t = tf_lim.add_paragraph()
        p_t.text = f"•  {li_t}"
        p_t.font.name = "Segoe UI"
        p_t.font.size = Pt(10.5)
        p_t.font.bold = True
        p_t.font.color.rgb = C_NAVY
        p_t.space_before = Pt(4)
        
        p_d = tf_lim.add_paragraph()
        p_d.text = f"    {li_d}"
        p_d.font.name = "Segoe UI"
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = C_DARK
        p_d.space_after = Pt(4)

    # Right Card: Future Production Roadmap
    c_fut = add_card(slide8, Inches(6.9), Inches(1.7), Inches(5.6), Inches(5.0))
    tf_fut = c_fut.text_frame
    tf_fut.word_wrap = True
    
    p = tf_fut.paragraphs[0]
    p.text = "🚀 Future Production Roadmap"
    p.font.name = "Segoe UI"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_ACCENT
    p.space_after = Pt(12)
    
    fut_items = [
        ("Cloud Backend Integration", "Connect Angular HttpClient to a cloud database (Firebase Firestore or NestJS REST API) for multi-device sync."),
        ("Facilities Staff Web Portal", "Build an administrative dashboard for dispatch coordinators to review incoming tickets and assign technicians."),
        ("Push Notifications via FCM", "Integrate @capacitor/push-notifications to alert students immediately when technicians arrive on site."),
        ("Campus GIS Reverse Geocoding", "Leverage @capacitor/geolocation to auto-detect buildings, halls, and coordinates automatically.")
    ]
    for fi_t, fi_d in fut_items:
        p_t = tf_fut.add_paragraph()
        p_t.text = f"✔  {fi_t}"
        p_t.font.name = "Segoe UI"
        p_t.font.size = Pt(10.5)
        p_t.font.bold = True
        p_t.font.color.rgb = C_ACCENT
        p_t.space_before = Pt(4)
        
        p_d = tf_fut.add_paragraph()
        p_d.text = f"    {fi_d}"
        p_d.font.name = "Segoe UI"
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = C_DARK
        p_d.space_after = Pt(4)

    # =========================================================
    # SLIDE 9: AI Usage Disclosure & Academic Integrity
    # =========================================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide9, C_LIGHT_BG)
    add_header(slide9, "AI Usage Disclosure & Academic Integrity Statement", "PART 4: AI USAGE DISCLOSURE")
    
    # 2 Comparison Blocks
    c_ai = add_card(slide9, Inches(0.8), Inches(1.7), Inches(5.6), Inches(5.0))
    tf_ai = c_ai.text_frame
    tf_ai.word_wrap = True
    
    p = tf_ai.paragraphs[0]
    p.text = "🤖 AI Tools & Assistance Scope"
    p.font.name = "Segoe UI"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_NAVY
    p.space_after = Pt(12)
    
    ai_points = [
        ("AI Pair-Programming Assistant", "Google Antigravity powered by Gemini & Claude models."),
        ("Architecture Scaffolding", "Scaffolded Ionic 9 + Angular 22 standalone modules and route files."),
        ("Capacitor Native Integration", "Assisted in writing asynchronous boilerplate for @capacitor/camera, @capacitor/filesystem, and @capacitor/preferences."),
        ("Automated Test Authoring", "Generated Vitest test spec mocks for native hardware plugins."),
        ("Build Toolchain Debugging", "Diagnosed local Android SDK path configuration and Gradle assembleDebug tasks.")
    ]
    for ai_t, ai_d in ai_points:
        p_t = tf_ai.add_paragraph()
        p_t.text = f"•  {ai_t}: "
        p_t.font.name = "Segoe UI"
        p_t.font.size = Pt(10)
        p_t.font.bold = True
        p_t.font.color.rgb = C_ACCENT
        p_t.space_before = Pt(4)
        
        p_d = tf_ai.add_paragraph()
        p_d.text = f"    {ai_d}"
        p_d.font.name = "Segoe UI"
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = C_DARK

    c_stu = add_card(slide9, Inches(6.9), Inches(1.7), Inches(5.6), Inches(5.0))
    tf_stu = c_stu.text_frame
    tf_stu.word_wrap = True
    
    p = tf_stu.paragraphs[0]
    p.text = "👥 Student Group Review & Verification"
    p.font.name = "Segoe UI"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_NAVY
    p.space_after = Pt(12)
    
    stu_points = [
        ("Requirements & Scope Definition", "Defined the campus problem, user personas, MVP boundary, and student workflow."),
        ("UI / UX Wireframing & Design", "Created mockup screens and defined the CampusFix brand colors and typography."),
        ("Code Review & Refactoring", "Inspected all generated TypeScript controllers and templates for Angular 22 compliance."),
        ("Device Testing & Validation", "Manually installed CampusFix-debug.apk on physical Android phones and emulators."),
        ("Documentation & Defense", "Authored final documentation, verified test findings, and prepared presentation defense.")
    ]
    for st_t, st_d in stu_points:
        p_t = tf_stu.add_paragraph()
        p_t.text = f"✔  {st_t}: "
        p_t.font.name = "Segoe UI"
        p_t.font.size = Pt(10)
        p_t.font.bold = True
        p_t.font.color.rgb = C_GREEN
        p_t.space_before = Pt(4)
        
        p_d = tf_stu.add_paragraph()
        p_d.text = f"    {st_d}"
        p_d.font.name = "Segoe UI"
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = C_DARK

    # =========================================================
    # SLIDE 10: Closing Slide & Q&A
    # =========================================================
    slide10 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide10, C_NAVY)
    
    tbox10 = slide10.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(2.2))
    tf10 = tbox10.text_frame
    tf10.word_wrap = True
    
    p10 = tf10.paragraphs[0]
    p10.text = "Thank You!"
    p10.font.name = "Segoe UI"
    p10.font.size = Pt(48)
    p10.font.bold = True
    p10.font.color.rgb = C_WHITE
    p10.alignment = PP_ALIGN.CENTER
    
    p10_sub = tf10.add_paragraph()
    p10_sub.text = "CampusFix — Empowering Students to Keep Campus Safe & Clean"
    p10_sub.font.name = "Segoe UI"
    p10_sub.font.size = Pt(20)
    p10_sub.font.bold = True
    p10_sub.font.color.rgb = RGBColor(195, 204, 213)
    p10_sub.alignment = PP_ALIGN.CENTER
    p10_sub.space_before = Pt(8)
    
    # Deliverables Box
    deliv_card = add_card(slide10, Inches(2.5), Inches(4.2), Inches(8.33), Inches(2.2), bg_color=RGBColor(42, 45, 68), border_color=RGBColor(65, 70, 98))
    tf_d = deliv_card.text_frame
    tf_d.word_wrap = True
    
    p_dt = tf_d.paragraphs[0]
    p_dt.text = "PROJECT DELIVERABLES & ARTIFACTS"
    p_dt.font.name = "Segoe UI"
    p_dt.font.size = Pt(11)
    p_dt.font.bold = True
    p_dt.font.color.rgb = RGBColor(195, 204, 213)
    p_dt.alignment = PP_ALIGN.CENTER
    p_dt.space_after = Pt(8)
    
    delivs = [
        "📱 Android Package: CampusFix-debug.apk (10.5 MB, com.example.campusfix, v1.0.0)",
        "💻 Git Repository: Full source code, test specs, and configuration files",
        "📄 Technical Documentation: CampusFix_Project_Documentation.docx",
        "🎙️ Presentation Deliverable: CampusFix_Presentation_Script_Updated.docx"
    ]
    for d in delivs:
        p_di = tf_d.add_paragraph()
        p_di.text = d
        p_di.font.name = "Segoe UI"
        p_di.font.size = Pt(10)
        p_di.font.color.rgb = C_WHITE
        p_di.alignment = PP_ALIGN.CENTER
        p_di.space_after = Pt(2)

    # Save presentation
    output_pptx = "CampusFix_Presentation_Slides.pptx"
    try:
        prs.save(output_pptx)
        print(f"Presentation slides successfully created at: {os.path.abspath(output_pptx)}")
    except PermissionError:
        alt_pptx = "CampusFix_Presentation_Slides_v2.pptx"
        prs.save(alt_pptx)
        print(f"File locked, saved presentation to: {os.path.abspath(alt_pptx)}")

if __name__ == "__main__":
    create_deck()

