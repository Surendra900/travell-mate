import os
import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

# -----------------------------------------------------------------------------
# DESIGN TOKENS & COLOR PALETTE (Mirroring the Reference Gamma Template)
# -----------------------------------------------------------------------------
BG_CREAM       = RGBColor(0xFA, 0xF8, 0xF3)  # Warm ivory background
TERRACOTTA     = RGBColor(0xB4, 0x4C, 0x2D)  # Rich burnt terracotta
TERRACOTTA_DARK= RGBColor(0x9E, 0x3E, 0x23)
SLATE_DARK     = RGBColor(0x1E, 0x29, 0x3B)  # Charcoal slate for primary text
SLATE_MUTED    = RGBColor(0x64, 0x74, 0x8B)  # Secondary muted slate
SLATE_LIGHT    = RGBColor(0x47, 0x55, 0x69)
SOFT_BLUE      = RGBColor(0x7A, 0xA6, 0xC2)  # Muted sky blue
NAVY_BLUE      = RGBColor(0x1E, 0x3A, 0x5F)  # Deep slate navy
CARD_LIGHT     = RGBColor(0xF2, 0xEF, 0xE9)  # Soft sand card fill
CARD_BORDER    = RGBColor(0xE2, 0xDC, 0xD0)  # Subtle border outline
LINE_DIVIDER   = RGBColor(0xD5, 0xCF, 0xC2)  # Category rule line
WHITE          = RGBColor(0xFF, 0xFF, 0xFF)

FONT_PRIMARY   = 'Segoe UI'
FONT_SERIF     = 'Georgia'

# Directory paths
PITCH_DIR      = r'c:\Users\SURENDRA.G\.gemini\antigravity\scratch\TravelMate-Pitch'
ASSETS_DIR     = os.path.join(PITCH_DIR, 'assets', 'extracted_photos')
OUT_PPTX       = os.path.join(PITCH_DIR, 'TravelMate-Pitch.pptx')

# -----------------------------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------------------------
def set_bg(slide):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = BG_CREAM

def add_header(slide, tracker_text, headline_text, subtitle_text=None, tracker_color=SLATE_MUTED):
    """
    Standard Gamma-style header:
    TRACKER TEXT ──────────────────────────
    Large Bold Headline
    Optional Subtitle
    """
    # Tracker text
    tb_tr = slide.shapes.add_textbox(Inches(0.8), Inches(0.42), Inches(3.2), Inches(0.35))
    tf_tr = tb_tr.text_frame
    tf_tr.word_wrap = True
    tf_tr.margin_left = tf_tr.margin_right = tf_tr.margin_top = tf_tr.margin_bottom = 0
    p_tr = tf_tr.paragraphs[0]
    p_tr.text = tracker_text.upper()
    p_tr.font.name = FONT_PRIMARY
    p_tr.font.size = Pt(9.5)
    p_tr.font.bold = True
    p_tr.font.color.rgb = tracker_color

    # Thin horizontal accent rule
    rule = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        Inches(0.8), Inches(0.82), Inches(11.73), Pt(1.2)
    )
    rule.fill.solid()
    rule.fill.fore_color.rgb = LINE_DIVIDER
    rule.line.fill.background()

    # Title & Subtitle block
    top_pos = Inches(0.95)
    tb_title = slide.shapes.add_textbox(Inches(0.8), top_pos, Inches(11.73), Inches(1.1))
    tf_title = tb_title.text_frame
    tf_title.word_wrap = True
    tf_title.margin_left = tf_title.margin_right = tf_title.margin_top = tf_title.margin_bottom = 0
    
    p_title = tf_title.paragraphs[0]
    p_title.text = headline_text
    p_title.font.name = FONT_PRIMARY
    p_title.font.size = Pt(25)
    p_title.font.bold = True
    p_title.font.color.rgb = SLATE_DARK
    p_title.space_after = Pt(3)

    if subtitle_text:
        p_sub = tf_title.add_paragraph()
        p_sub.text = subtitle_text
        p_sub.font.name = FONT_PRIMARY
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = SLATE_MUTED

def add_card(slide, left, top, width, height, bg_color, border_color=None, corner_radius=None):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    if border_color:
        card.line.color.rgb = border_color
        card.line.width = Pt(1.2)
    else:
        card.line.fill.background()
    return card

# -----------------------------------------------------------------------------
# PRESENTATION INITIALIZATION
# -----------------------------------------------------------------------------
prs = pptx.Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

print("Building 10-slide professional TravelMate AI pitch deck...")

# =============================================================================
# SLIDE 1: TITLE & HERO COVER
# =============================================================================
s1 = prs.slides.add_slide(blank_layout)
set_bg(s1)

# Background hero photo (train platform)
img_s1 = os.path.join(ASSETS_DIR, 'page_01_img_01_X4.jpg')
if os.path.exists(img_s1):
    s1.shapes.add_picture(img_s1, 0, 0, width=Inches(13.333), height=Inches(7.5))

# Dark subtle gradient overlay to ensure perfect contrast
overlay = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
overlay.fill.solid()
overlay.fill.fore_color.rgb = RGBColor(0x00, 0x00, 0x00)
# PPTX does not support direct alpha transparency on solid fill cleanly in all versions,
# so we use a rich terracotta banner on top as in the reference Gamma template!

