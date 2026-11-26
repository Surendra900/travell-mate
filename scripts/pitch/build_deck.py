import os
import sys
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
    BG_COLOR = RGBColor(248, 249, 250)        # #F8F9FA
    CARD_BG = RGBColor(255, 255, 255)         # #FFFFFF
    BORDER_COLOR = RGBColor(229, 231, 235)    # #E5E7EB
    BORDER_STRONG = RGBColor(209, 213, 219)   # #D1D5DB
    NAVY_PRIMARY = RGBColor(30, 58, 138)      # #1E3A8A (Muted Accent: Deep Slate Navy)
    SLATE_DARK = RGBColor(30, 41, 59)         # #1E293B
    TEXT_MAIN = RGBColor(31, 41, 55)          # #1F2937
    TEXT_MUTED = RGBColor(107, 114, 128)      # #6B7280
    TEXT_BODY = RGBColor(55, 65, 81)          # #374151
    GREEN_ACCENT = RGBColor(21, 128, 61)      # #15803D (Safe/Success)
    AMBER_ACCENT = RGBColor(180, 83, 9)       # #B45309 (Warning)
    LIGHT_BLUE_BG = RGBColor(239, 246, 255)   # #EFF6FF

    FONT_NAME = "Calibri"

    def apply_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="BUILDX 2026 HACKATHON SUBMISSION", slide_num=None):
        # Category Tracker
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.3))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        tf_cat.margin_left = tf_cat.margin_right = tf_cat.margin_top = tf_cat.margin_bottom = 0
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.name = FONT_NAME
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = NAVY_PRIMARY

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.68), Inches(11.7), Inches(0.65))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = FONT_NAME
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = TEXT_MAIN

        # Footer
        if slide_num:
            footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(11.7), Inches(0.3))
            tff = footer_box.text_frame
            tff.word_wrap = True
            tff.margin_left = tff.margin_right = tff.margin_top = tff.margin_bottom = 0
            pf = tff.paragraphs[0]
            pf.text = f"TravelMate AI  |  Track: Open Innovation  |  Live at travelmate-ai-flowzint.vercel.app                                                                        Slide {slide_num} of 7"
            pf.font.name = FONT_NAME
            pf.font.size = Pt(9.5)
            pf.font.color.rgb = TEXT_MUTED

    def create_card(slide, left, top, width, height, bg=CARD_BG, border=BORDER_COLOR):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg
        shape.line.color.rgb = border
        shape.line.width = Pt(1)
        return shape

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    apply_background(slide1)

    # Main Card
    create_card(slide1, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9), bg=CARD_BG, border=BORDER_COLOR)

    # Accent Strip Top
    accent_strip = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.8), Inches(11.733), Inches(0.12))
    accent_strip.fill.solid()
    accent_strip.fill.fore_color.rgb = NAVY_PRIMARY
    accent_strip.line.fill.background()

    # Title & Subtitle box
    t_box = slide1.shapes.add_textbox(Inches(1.3), Inches(1.3), Inches(10.7), Inches(2.2))
    tf1 = t_box.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "BUILDX 2026 HACKATHON SUBMISSION  •  TRACK: OPEN INNOVATION"
    p0.font.name = FONT_NAME
    p0.font.size = Pt(11)
    p0.font.bold = True
    p0.font.color.rgb = NAVY_PRIMARY
    p0.space_after = Pt(12)

    p1 = tf1.add_paragraph()
    p1.text = "TravelMate AI"
    p1.font.name = FONT_NAME
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_MAIN
    p1.space_after = Pt(8)

    p2 = tf1.add_paragraph()
    p2.text = "Autonomous Multimodal Disruption & Route Recovery Engine"
    p2.font.name = FONT_NAME
    p2.font.size = Pt(18)
    p2.font.color.rgb = NAVY_PRIMARY
    p2.font.bold = True
    p2.space_after = Pt(10)

    p3 = tf1.add_paragraph()
    p3.text = "Eliminating travel dead-ends in India when direct trains are waitlisted by dynamically synthesizing verified Train + Flight and Train + Bus journeys with parametric transfer safety buffers."
    p3.font.name = FONT_NAME
    p3.font.size = Pt(13)
    p3.font.color.rgb = TEXT_BODY

    # Team & Metadata Cards
    create_card(slide1, Inches(1.3), Inches(3.8), Inches(5.1), Inches(2.4), bg=RGBColor(249, 250, 251), border=BORDER_COLOR)
    tb_team = slide1.shapes.add_textbox(Inches(1.5), Inches(3.95), Inches(4.7), Inches(2.1))
    tft = tb_team.text_frame
    tft.word_wrap = True
    pt0 = tft.paragraphs[0]
    pt0.text = "PROJECT METADATA & TEAM"
    pt0.font.name = FONT_NAME
    pt0.font.size = Pt(11)
    pt0.font.bold = True
    pt0.font.color.rgb = NAVY_PRIMARY
    pt0.space_after = Pt(6)

    pt1 = tft.add_paragraph()
    pt1.text = "• Event: BuildX 2026 (Code-A-Nova 36-Hour Hackathon)"
    pt1.font.name = FONT_NAME
    pt1.font.size = Pt(11.5)
    pt1.font.color.rgb = TEXT_BODY

    pt2 = tft.add_paragraph()
    pt2.text = "• Team: Surendra G (Lead & Full-Stack Architect) & Rishitha (Co-Developer)"
    pt2.font.name = FONT_NAME
    pt2.font.size = Pt(11.5)
    pt2.font.color.rgb = TEXT_BODY

    pt3 = tft.add_paragraph()
    pt3.text = "• Institution / College: [To be confirmed: College Name]"
    pt3.font.name = FONT_NAME
    pt3.font.size = Pt(11.5)
    pt3.font.color.rgb = TEXT_BODY

    pt4 = tft.add_paragraph()
    pt4.text = "• Project Repo: github.com/Surendra900/travell-mate"
    pt4.font.name = FONT_NAME
    pt4.font.size = Pt(11.5)
    pt4.font.color.rgb = TEXT_BODY

    # Live Deployment & Verification Card
    create_card(slide1, Inches(6.6), Inches(3.8), Inches(5.4), Inches(2.4), bg=RGBColor(249, 250, 251), border=BORDER_COLOR)
    tb_live = slide1.shapes.add_textbox(Inches(6.8), Inches(3.95), Inches(5.0), Inches(2.1))
    tfl = tb_live.text_frame
    tfl.word_wrap = True
    pl0 = tfl.paragraphs[0]
    pl0.text = "DEPLOYMENT & IMPLEMENTATION STATUS"
    pl0.font.name = FONT_NAME
    pl0.font.size = Pt(11)
    pl0.font.bold = True
    pl0.font.color.rgb = GREEN_ACCENT
    pl0.space_after = Pt(6)

    pl1 = tfl.add_paragraph()
    pl1.text = "• Production URL: travelmate-ai-flowzint.vercel.app"
    pl1.font.name = FONT_NAME
    pl1.font.size = Pt(11.5)
    pl1.font.bold = True
    pl1.font.color.rgb = TEXT_MAIN

    pl2 = tfl.add_paragraph()
    pl2.text = "• Implementation: 100% Functional React 18 + Serverless Engine"
    pl2.font.name = FONT_NAME
    pl2.font.size = Pt(11.5)
    pl2.font.color.rgb = TEXT_BODY

    pl3 = tfl.add_paragraph()
    pl3.text = "• Test Verification: 136/136 Transport tests + 308 Core tests pass"
    pl3.font.name = FONT_NAME
    pl3.font.size = Pt(11.5)
    pl3.font.color.rgb = TEXT_BODY

    pl4 = tfl.add_paragraph()
    pl4.text = "• Accessibility & Privacy: WCAG 2.1 AA (0 errors) • India DPDP 2023"
    pl4.font.name = FONT_NAME
    pl4.font.size = Pt(11.5)
    pl4.font.color.rgb = TEXT_BODY

    slide1.notes_slide.notes_text_frame.text = (
        "Good morning judges. We are presenting TravelMate AI, built for the BuildX 2026 hackathon. "
        "TravelMate is India's first multimodal transit disruption and route recovery engine, designed to eliminate travel dead-ends "
        "when direct train tickets are waitlisted or cancelled."
    )

    # =========================================================================
    # SLIDE 2: PROBLEM STATEMENT
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    apply_background(slide2)
    add_header(slide2, "The Problem: The Waitlist Crisis & Disconnected Transport Silos", "PROBLEM RELEVANCE & REAL-WORLD IMPACT (15 POINTS)", 2)

    # Card 1: The Macro Reality (Left)
    create_card(slide2, Inches(0.8), Inches(1.4), Inches(5.7), Inches(5.3))
    tb_p1 = slide2.shapes.add_textbox(Inches(1.0), Inches(1.55), Inches(5.3), Inches(5.0))
    tf_p1 = tb_p1.text_frame
    tf_p1.word_wrap = True
    
    pp0 = tf_p1.paragraphs[0]
    pp0.text = "THE SCALE OF TRANSIT FAILURE TODAY"
    pp0.font.name = FONT_NAME
    pp0.font.size = Pt(12)
    pp0.font.bold = True
    pp0.font.color.rgb = NAVY_PRIMARY
    pp0.space_after = Pt(10)

    bullets_p1 = [
        ("24 Million+ Daily Rail Passengers:", "Indian Railways operates 13,000+ trains daily, but extreme track saturation leaves high-density corridors chronically overbooked."),
        ("25 Million+ Waitlisted Tickets Cancelled Monthly:", "IRCTC automatically cancels millions of waitlisted tickets every month, stranding families, students, and emergency commuters."),
        ("Isolated Transport Silos:", "Railway, domestic aviation, and state/private intercity bus networks operate in isolation. If a direct train is sold out, rail portals offer zero cross-modal guidance."),
        ("High-Risk Manual Connecting Journeys:", "Passengers attempting manual split-tickets miscalculate station-to-airport transfers in congested city traffic, resulting in costly missed flights.")
    ]
    for title, desc in bullets_p1:
        p_t = tf_p1.add_paragraph()
        p_t.text = f"• {title} "
        p_t.font.name = FONT_NAME
        p_t.font.size = Pt(12.5)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_MAIN
        
        run_desc = p_t.add_run()
        run_desc.text = desc
        run_desc.font.name = FONT_NAME
        run_desc.font.size = Pt(12)
        run_desc.font.bold = False
        run_desc.font.color.rgb = TEXT_BODY
        p_t.space_after = Pt(8)

    # Card 2: Concrete Real-World Example (Right)
    create_card(slide2, Inches(6.8), Inches(1.4), Inches(5.733), Inches(5.3))
    tb_p2 = slide2.shapes.add_textbox(Inches(7.0), Inches(1.55), Inches(5.3), Inches(5.0))
    tf_p2 = tb_p2.text_frame
    tf_p2.word_wrap = True

    pp2_0 = tf_p2.paragraphs[0]
    pp2_0.text = "A CONCRETE REAL-WORLD BREAKDOWN"
    pp2_0.font.name = FONT_NAME
    pp2_0.font.size = Pt(12)
    pp2_0.font.bold = True
    pp2_0.font.color.rgb = AMBER_ACCENT
    pp2_0.space_after = Pt(10)

    # Sub-case box
    p_case = tf_p2.add_paragraph()
    p_case.text = "Urgent Corridor: Patna (PNBE) to Bengaluru (SBC)"
    p_case.font.name = FONT_NAME
    p_case.font.size = Pt(13)
    p_case.font.bold = True
    p_case.font.color.rgb = TEXT_MAIN
    p_case.space_after = Pt(6)

    case_points = [
        ("What Happens Today:", "All direct trains (e.g. Sanghamitra Express) are waitlisted at WL 95. The traveler is told 'No tickets available' and turned away."),
        ("Last-Minute Panic:", "Direct emergency flights surge to ₹16,000–₹22,000, which is completely unaffordable for ordinary migrant workers or students."),
        ("The Missed Opportunity:", "A high-frequency morning train connects Patna to Kolkata in 7 hours for ₹450, where hundreds of daily budget flights to Bengaluru cost only ₹3,800."),
        ("Why Travelers Fail Alone:", "Without automated tools, travelers do not know which transit junctions have seats, and they fail to budget realistic road transfer buffers between railway stations and airports.")
    ]
    for title, desc in case_points:
        p_c = tf_p2.add_paragraph()
        p_c.text = f"• {title} "
        p_c.font.name = FONT_NAME
        p_c.font.size = Pt(12.5)
        p_c.font.bold = True
        p_c.font.color.rgb = TEXT_MAIN
        
        run_desc = p_c.add_run()
        run_desc.text = desc
        run_desc.font.name = FONT_NAME
        run_desc.font.size = Pt(12)
        run_desc.font.bold = False
        run_desc.font.color.rgb = TEXT_BODY
        p_c.space_after = Pt(8)

    slide2.notes_slide.notes_text_frame.text = (
        "Every single month, over 25 million waitlisted train tickets are automatically cancelled in India. "
        "When direct trains sell out, booking apps show a dead-end because rail, aviation, and bus systems operate in silos. "
        "Travelers attempting manual connections either pay exorbitant surge fares or miscalculate station-to-airport transfers in Indian traffic."
    )

    # =========================================================================
    # SLIDE 3: SOLUTION AND KEY FEATURES
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    apply_background(slide3)
    add_header(slide3, "The Solution: Multimodal Route Recovery & Buffer Safety", "FUNCTIONALITY, COMPLETENESS & INNOVATION (45 POINTS)", 3)

    features = [
        ("1. Multimodal Route Decomposition", 
         "When direct trains are waitlisted, TravelMate's graph engine discovers verified split alternatives: Train + Train (via Kanpur/Vadodara), Train + Flight (rail-to-air via hub airports), and Train + Intercity Bus.",
         Inches(0.8), Inches(1.4), Inches(5.7), Inches(2.55)),
        
        ("2. Parametric Transfer Buffers (MCT)", 
         "Mathematically enforces Minimum Connection Times: 60 min for Train→Train, 90 min for Train→Bus, and a strict 180 min (3 hours) for Train→Flight to safely cover city road transit and airport security gates.",
         Inches(6.8), Inches(1.4), Inches(5.733), Inches(2.55)),
        
        ("3. Emergency Tatkal Desk", 
         "Millisecond-synchronized live countdown clocks for official 10:00 AM (AC) and 11:00 AM (Non-AC) Tatkal booking windows, paired with instant quota seat checkers and station-hopper bypass suggestions.",
         Inches(0.8), Inches(4.15), Inches(5.7), Inches(2.55)),
        
        ("4. Zero-Network Offline Passes & 14 Indic Languages", 
         "1-tap downloadable offline boarding passes with monospace PNR, leg timings, and verifiable QR codes. Fully localized in 14 Indian languages (Hindi, Telugu, Tamil, Bengali, etc.) with 1-tap SOS emergency dispatch.",
         Inches(6.8), Inches(4.15), Inches(5.733), Inches(2.55))
    ]

    for title, desc, left, top, w, h in features:
        create_card(slide3, left, top, w, h)
        tb_f = slide3.shapes.add_textbox(left + Inches(0.2), top + Inches(0.18), w - Inches(0.4), h - Inches(0.35))
        tf_f = tb_f.text_frame
        tf_f.word_wrap = True

        pf0 = tf_f.paragraphs[0]
        pf0.text = title.upper()
        pf0.font.name = FONT_NAME
        pf0.font.size = Pt(13)
        pf0.font.bold = True
        pf0.font.color.rgb = NAVY_PRIMARY
        pf0.space_after = Pt(8)

        pf1 = tf_f.add_paragraph()
        pf1.text = desc
        pf1.font.name = FONT_NAME
        pf1.font.size = Pt(12.5)
        pf1.font.color.rgb = TEXT_BODY

    slide3.notes_slide.notes_text_frame.text = (
        "TravelMate replaces unavailable screens with verified journeys. It automatically decomposes congested corridors into split routes, "
        "enforces realistic 3-hour transfer buffers between railway stations and airports, provides dedicated Tatkal countdown assistance, "
        "and generates zero-network offline boarding passes across 14 Indian languages."
    )

    # =========================================================================
    # SLIDE 4: ARCHITECTURE & REQUEST FLOW (DETAILED NATIVE SHAPES)
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    apply_background(slide4)
    add_header(slide4, "Architecture: Resilient Serverless Core & API Fusion Layer", "CODE QUALITY & TECHNICAL IMPLEMENTATION (30 POINTS)", 4)

    # Left Container: 4-Tier Architecture Diagram (w=7.4")
    create_card(slide4, Inches(0.8), Inches(1.4), Inches(7.4), Inches(5.3), bg=CARD_BG, border=BORDER_COLOR)

    tb_at = slide4.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(7.0), Inches(0.3))
    tfa = tb_at.text_frame
    tfa.word_wrap = True
    pa0 = tfa.paragraphs[0]
    pa0.text = "COMPONENT ARCHITECTURE (MODULAR SYSTEM DESIGN)"
    pa0.font.name = FONT_NAME
    pa0.font.size = Pt(11)
    pa0.font.bold = True
    pa0.font.color.rgb = NAVY_PRIMARY

    # Tier 1: Client & Presentation Layer
    create_card(slide4, Inches(1.0), Inches(1.85), Inches(7.0), Inches(0.95), bg=RGBColor(249, 250, 251), border=BORDER_STRONG)
    tb_t1 = slide4.shapes.add_textbox(Inches(1.15), Inches(1.92), Inches(6.7), Inches(0.8))
    tt1 = tb_t1.text_frame
    tt1.word_wrap = True
    pt1_0 = tt1.paragraphs[0]
    pt1_0.text = "TIER 1: CLIENT & PRESENTATION LAYER (React 18 SPA + Vite 8 Rolldown)"
    pt1_0.font.name = FONT_NAME
    pt1_0.font.size = Pt(10)
    pt1_0.font.bold = True
    pt1_0.font.color.rgb = NAVY_PRIMARY
    pt1_1 = tt1.add_paragraph()
    pt1_1.text = "• Tailwind CSS Utility Design  • Tabular-nums Schedule Cards  • PWA Offline Service Worker  • LocalStorage Vault"
    pt1_1.font.name = FONT_NAME
    pt1_1.font.size = Pt(10)
    pt1_1.font.color.rgb = TEXT_BODY

    # Tier 2: Auth, Security & API Gateway
    create_card(slide4, Inches(1.0), Inches(2.95), Inches(7.0), Inches(0.95), bg=RGBColor(249, 250, 251), border=BORDER_STRONG)
    tb_t2 = slide4.shapes.add_textbox(Inches(1.15), Inches(3.02), Inches(6.7), Inches(0.8))
    tt2 = tb_t2.text_frame
    tt2.word_wrap = True
    pt2_0 = tt2.paragraphs[0]
    pt2_0.text = "TIER 2: AUTH, SECURITY & SERVERLESS GATEWAY (Vercel Edge & Serverless Functions)"
    pt2_0.font.name = FONT_NAME
    pt2_0.font.size = Pt(10)
    pt2_0.font.bold = True
    pt2_0.font.color.rgb = NAVY_PRIMARY
    pt2_1 = tt2.add_paragraph()
    pt2_1.text = "• Clerk React Auth Integration  • DPDP 2023 Zero-PII Boundary  • Strict CSP Headers  • Route Handlers (/api/*)"
    pt2_1.font.name = FONT_NAME
    pt2_1.font.size = Pt(10)
    pt2_1.font.color.rgb = TEXT_BODY

    # Tier 3: API Fusion & Resilience Core
    create_card(slide4, Inches(1.0), Inches(4.05), Inches(7.0), Inches(1.1), bg=LIGHT_BLUE_BG, border=NAVY_PRIMARY)
    tb_t3 = slide4.shapes.add_textbox(Inches(1.15), Inches(4.12), Inches(6.7), Inches(0.95))
    tt3 = tb_t3.text_frame
    tt3.word_wrap = True
    pt3_0 = tt3.paragraphs[0]
    pt3_0.text = "TIER 3: API FUSION & RESILIENCE CORE (_cache.js & _resilience.js)"
    pt3_0.font.name = FONT_NAME
    pt3_0.font.size = Pt(10.5)
    pt3_0.font.bold = True
    pt3_0.font.color.rgb = NAVY_PRIMARY
    pt3_1 = tt3.add_paragraph()
    pt3_1.text = "• Parallel Flight Search: Skyscanner API + Aviationstack with deduplication and IATA code mapping"
    pt3_1.font.name = FONT_NAME
    pt3_1.font.size = Pt(10)
    pt3_1.font.color.rgb = TEXT_MAIN
    pt3_2 = tt3.add_paragraph()
    pt3_2.text = "• Rail Resilience: RapidAPI IRCTC Live Status + Static Timetable Snapshot fallback • Upstash Redis TTL Cache"
    pt3_2.font.name = FONT_NAME
    pt3_2.font.size = Pt(10)
    pt3_2.font.color.rgb = TEXT_MAIN

    # Tier 4: Graph Routing & Geolocation Engine
    create_card(slide4, Inches(1.0), Inches(5.3), Inches(7.0), Inches(1.1), bg=RGBColor(249, 250, 251), border=BORDER_STRONG)
    tb_t4 = slide4.shapes.add_textbox(Inches(1.15), Inches(5.37), Inches(6.7), Inches(0.95))
    tt4 = tb_t4.text_frame
    tt4.word_wrap = True
    pt4_0 = tt4.paragraphs[0]
    pt4_0.text = "TIER 4: GRAPH ROUTING & GEOLOCATION ENGINE (geoUtils.js & combination.js)"
    pt4_0.font.name = FONT_NAME
    pt4_0.font.size = Pt(10)
    pt4_0.font.bold = True
    pt4_0.font.color.rgb = NAVY_PRIMARY
    pt4_1 = tt4.add_paragraph()
    pt4_1.text = "• Haversine 50km Radius Nearest-Station/Airport Scanner  • 2 & 3-Leg Split Journey Combinator"
    pt4_1.font.name = FONT_NAME
    pt4_1.font.size = Pt(10)
    pt4_1.font.color.rgb = TEXT_BODY
    pt4_2 = tt4.add_paragraph()
    pt4_2.text = "• MCT Transfer Rule Validator  • Provenance Tagger (LIVE, TIMETABLE, ESTIMATE)  • Deep Links (IRCTC/redBus)"
    pt4_2.font.name = FONT_NAME
    pt4_2.font.size = Pt(10)
    pt4_2.font.color.rgb = TEXT_BODY

    # Right Container: Numbered Request Flow (w=4.0")
    create_card(slide4, Inches(8.4), Inches(1.4), Inches(4.133), Inches(5.3), bg=CARD_BG, border=BORDER_COLOR)
    tb_rf = slide4.shapes.add_textbox(Inches(8.6), Inches(1.55), Inches(3.733), Inches(5.0))
    tf_rf = tb_rf.text_frame
    tf_rf.word_wrap = True

    prf0 = tf_rf.paragraphs[0]
    prf0.text = "DETERMINISTIC REQUEST FLOW"
    prf0.font.name = FONT_NAME
    prf0.font.size = Pt(11)
    prf0.font.bold = True
    prf0.font.color.rgb = NAVY_PRIMARY
    prf0.space_after = Pt(8)

    flow_steps = [
        ("1. Query & Geo-Resolution:", "User submits origin/destination. Haversine engine matches railway codes (e.g. NDLS) to nearest airport IATA codes (e.g. DEL)."),
        ("2. Parallel Provider Dispatch:", "Serverless edge triggers parallel requests to flight and rail endpoints with Upstash Redis TTL caching and deadline timeouts."),
        ("3. Fusion & Mode Normalization:", "Deduplicates live flight records, enforces search mode purity, and tags data provenance (LIVE vs TIMETABLE)."),
        ("4. MCT Buffer & Risk Scoring:", "Combinator computes transfer slack against Minimum Connection Times (180m Train→Flight) and assigns safety risk."),
        ("5. Client Render & Offline Sync:", "Ranked routes render with transparent pricing, unbundled official deep-links, and client-side offline QR pass generation.")
    ]
    for title, desc in flow_steps:
        p_s = tf_rf.add_paragraph()
        p_s.text = f"{title} "
        p_s.font.name = FONT_NAME
        p_s.font.size = Pt(11.5)
        p_s.font.bold = True
        p_s.font.color.rgb = TEXT_MAIN

        run_s = p_s.add_run()
        run_s.text = desc
        run_s.font.name = FONT_NAME
        run_s.font.size = Pt(10.5)
        run_s.font.bold = False
        run_s.font.color.rgb = TEXT_BODY
        p_s.space_after = Pt(6)

    slide4.notes_slide.notes_text_frame.text = (
        "Our architecture pairs a lightweight React 18 client with a resilient serverless API fusion layer. "
        "We query rail and aviation endpoints in parallel, deduplicate records, enforce strict timeout boundaries through Upstash Redis, "
        "and validate Minimum Connection Times mathematically before rendering ranked, delay-safe itineraries."
    )

    # =========================================================================
    # SLIDE 5: HOW IT WORKS (SINGLE-MODE & COMBINATION LOGIC)
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    apply_background(slide5)
    add_header(slide5, "How It Works: Geo-Fallback & Transfer Buffer Rules", "INNOVATION & TECHNICAL IMPLEMENTATION (50 POINTS)", 5)

    # Left Container: Single-Mode Search & Geo Fallback
    create_card(slide5, Inches(0.8), Inches(1.4), Inches(5.7), Inches(5.3))
    tb_sm = slide5.shapes.add_textbox(Inches(1.0), Inches(1.55), Inches(5.3), Inches(5.0))
    tf_sm = tb_sm.text_frame
    tf_sm.word_wrap = True

    psm0 = tf_sm.paragraphs[0]
    psm0.text = "MODE 1: SINGLE-MODE SEARCH WITH GEO-FALLBACK"
    psm0.font.name = FONT_NAME
    psm0.font.size = Pt(12)
    psm0.font.bold = True
    psm0.font.color.rgb = NAVY_PRIMARY
    psm0.space_after = Pt(10)

    sm_points = [
        ("Haversine 50 km Radius Fallback:", "When no direct train is found for an origin/destination, the engine automatically searches within a 50 km radius using Haversine calculation to find alternative stations (e.g. NDLS → Ghaziabad or Anand Vihar)."),
        ("Origin & Destination Node Tagging:", "Feeder stations and airports are cleanly labeled with distance tags (e.g. 'GZB +24km from origin' or 'DEL +18km')."),
        ("Best-Provider Selection & Ranking:", "Ranks direct transport options by verified speed, departure time convenience, and fare transparency."),
        ("Strict Mode Purity Filter:", "Enforces absolute mode purity so that train searches never pollute user results with buses or flights.")
    ]
    for title, desc in sm_points:
        p_sm = tf_sm.add_paragraph()
        p_sm.text = f"• {title} "
        p_sm.font.name = FONT_NAME
        p_sm.font.size = Pt(12.5)
        p_sm.font.bold = True
        p_sm.font.color.rgb = TEXT_MAIN

        r_sm = p_sm.add_run()
        r_sm.text = desc
        r_sm.font.name = FONT_NAME
        r_sm.font.size = Pt(12)
        r_sm.font.bold = False
        r_sm.font.color.rgb = TEXT_BODY
        p_sm.space_after = Pt(10)

    # Right Container: Combination Mode & Transfer Rules
    create_card(slide5, Inches(6.8), Inches(1.4), Inches(5.733), Inches(5.3))
    tb_cm = slide5.shapes.add_textbox(Inches(7.0), Inches(1.55), Inches(5.3), Inches(5.0))
    tf_cm = tb_cm.text_frame
    tf_cm.word_wrap = True

    pcm0 = tf_cm.paragraphs[0]
    pcm0.text = "MODE 2: MULTIMODAL COMBINATIONS & BUFFER RULES"
    pcm0.font.name = FONT_NAME
    pcm0.font.size = Pt(12)
    pcm0.font.bold = True
    pcm0.font.color.rgb = NAVY_PRIMARY
    pcm0.space_after = Pt(10)

    cm_points = [
        ("Hub Route Decomposition:", "Decomposes long journeys across intermediate transit hubs (Kanpur Central, Vadodara, Kolkata, Nagpur) using 2-leg and 3-leg graph assembly."),
        ("Deterministic MCT Safety Buffers:", "Enforces Minimum Connection Times between arrivals and departures:\n   • Train → Train: 60 minutes minimum slack\n   • Train → Intercity Bus: 90 minutes minimum slack\n   • Train → Domestic Flight: 180 minutes (3 hours minimum buffer)"),
        ("Why 180 Min for Train→Flight:", "Crucially accounts for 60 min city taxi/road transfer from railway terminal to airport, plus 120 min domestic security check-in."),
        ("Parametric Connection Risk Scoring:", "Every connection is mathematically scored: LOW RISK / SAFE (slack ≥ MCT + 30m), MODERATE (MCT + 10m to 29m), or CRITICAL (slack < MCT + 10m).")
    ]
    for title, desc in cm_points:
        p_cm = tf_cm.add_paragraph()
        p_cm.text = f"• {title} "
        p_cm.font.name = FONT_NAME
        p_cm.font.size = Pt(12.5)
        p_cm.font.bold = True
        p_cm.font.color.rgb = TEXT_MAIN

        r_cm = p_cm.add_run()
        r_cm.text = desc
        r_cm.font.name = FONT_NAME
        r_cm.font.size = Pt(12)
        r_cm.font.bold = False
        r_cm.font.color.rgb = TEXT_BODY
        p_cm.space_after = Pt(8)

    slide5.notes_slide.notes_text_frame.text = (
        "How does TravelMate guarantee connection safety? We enforce deterministic transfer rules. "
        "For a Train plus Flight combination, the engine strictly requires a 3-hour minimum connection buffer between rail arrival and flight departure "
        "to account for road transit to the airport and security clearance. Any route failing this buffer is flagged or filtered out."
    )

    # =========================================================================
    # SLIDE 6: DEMO AND PROOF (REAL SCREENSHOTS & TEST RESULTS)
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    apply_background(slide6)
    add_header(slide6, "Working Demo & Proof: Real Implementation & Test Results", "PROJECT FUNCTIONALITY & DEMONSTRATION (35 POINTS)", 6)

    # 4 Real Screenshots Grid
    screenshots = [
        ("outputs/screenshots/home.png", "1. Connected Search & Corridor Selection", Inches(0.8), Inches(1.4), Inches(4.3), Inches(2.35)),
        ("outputs/screenshots/planner_results.png", "2. Multimodal Results with 3h Transfer Buffer", Inches(5.3), Inches(1.4), Inches(4.3), Inches(2.35)),
        ("outputs/screenshots/tatkal_desk.png", "3. Emergency Tatkal Real-Time Countdown", Inches(0.8), Inches(4.0), Inches(4.3), Inches(2.35)),
        ("outputs/screenshots/safety_hub.png", "4. Offline Digital Pass & Safety Hub", Inches(5.3), Inches(4.0), Inches(4.3), Inches(2.35))
    ]

    for img_path, caption, left, top, w, h in screenshots:
        create_card(slide6, left, top, w, h)
        if os.path.exists(img_path):
            slide6.shapes.add_picture(img_path, left + Inches(0.08), top + Inches(0.08), w - Inches(0.16), h - Inches(0.42))
        
        # Caption box
        cb = slide6.shapes.add_textbox(left + Inches(0.1), top + h - Inches(0.32), w - Inches(0.2), Inches(0.28))
        tfc = cb.text_frame
        tfc.word_wrap = True
        tfc.margin_left = tfc.margin_right = tfc.margin_top = tfc.margin_bottom = 0
        pc = tfc.paragraphs[0]
        pc.text = caption
        pc.font.name = FONT_NAME
        pc.font.size = Pt(10)
        pc.font.bold = True
        pc.font.color.rgb = NAVY_PRIMARY

    # Right Column: Empirical Test Verification Ledger
    create_card(slide6, Inches(9.8), Inches(1.4), Inches(2.733), Inches(5.3), bg=CARD_BG, border=BORDER_COLOR)
    tb_tst = slide6.shapes.add_textbox(Inches(9.95), Inches(1.55), Inches(2.433), Inches(5.0))
    tf_tst = tb_tst.text_frame
    tf_tst.word_wrap = True

    ptst0 = tf_tst.paragraphs[0]
    ptst0.text = "EMPIRICAL TEST EVIDENCE"
    ptst0.font.name = FONT_NAME
    ptst0.font.size = Pt(11)
    ptst0.font.bold = True
    ptst0.font.color.rgb = GREEN_ACCENT
    ptst0.space_after = Pt(8)

    test_proofs = [
        ("136 / 136 Transport Tests Passing:", "Rigorous validation of MCT buffer formulas, Haversine geo radius, mode purity, and Upstash Redis resilience."),
        ("308+ Unit & E2E Tests Passing:", "Node native test runner verifies route parsing, date validation, and recovery algorithms."),
        ("0 WCAG 2.1 AA Violations:", "Automated Playwright Axe-core color contrast checks passed across all 7 routes."),
        ("Clean Production Build:", "Vite 8 compiles client environment cleanly in 3.5s with zero syntax or import errors."),
        ("Live & Verifiable:", "Production deployed on Vercel at travelmate-ai-flowzint.vercel.app.")
    ]
    for title, desc in test_proofs:
        p_t = tf_tst.add_paragraph()
        p_t.text = f"• {title} "
        p_t.font.name = FONT_NAME
        p_t.font.size = Pt(10.5)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_MAIN

        r_t = p_t.add_run()
        r_t.text = desc
        r_t.font.name = FONT_NAME
        r_t.font.size = Pt(9.5)
        r_t.font.color.rgb = TEXT_BODY
        p_t.space_after = Pt(6)

    slide6.notes_slide.notes_text_frame.text = (
        "This is not a mock concept. TravelMate is fully functional and deployed live on Vercel. "
        "Every algorithmic rule is empirically verified by our 136-test transport suite and 308-test end-to-end battery, "
        "with zero WCAG accessibility violations across all routes."
    )

    # =========================================================================
    # SLIDE 7: IMPACT, LIMITATIONS, NEXT STEPS & TEAM
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    apply_background(slide7)
    add_header(slide7, "Impact, Open Limitations, Next Steps & Team Contributions", "REAL-WORLD IMPACT & EXECUTION (25 POINTS)", 7)

    # Left Container: Real-World Impact & Limitations
    create_card(slide7, Inches(0.8), Inches(1.4), Inches(5.7), Inches(5.3))
    tb_imp = slide7.shapes.add_textbox(Inches(1.0), Inches(1.55), Inches(5.3), Inches(5.0))
    tf_imp = tb_imp.text_frame
    tf_imp.word_wrap = True

    pimp0 = tf_imp.paragraphs[0]
    pimp0.text = "REAL-WORLD IMPACT & HONEST LIMITATIONS"
    pimp0.font.name = FONT_NAME
    pimp0.font.size = Pt(12)
    pimp0.font.bold = True
    pimp0.font.color.rgb = NAVY_PRIMARY
    pimp0.space_after = Pt(10)

    impact_points = [
        ("Passenger Empowerment:", "Turns guaranteed travel cancellations into viable journeys, protecting stranded passengers from unauthorized ticket touts and emergency airfare surges."),
        ("Next-Billion Accessibility:", "14 localized Indic languages and low-bandwidth 2G optimization make transit recovery accessible across tier-2/tier-3 India."),
        ("DPDP 2023 Compliance:", "Zero-PII architecture protects passenger privacy; travel profiles and passes stay strictly on the local device."),
        ("Honest Limitation — Unbundled Ticketing:", "TravelMate is a discovery and route recovery engine; it does not collect card/UPI payments. Users finalize bookings via verified deep links on official portals (IRCTC, airlines, redBus)."),
        ("Honest Limitation — Provider Quotas:", "Live data depends on upstream API availability (Skyscanner/Aviationstack/RapidAPI); cached timetables ensure graceful fallback when upstream quotas expire.")
    ]
    for title, desc in impact_points:
        p_i = tf_imp.add_paragraph()
        p_i.text = f"• {title} "
        p_i.font.name = FONT_NAME
        p_i.font.size = Pt(11.5)
        p_i.font.bold = True
        p_i.font.color.rgb = TEXT_MAIN

        r_i = p_i.add_run()
        r_i.text = desc
        r_i.font.name = FONT_NAME
        r_i.font.size = Pt(11)
        r_i.font.color.rgb = TEXT_BODY
        p_i.space_after = Pt(8)

    # Right Container: Next Steps & Team Contributions
    create_card(slide7, Inches(6.8), Inches(1.4), Inches(5.733), Inches(5.3))
    tb_nxt = slide7.shapes.add_textbox(Inches(7.0), Inches(1.55), Inches(5.3), Inches(5.0))
    tf_nxt = tb_nxt.text_frame
    tf_nxt.word_wrap = True

    pnxt0 = tf_nxt.paragraphs[0]
    pnxt0.text = "NEXT STEPS & TEAM CONTRIBUTIONS"
    pnxt0.font.name = FONT_NAME
    pnxt0.font.size = Pt(12)
    pnxt0.font.bold = True
    pnxt0.font.color.rgb = NAVY_PRIMARY
    pnxt0.space_after = Pt(10)

    next_points = [
        ("ONDC Mobility Protocol Integration:", "Roadmap to integrate Open Network for Digital Commerce (ONDC) protocols for unified 1-click cart checkout across railways, state buses, and airlines."),
        ("Crowdsourced Telemetry & PWA Nodes:", "Enabling on-train passengers to report real-time junction delays to continuously refine transfer risk probabilities."),
        ("Surendra G (Team Lead & Full-Stack Architect):", "Full-Stack React architecture, API fusion layer, Upstash Redis caching, serverless edge functions, and 459 automated test assertions."),
        ("Rishitha (Co-Developer & Frontend / UI-UX Lead):", "Accessible UI/UX implementation (WCAG 2.1 AA), multimodal timeline components, offline traveler pass, and user workflow testing."),
        ("AI Tooling Disclosure (Rule 5):", "Generative AI was used transparently for code scaffolding, repetitive test assertions, and vocabulary maps. System architecture, graph heuristics, and safety formulas were authored and verified by the team.")
    ]
    for title, desc in next_points:
        p_n = tf_nxt.add_paragraph()
        p_n.text = f"• {title} "
        p_n.font.name = FONT_NAME
        p_n.font.size = Pt(11.5)
        p_n.font.bold = True
        p_n.font.color.rgb = TEXT_MAIN

        r_n = p_n.add_run()
        r_n.text = desc
        r_n.font.name = FONT_NAME
        r_n.font.size = Pt(11)
        r_n.font.color.rgb = TEXT_BODY
        p_n.space_after = Pt(6)

    slide7.notes_slide.notes_text_frame.text = (
        "TravelMate bridges India's transit divide by giving travelers actionable alternatives when direct tickets sell out. "
        "While ticketing remains unbundled on official portals today, our roadmap focuses on direct ONDC mobility integration. "
        "Thank you for your time, and we look forward to your questions."
    )

    output_path = "outputs/TravelMate_BuildX_2026.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path} with {len(prs.slides)} slides.")

if __name__ == "__main__":
    create_deck()