# Terracotta Banner (Bottom half, matching Gamma template)
banner = s1.shapes.add_shape(
    MSO_SHAPE.RECTANGLE,
    Inches(0.8), Inches(4.2), Inches(7.8), Inches(2.7)
)
banner.fill.solid()
banner.fill.fore_color.rgb = TERRACOTTA
banner.line.fill.background()

tb_b = s1.shapes.add_textbox(Inches(1.2), Inches(4.4), Inches(7.0), Inches(2.3))
tf_b = tb_b.text_frame
tf_b.word_wrap = True
tf_b.margin_left = tf_b.margin_right = tf_b.margin_top = tf_b.margin_bottom = 0

p0 = tf_b.paragraphs[0]
p0.text = "HACKATHON PITCH · VORTEX 2K26"
p0.font.name = FONT_PRIMARY
p0.font.size = Pt(10)
p0.font.bold = True
p0.font.color.rgb = RGBColor(0xFD, 0xBA, 0x9A)
p0.space_after = Pt(6)

p1 = tf_b.add_paragraph()
p1.text = "TravelMate AI"
p1.font.name = FONT_PRIMARY
p1.font.size = Pt(40)
p1.font.bold = True
p1.font.color.rgb = WHITE
p1.space_after = Pt(4)

p2 = tf_b.add_paragraph()
p2.text = "One assistant for the journey, the disruption, and the emergency."
p2.font.name = FONT_PRIMARY
p2.font.size = Pt(14)
p2.font.color.rgb = RGBColor(0xFF, 0xEE, 0xE6)
p2.space_after = Pt(10)

p3 = tf_b.add_paragraph()
p3.text = "Surendra & Rishitha | Open Innovation | 56 Verified Tests | Clean Vercel Production Build"
p3.font.name = FONT_PRIMARY
p3.font.size = Pt(9.5)
p3.font.color.rgb = RGBColor(0xFD, 0xBA, 0x9A)

print("Slide 1 generated.")

# =============================================================================
# SLIDE 2: THE PROBLEM (Split Layout: Points Left, Photo Right)
# =============================================================================
s2 = prs.slides.add_slide(blank_layout)
set_bg(s2)

add_header(
    s2,
    "THE PROBLEM",
    "Travel is fragmented when people need certainty most",
    "Indian Railways carries over 20M passengers daily, yet unexpected disruptions leave travelers with zero unified recourse."
)

# Left Column: 3 Substantive Points
left_x = Inches(0.8)
start_y = Inches(2.25)
col_w = Inches(6.2)

problems = [
    (
        "01",
        "The Waitlist Wall",
        "Direct express trains routinely exhaust seat quotas weeks in advance. When direct tickets hit WL/RAC status, travelers lack any unified tool to discover viable indirect junction routes."
    ),
    (
        "02",
        "Siloed Transport Networks",
        "Rail (IRCTC), inter-state buses (SRTC & private fleets), and domestic flights operate in isolated apps with zero cross-mode schedule visibility or transfer coordination."
    ),
    (
        "03",
        "Transfer & Connectivity Risk",
        "Intermodal transfers carry severe missed-connection risks when delays propagate. Cellular connectivity drops along remote transit tracks, disabling cloud-only travel tools."
    )
]

curr_y = start_y
for num, heading, body in problems:
    # Number badge
    tb_n = s2.shapes.add_textbox(left_x, curr_y, Inches(0.55), Inches(0.4))
    tf_n = tb_n.text_frame
    tf_n.word_wrap = True
    tf_n.margin_left = tf_n.margin_right = tf_n.margin_top = tf_n.margin_bottom = 0
    pn = tf_n.paragraphs[0]
    pn.text = num
    pn.font.name = FONT_PRIMARY
    pn.font.size = Pt(14)
    pn.font.bold = True
    pn.font.color.rgb = TERRACOTTA

    # Text block
    tb_t = s2.shapes.add_textbox(left_x + Inches(0.65), curr_y, col_w - Inches(0.65), Inches(1.15))
    tf_t = tb_t.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = tf_t.margin_right = tf_t.margin_top = tf_t.margin_bottom = 0
    pt = tf_t.paragraphs[0]
    pt.text = heading
    pt.font.name = FONT_PRIMARY
    pt.font.size = Pt(13)
    pt.font.bold = True
    pt.font.color.rgb = SLATE_DARK
    pt.space_after = Pt(2)

    pb = tf_t.add_paragraph()
    pb.text = body
    pb.font.name = FONT_PRIMARY
    pb.font.size = Pt(10.5)
    pb.font.color.rgb = SLATE_LIGHT

    curr_y += Inches(1.45)

# Right Column: High-Res Photo (page_02_img_01_X7.jpg)
img_s2 = os.path.join(ASSETS_DIR, 'page_02_img_01_X7.jpg')
if os.path.exists(img_s2):
    s2.shapes.add_picture(img_s2, Inches(7.4), Inches(2.1), width=Inches(5.13), height=Inches(4.8))

print("Slide 2 generated.")

# =============================================================================
# SLIDE 3: THE PRODUCT (Split Layout: Photo Left, 3 Capability Blocks Right)
# =============================================================================
s3 = prs.slides.add_slide(blank_layout)
set_bg(s3)

add_header(
    s3,
    "THE PRODUCT",
    "One assistant for the journey, the disruption, and the emergency",
    "TravelMate AI functions as an assistive route-recovery layer, finding viable journeys when preferred direct trains are full."
)

# Left Column: High-Res Photo (page_03_img_01_X4.jpg)
img_s3 = os.path.join(ASSETS_DIR, 'page_03_img_01_X4.jpg')
if os.path.exists(img_s3):
    s3.shapes.add_picture(img_s3, Inches(0.8), Inches(2.1), width=Inches(4.8), height=Inches(4.8))

# Right Column: 3 Pillars (Plan, Adapt, Stay Safe)
right_x = Inches(6.0)
curr_y = Inches(2.25)
col_w = Inches(6.5)

pillars = [
    (
        "01",
        "Plan: Multimodal Corridor Recovery",
        "Compares train, inter-state bus, and domestic flight combinations across 25 high-capacity regional junction hubs (e.g. Kanpur Central, Itarsi, DDU) in one continuous search flow."
    ),
    (
        "02",
        "Adapt: Dynamic Delay & Transfer Risk Simulator",
        "Switches from waitlisted trains to viable split-leg alternatives. Evaluates Minimum Connection Times (MCT) and simulates delays with live recalculation before travelers depart."
    ),
    (
        "03",
        "Stay Safe: Offline Pass & Transit Protection",
        "Keeps critical itinerary details, QR codes, platform notes, and emergency helplines accessible even when network connectivity drops. Instant one-tap calling to 112 and 139 RailMadad."
    )
]

for num, title, desc in pillars:
    add_card(s3, right_x, curr_y, col_w, Inches(1.3), CARD_LIGHT, CARD_BORDER)

    tb = s3.shapes.add_textbox(right_x + Inches(0.25), curr_y + Inches(0.18), col_w - Inches(0.5), Inches(0.95))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

    p_head = tf.paragraphs[0]
    p_head.text = f"{num}  {title}"
    p_head.font.name = FONT_PRIMARY
    p_head.font.size = Pt(13)
    p_head.font.bold = True
    p_head.font.color.rgb = TERRACOTTA
    p_head.space_after = Pt(2)

    p_body = tf.add_paragraph()
    p_body.text = desc
    p_body.font.name = FONT_PRIMARY
    p_body.font.size = Pt(10)
    p_body.font.color.rgb = SLATE_LIGHT

    curr_y += Inches(1.5)

print("Slide 3 generated.")

# =============================================================================
# SLIDE 4: INNOVATION & ORIGINALITY (2x2 Colored Grid - Exact Gamma Layout)
# =============================================================================
s4 = prs.slides.add_slide(blank_layout)
set_bg(s4)

add_header(
    s4,
    "INNOVATION · ORIGINALITY",
    "Resilience is the product, not a feature",
    "Engineered specifically for real transit friction: waitlist sellouts, sudden delays, and network dropouts."
)

card_w = Inches(5.65)
card_h = Inches(2.25)
row1_y = Inches(2.25)
row2_y = Inches(4.75)
col1_x = Inches(0.8)
col2_x = Inches(6.88)

# Card 1: Top-Left (Terracotta #B44C2D)
add_card(s4, col1_x, row1_y, card_w, card_h, TERRACOTTA)
tb_c1 = s4.shapes.add_textbox(col1_x + Inches(0.35), row1_y + Inches(0.25), card_w - Inches(0.7), card_h - Inches(0.5))
tf_c1 = tb_c1.text_frame
tf_c1.word_wrap = True
tf_c1.margin_left = tf_c1.margin_right = tf_c1.margin_top = tf_c1.margin_bottom = 0

p = tf_c1.paragraphs[0]
p.text = "EMERGENCY TATKAL DESK"
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = RGBColor(0xFD, 0xBA, 0x9A)
p.space_after = Pt(4)

p = tf_c1.add_paragraph()
p.text = "Live quota timers & 1-click master pass"
p.font.name = FONT_PRIMARY
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = WHITE
p.space_after = Pt(4)

p = tf_c1.add_paragraph()
p.text = "Synchronized dual-window countdowns for 10:00 AM (AC) and 11:00 AM (Non-AC) openings. Passenger master lists stored locally with one-click clipboard auto-fill. Zero bot automation."
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.color.rgb = RGBColor(0xFF, 0xEE, 0xE6)

# Card 2: Top-Right (Soft Sky Blue #7AA6C2)
add_card(s4, col2_x, row1_y, card_w, card_h, SOFT_BLUE)
tb_c2 = s4.shapes.add_textbox(col2_x + Inches(0.35), row1_y + Inches(0.25), card_w - Inches(0.7), card_h - Inches(0.5))
tf_c2 = tb_c2.text_frame
tf_c2.word_wrap = True
tf_c2.margin_left = tf_c2.margin_right = tf_c2.margin_top = tf_c2.margin_bottom = 0

p = tf_c2.paragraphs[0]
p.text = "TRANSIT SAFETY MODE"
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = NAVY_BLUE
p.space_after = Pt(4)

p = tf_c2.add_paragraph()
p.text = "One-tap emergency SOS & live GPS sharing"
p.font.name = FONT_PRIMARY
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = SLATE_DARK
p.space_after = Pt(4)

p = tf_c2.add_paragraph()
p.text = "Direct one-tap calling to 112 (National Emergency) and 139 (RailMadad). Formats emergency GPS-stamped SMS/WhatsApp dispatch to personal contacts without server telemetry tracking."
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.color.rgb = SLATE_DARK

# Card 3: Bottom-Left (Navy Blue #1E3A5F)
add_card(s4, col1_x, row2_y, card_w, card_h, NAVY_BLUE)
tb_c3 = s4.shapes.add_textbox(col1_x + Inches(0.35), row2_y + Inches(0.25), card_w - Inches(0.7), card_h - Inches(0.5))
tf_c3 = tb_c3.text_frame
tf_c3.word_wrap = True
tf_c3.margin_left = tf_c3.margin_right = tf_c3.margin_top = tf_c3.margin_bottom = 0

p = tf_c3.paragraphs[0]
p.text = "OFFLINE TRAVELER PASS"
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = SOFT_BLUE
p.space_after = Pt(4)

p = tf_c3.add_paragraph()
p.text = "Local-first PWA with verified QR trip codes"
p.font.name = FONT_PRIMARY
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = WHITE
p.space_after = Pt(4)

p = tf_c3.add_paragraph()
p.text = "Service Worker caching stores the complete journey itinerary, stop sequences, and station helpline directory on-device. Fully accessible in remote areas, tunnels, and airplane mode."
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.color.rgb = RGBColor(0xDF, 0xE9, 0xF5)

# Card 4: Bottom-Right (Light Sand #F2EFE9 + Border)
add_card(s4, col2_x, row2_y, card_w, card_h, CARD_LIGHT, CARD_BORDER)
tb_c4 = s4.shapes.add_textbox(col2_x + Inches(0.35), row2_y + Inches(0.25), card_w - Inches(0.7), card_h - Inches(0.5))
tf_c4 = tb_c4.text_frame
tf_c4.word_wrap = True
tf_c4.margin_left = tf_c4.margin_right = tf_c4.margin_top = tf_c4.margin_bottom = 0

p = tf_c4.paragraphs[0]
p.text = "5-TIER DATA PROVENANCE"
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = TERRACOTTA
p.space_after = Pt(4)

p = tf_c4.add_paragraph()
p.text = "Transparent badges & independent booking disclaimers"
p.font.name = FONT_PRIMARY
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = SLATE_DARK
p.space_after = Pt(4)

p = tf_c4.add_paragraph()
p.text = "Distinguishes LIVE provider data, static TIMETABLES, and calculated ESTIMATES. Never claims unverified confirmed seats. Displays mandatory statutory warnings on split-leg liability."
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.color.rgb = SLATE_LIGHT

print("Slide 4 generated.")

# =============================================================================
# SLIDE 5: TECHNICAL IMPLEMENTATION (3 Top Cards + 1 Wide Bottom Card)
# =============================================================================
s5 = prs.slides.add_slide(blank_layout)
set_bg(s5)

add_header(
    s5,
    "TECHNICAL IMPLEMENTATION",
    "The core experience is already working",
    "Layered architecture combining responsive presentation, serverless integrations, and offline persistence."
)

top_c_w = Inches(3.64)
top_c_h = Inches(2.6)
top_y   = Inches(2.2)

# Top Card 1: Experience Layer
add_card(s5, Inches(0.8), top_y, top_c_w, top_c_h, CARD_LIGHT, CARD_BORDER)
tb = s5.shapes.add_textbox(Inches(1.05), top_y + Inches(0.25), top_c_w - Inches(0.5), top_c_h - Inches(0.5))
tf = tb.text_frame
tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

p = tf.paragraphs[0]
p.text = "EXPERIENCE LAYER"
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = TERRACOTTA
p.space_after = Pt(3)

p = tf.add_paragraph()
p.text = "React 18 + Vite Frontend"
p.font.name = FONT_PRIMARY
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = SLATE_DARK
p.space_after = Pt(4)

p = tf.add_paragraph()
p.text = "• Responsive mobile-first PWA\n• Leaflet 1.9.4 lazy-loaded route maps\n• Web Speech API voice search\n• Accessible ARIA combobox station search\n• 44×44px mobile touch targets"
p.font.name = FONT_PRIMARY
p.font.size = Pt(9.5)
p.font.color.rgb = SLATE_LIGHT

# Top Card 2: Service Layer (Soft Sky Blue)
add_card(s5, Inches(4.84), top_y, top_c_w, top_c_h, SOFT_BLUE)
tb = s5.shapes.add_textbox(Inches(5.09), top_y + Inches(0.25), top_c_w - Inches(0.5), top_c_h - Inches(0.5))
tf = tb.text_frame
tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

p = tf.paragraphs[0]
p.text = "SERVICE LAYER"
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = NAVY_BLUE
p.space_after = Pt(3)

p = tf.add_paragraph()
p.text = "Vercel Serverless Functions"
p.font.name = FONT_PRIMARY
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = SLATE_DARK
p.space_after = Pt(4)

p = tf.add_paragraph()
p.text = "• RapidAPI IRCTC rail & Skyscanner flights\n• SambaNova AI Zod query parser\n• Multilingual translation endpoints\n• Upstash Redis distributed rate limiting\n• Sanitized public provider errors"
p.font.name = FONT_PRIMARY
p.font.size = Pt(9.5)
p.font.color.rgb = SLATE_DARK

# Top Card 3: Resilience Layer
add_card(s5, Inches(8.88), top_y, top_c_w, top_c_h, CARD_LIGHT, CARD_BORDER)
tb = s5.shapes.add_textbox(Inches(9.13), top_y + Inches(0.25), top_c_w - Inches(0.5), top_c_h - Inches(0.5))
tf = tb.text_frame
tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

p = tf.paragraphs[0]
p.text = "RESILIENCE LAYER"
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = TERRACOTTA
p.space_after = Pt(3)

p = tf.add_paragraph()
p.text = "Local-First Core & Storage"
p.font.name = FONT_PRIMARY
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = SLATE_DARK
p.space_after = Pt(4)

p = tf.add_paragraph()
p.text = "• Service Worker Cache Storage\n• LocalStorage trip pass persistence\n• 47 railway hub timetable graph\n• 25 junction contingency models\n• Open-Meteo weather disruption radar"
p.font.name = FONT_PRIMARY
p.font.size = Pt(9.5)
p.font.color.rgb = SLATE_LIGHT

# Wide Bottom Card: Security, Scalability & Quality Verification (Terracotta)
bot_y = Inches(5.05)
bot_w = Inches(11.73)
bot_h = Inches(1.85)

add_card(s5, Inches(0.8), bot_y, bot_w, bot_h, TERRACOTTA)
tb_bot = s5.shapes.add_textbox(Inches(1.15), bot_y + Inches(0.22), bot_w - Inches(0.7), bot_h - Inches(0.44))
tf_bot = tb_bot.text_frame
tf_bot.word_wrap = True
tf_bot.margin_left = tf_bot.margin_right = tf_bot.margin_top = tf_bot.margin_bottom = 0

p = tf_bot.paragraphs[0]
p.text = "INTERACTION LAYER & EVIDENCE OF QUALITY"
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = RGBColor(0xFD, 0xBA, 0x9A)
p.space_after = Pt(3)

p = tf_bot.add_paragraph()
p.text = "Proven reliability: 56 automated tests passed with zero failures · Clean 32s production build"
p.font.name = FONT_PRIMARY
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = WHITE
p.space_after = Pt(3)

p = tf_bot.add_paragraph()
p.text = "Leaflet route maps, Web Speech API voice search, and browser geolocation complete the core experience. Server-side secrets, strict Content Security Policy, and DPDP 2023 compliance protect passenger data."
p.font.name = FONT_PRIMARY
p.font.size = Pt(9.5)
p.font.color.rgb = RGBColor(0xFF, 0xEE, 0xE6)

print("Slide 5 generated.")

# =============================================================================
# SLIDE 6: PRODUCT WALKTHROUGH / DEMO (Photo Left, 4 Steps Right)
# =============================================================================
s6 = prs.slides.add_slide(blank_layout)
set_bg(s6)

add_header(
    s6,
    "PRESENTATION · DEMO",
    "From uncertainty to a safe next move",
    "A concise 75-second walkthrough demonstrating live disruption recovery on Indian trunk corridors."
)

# Left Column: Photo (page_06_img_01_X5.jpg - hands holding phone with ticket/map)
img_s6 = os.path.join(ASSETS_DIR, 'page_06_img_01_X5.jpg')
if os.path.exists(img_s6):
    s6.shapes.add_picture(img_s6, Inches(0.8), Inches(2.1), width=Inches(4.6), height=Inches(4.8))

# Right Column: 4 Chronological Steps
r_x = Inches(5.8)
col_w = Inches(6.7)
start_y = Inches(2.15)

steps = [
    (
        "01",
        "Search",
        "Search a Delhi-to-Mumbai journey using natural language or voice. SambaNova/Zod parser extracts origin, destination, date, and mode preferences automatically."
    ),
    (
        "02",
        "Compare",
        "Compare live train, inter-state bus, and flight options side-by-side with transparent 5-tier provenance badges (LIVE, TIMETABLE, ESTIMATE)."
    ),
    (
        "03",
        "Simulate",
        "Simulate a 45-minute delay on Leg 1. The contingency simulator re-evaluates transfer slack, confirms viability, and presents alternate onward departures."
    ),
    (
        "04",
        "Protect",
        "Open Safety Mode to share live coordinates with personal contacts, pre-fill official booking deep links, and save the verified offline traveler pass."
    )
]

curr_y = start_y
for num, step_title, step_desc in steps:
    # Number badge
    tb_n = s6.shapes.add_textbox(r_x, curr_y, Inches(0.55), Inches(0.35))
    tf_n = tb_n.text_frame
    tf_n.word_wrap = True
    tf_n.margin_left = tf_n.margin_right = tf_n.margin_top = tf_n.margin_bottom = 0
    pn = tf_n.paragraphs[0]
    pn.text = num
    pn.font.name = FONT_PRIMARY
    pn.font.size = Pt(13)
    pn.font.bold = True
    pn.font.color.rgb = TERRACOTTA

    # Text block
    tb_t = s6.shapes.add_textbox(r_x + Inches(0.65), curr_y, col_w - Inches(0.65), Inches(1.05))
    tf_t = tb_t.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = tf_t.margin_right = tf_t.margin_top = tf_t.margin_bottom = 0
    pt = tf_t.paragraphs[0]
    pt.text = step_title
    pt.font.name = FONT_PRIMARY
    pt.font.size = Pt(13)
    pt.font.bold = True
    pt.font.color.rgb = SLATE_DARK
    pt.space_after = Pt(1)

    pb = tf_t.add_paragraph()
    pb.text = step_desc
    pb.font.name = FONT_PRIMARY
    pb.font.size = Pt(10)
    pb.font.color.rgb = SLATE_LIGHT

    curr_y += Inches(1.2)

print("Slide 6 generated.")

# =============================================================================
# SLIDE 7: USABILITY & DIGITAL INCLUSION (4 Structured Horizontal Cards)
# =============================================================================
s7 = prs.slides.add_slide(blank_layout)
set_bg(s7)

add_header(
    s7,
    "USABILITY",
    "Designed for real travel conditions",
    "Engineered for varying digital literacy, variable cellular coverage, and regional Indian passenger demographics."
)

row_y = Inches(2.2)
row_w = Inches(11.73)
row_h = Inches(1.08)

usability_rows = [
    (
        "Language Access",
        "10 Indian Languages with Native RTL Support",
        "Complete client-side translation across Hindi, Bengali, Telugu, Marathi, Tamil, Urdu (with native right-to-left RTL layout), Gujarati, Kannada, and Malayalam with transit terminology popovers."
    ),
    (
        "Accessible by Default",
        "WCAG 2.1 AA Accessibility Compliance",
        "Accessible ARIA combobox station search, active dialog focus trapping on all modals (Escape dismissal, focus restoration), minimum 4.5:1 color contrast, and 44×44px touch targets."
    ),
    (
        "Low Friction, Lower Risk",
        "Zero Account Wall & DPDP 2023 Privacy",
        "No forced account login, no phone number tracking, and zero in-app payment card collection. Single-click local data erasure gives travelers complete statutory privacy control."
    ),
    (
        "Keep Official Control",
        "Direct Regulated Booking Deep Links",
        "Unbundled architecture: pre-filled deep links hand travelers directly to official booking portals (IRCTC, ConfirmTkt, redBus, Google Flights). No ticket surcharges, no merchant fees."
    )
]

for tag, title, body in usability_rows:
    add_card(s7, Inches(0.8), row_y, row_w, row_h, CARD_LIGHT, CARD_BORDER)

    tb = s7.shapes.add_textbox(Inches(1.1), row_y + Inches(0.14), row_w - Inches(0.6), row_h - Inches(0.28))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

    p_h = tf.paragraphs[0]
    p_h.text = f"{tag}: {title}"
    p_h.font.name = FONT_PRIMARY
    p_h.font.size = Pt(12)
    p_h.font.bold = True
    p_h.font.color.rgb = TERRACOTTA
    p_h.space_after = Pt(2)

    p_b = tf.add_paragraph()
    p_b.text = body
    p_b.font.name = FONT_PRIMARY
    p_b.font.size = Pt(9.5)
    p_b.font.color.rgb = SLATE_LIGHT

    row_y += Inches(1.22)

print("Slide 7 generated.")

# =============================================================================
# SLIDE 8: REAL-WORLD IMPACT (Split Layout: Impact Left, Photo Right)
# =============================================================================
s8 = prs.slides.add_slide(blank_layout)
set_bg(s8)

add_header(
    s8,
    "REAL-WORLD IMPACT",
    "Fewer stranded travelers, faster help, better decisions",
    "Directly addressing high-stakes mobility challenges across India's largest transportation corridors."
)

# Left Column: 3 Structured Impact Sections
l_x = Inches(0.8)
col_w = Inches(6.5)
curr_y = Inches(2.25)

impacts = [
    (
        "Who It Supports",
        "Emergency travelers, solo passengers, students, regional-language users, and frequent inter-city commuters navigating high-stress journey delays."
    ),
    (
        "What It Combines",
        "47 major railway stations, 25 high-traffic junction hubs, 22 inter-state bus terminals (ISBTs), 147 indexed airports, live search, PNR tools, and safety workflows."
    ),
    (
        "What Is Proven",
        "Production MVP is deployed and has returned 15 verified flight results in live testing. 56 automated tests passed with 100% success rate on clean Vercel infrastructure."
    )
]

for title, desc in impacts:
    add_card(s8, l_x, curr_y, col_w, Inches(1.3), CARD_LIGHT, CARD_BORDER)

    tb = s8.shapes.add_textbox(l_x + Inches(0.3), curr_y + Inches(0.18), col_w - Inches(0.6), Inches(0.95))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

    p_h = tf.paragraphs[0]
    p_h.text = title
    p_h.font.name = FONT_PRIMARY
    p_h.font.size = Pt(13)
    p_h.font.bold = True
    p_h.font.color.rgb = TERRACOTTA
    p_h.space_after = Pt(2)

    p_d = tf.add_paragraph()
    p_d.text = desc
    p_d.font.name = FONT_PRIMARY
    p_d.font.size = Pt(10)
    p_d.font.color.rgb = SLATE_LIGHT

    curr_y += Inches(1.5)

# Right Column: High-Res Photo (page_08_img_01_X6.jpg - women reading notice board)
img_s8 = os.path.join(ASSETS_DIR, 'page_08_img_01_X6.jpg')
if os.path.exists(img_s8):
    s8.shapes.add_picture(img_s8, Inches(7.6), Inches(2.1), width=Inches(4.93), height=Inches(4.8))

print("Slide 8 generated.")

# =============================================================================
# SLIDE 9: SCALABILITY & TRUST (4 Structural Cards - 2x2 Grid)
# =============================================================================
s9 = prs.slides.add_slide(blank_layout)
set_bg(s9)

add_header(
    s9,
    "SCALABILITY · TRUST",
    "Built to scale without compromising trust",
    "Enterprise-grade infrastructure designed for zero-maintenance edge execution and statutory data privacy."
)

card_w = Inches(5.65)
card_h = Inches(2.25)
row1_y = Inches(2.25)
row2_y = Inches(4.75)
col1_x = Inches(0.8)
col2_x = Inches(6.88)

# Card 1: Top-Left (One Normalized Interface)
add_card(s9, col1_x, row1_y, card_w, card_h, CARD_LIGHT, CARD_BORDER)
tb = s9.shapes.add_textbox(col1_x + Inches(0.35), row1_y + Inches(0.25), card_w - Inches(0.7), card_h - Inches(0.5))
tf = tb.text_frame
tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

p = tf.paragraphs[0]
p.text = "DATA NORMALIZATION"
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = TERRACOTTA
p.space_after = Pt(4)

p = tf.add_paragraph()
p.text = "One normalized interface"
p.font.name = FONT_PRIMARY
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = SLATE_DARK
p.space_after = Pt(4)

p = tf.add_paragraph()
p.text = "Provider abstraction layer lets new rail, bus, and flight sources plug into one shared data model. Extensible adapter architecture ready for direct State Road Transport Corporation (SRTC) APIs."
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.color.rgb = SLATE_LIGHT

# Card 2: Top-Right (Resilient Fallback - Soft Sky Blue)
add_card(s9, col2_x, row1_y, card_w, card_h, SOFT_BLUE)
tb = s9.shapes.add_textbox(col2_x + Inches(0.35), row1_y + Inches(0.25), card_w - Inches(0.7), card_h - Inches(0.5))
tf = tb.text_frame
tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

p = tf.paragraphs[0]
p.text = "RELIABILITY ARCHITECTURE"
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = NAVY_BLUE
p.space_after = Pt(4)

p = tf.add_paragraph()
p.text = "Resilient fallback core"
p.font.name = FONT_PRIMARY
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = SLATE_DARK
p.space_after = Pt(4)

p = tf.add_paragraph()
p.text = "Curated static open timetable datasets keep the user experience useful when external live providers experience outages, rate limiting, or network timeouts."
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.color.rgb = SLATE_DARK

# Card 3: Bottom-Left (Protected Platform)
add_card(s9, col1_x, row2_y, card_w, card_h, CARD_LIGHT, CARD_BORDER)
tb = s9.shapes.add_textbox(col1_x + Inches(0.35), row2_y + Inches(0.25), card_w - Inches(0.7), card_h - Inches(0.5))
tf = tb.text_frame
tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

p = tf.paragraphs[0]
p.text = "SECURITY & PRIVACY"
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = TERRACOTTA
p.space_after = Pt(4)

p = tf.add_paragraph()
p.text = "Protected platform & DPDP 2023"
p.font.name = FONT_PRIMARY
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = SLATE_DARK
p.space_after = Pt(4)

p = tf.add_paragraph()
p.text = "Server-side secrets, strict Content Security Policy (CSP), Upstash Redis rate limiting, and data minimization protect passenger data with zero server-side telemetry tracking."
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.color.rgb = SLATE_LIGHT

# Card 4: Bottom-Right (Evidence of Quality - Deep Navy)
add_card(s9, col2_x, row2_y, card_w, card_h, NAVY_BLUE)
tb = s9.shapes.add_textbox(col2_x + Inches(0.35), row2_y + Inches(0.25), card_w - Inches(0.7), card_h - Inches(0.5))
tf = tb.text_frame
tf.word_wrap = True
tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0

p = tf.paragraphs[0]
p.text = "ENGINEERING RIGOR"
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = SOFT_BLUE
p.space_after = Pt(4)

p = tf.add_paragraph()
p.text = "Evidence of quality"
p.font.name = FONT_PRIMARY
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = WHITE
p.space_after = Pt(4)

p = tf.add_paragraph()
p.text = "56 automated unit and characterization tests passed with zero failures; production build completed cleanly in 32.15 seconds with lazy-split vector map bundles."
p.font.name = FONT_PRIMARY
p.font.size = Pt(10)
p.font.color.rgb = RGBColor(0xDF, 0xE9, 0xF5)

print("Slide 9 generated.")

# =============================================================================
# SLIDE 10: ROADMAP & CLOSING ASK (Split: Milestones Left, Big Ask Right)
# =============================================================================
s10 = prs.slides.add_slide(blank_layout)
set_bg(s10)

# Left Column: Next Milestones
left_x = Inches(0.8)
col_w = Inches(5.3)

# Tracker text
tb_tr = s10.shapes.add_textbox(left_x, Inches(0.5), Inches(3.2), Inches(0.35))
tf_tr = tb_tr.text_frame
tf_tr.word_wrap = True
tf_tr.margin_left = tf_tr.margin_right = tf_tr.margin_top = tf_tr.margin_bottom = 0
p_tr = tf_tr.paragraphs[0]
p_tr.text = "NEXT MILESTONES"
p_tr.font.name = FONT_PRIMARY
p_tr.font.size = Pt(9.5)
p_tr.font.bold = True
p_tr.font.color.rgb = TERRACOTTA

# Rule
rule = s10.shapes.add_shape(MSO_SHAPE.RECTANGLE, left_x, Inches(0.9), col_w, Pt(1.2))
rule.fill.solid()
rule.fill.fore_color.rgb = LINE_DIVIDER
rule.line.fill.background()

# Title
tb_tit = s10.shapes.add_textbox(left_x, Inches(1.05), col_w, Inches(1.1))
tf_tit = tb_tit.text_frame
tf_tit.word_wrap = True
tf_tit.margin_left = tf_tit.margin_right = tf_tit.margin_top = tf_tit.margin_bottom = 0
pt = tf_tit.paragraphs[0]
pt.text = "Deepen coverage, alerts, and access"
pt.font.name = FONT_PRIMARY
pt.font.size = Pt(22)
pt.font.bold = True
pt.font.color.rgb = SLATE_DARK

# 3 Milestones
milestones = [
    (
        "01",
        "Add broader private-bus inventory and seasonal train coverage with direct State Road Transport Corporation (SRTC) feeds."
    ),
    (
        "02",
        "Introduce station arrival push notifications, background service worker reconnect syncing, and crowd-verified delay signals."
    ),
    (
        "03",
        "Scale through institutional partnerships with transit authorities while keeping all bookings on official regulated portals."
    )
]

curr_y = Inches(2.4)
for num, text in milestones:
    tb_n = s10.shapes.add_textbox(left_x, curr_y, Inches(0.55), Inches(0.35))
    tf_n = tb_n.text_frame
    tf_n.word_wrap = True
    tf_n.margin_left = tf_n.margin_right = tf_n.margin_top = tf_n.margin_bottom = 0
    pn = tf_n.paragraphs[0]
    pn.text = num
    pn.font.name = FONT_PRIMARY
    pn.font.size = Pt(13)
    pn.font.bold = True
    pn.font.color.rgb = TERRACOTTA

    tb_t = s10.shapes.add_textbox(left_x + Inches(0.65), curr_y, col_w - Inches(0.65), Inches(1.15))
    tf_t = tb_t.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = tf_t.margin_right = tf_t.margin_top = tf_t.margin_bottom = 0
    pt = tf_t.paragraphs[0]
    pt.text = text
    pt.font.name = FONT_PRIMARY
    pt.font.size = Pt(10.5)
    pt.font.color.rgb = SLATE_LIGHT

    curr_y += Inches(1.4)

# Right Column: Big Closing Ask Card (Terracotta #B44C2D)
r_x = Inches(6.6)
r_w = Inches(5.93)
r_h = Inches(6.1)
r_y = Inches(0.7)

add_card(s10, r_x, r_y, r_w, r_h, TERRACOTTA)

tb_ask = s10.shapes.add_textbox(r_x + Inches(0.6), r_y + Inches(0.7), r_w - Inches(1.2), r_h - Inches(1.4))
tf_ask = tb_ask.text_frame
tf_ask.word_wrap = True
tf_ask.margin_left = tf_ask.margin_right = tf_ask.margin_top = tf_ask.margin_bottom = 0

p = tf_ask.paragraphs[0]
p.text = "CLOSING ASK · VORTEX 2K26"
p.font.name = FONT_PRIMARY
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = RGBColor(0xFD, 0xBA, 0x9A)
p.space_after = Pt(14)

p = tf_ask.add_paragraph()
p.text = "Help us make\nevery journey\nmore informed,\nresilient, and safe."
p.font.name = FONT_PRIMARY
p.font.size = Pt(36)
p.font.bold = True
p.font.color.rgb = WHITE
p.space_after = Pt(20)

p = tf_ask.add_paragraph()
p.text = "We are seeking mentorship, transit data partnerships, and technical incubation to bring TravelMate AI to millions of passengers across India."
p.font.name = FONT_PRIMARY
p.font.size = Pt(12)
p.font.color.rgb = RGBColor(0xFF, 0xEE, 0xE6)
p.space_after = Pt(24)

p = tf_ask.add_paragraph()
p.text = "Surendra & Rishitha  |  TravelMate AI  |  Vortex 2K26"
p.font.name = FONT_PRIMARY
p.font.size = Pt(10.5)
p.font.bold = True
p.font.color.rgb = RGBColor(0xFD, 0xBA, 0x9A)

print("Slide 10 generated.")

# -----------------------------------------------------------------------------
# SAVE PRESENTATION
# -----------------------------------------------------------------------------
prs.save(OUT_PPTX)
print(f"PowerPoint successfully built at: {OUT_PPTX}")
