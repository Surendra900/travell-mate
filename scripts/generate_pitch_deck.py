import os
import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path):
    prs = pptx.Presentation()
    # 16:9 Widescreen standard
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # blank layout

    # Professional Venture Dark Palette
    BG_COLOR = RGBColor(11, 17, 32)        # Slate 950 / Obsidian Navy
    CARD_BG = RGBColor(20, 29, 47)         # Slate 900
    CARD_BORDER = RGBColor(40, 56, 84)     # Slate 800
    CYAN_ACCENT = RGBColor(6, 182, 212)    # Cyan 500
    CYAN_BRIGHT = RGBColor(34, 211, 238)   # Cyan 400
    AMBER_ACCENT = RGBColor(245, 158, 11)  # Amber 500
    EMERALD_ACCENT = RGBColor(16, 185, 129)# Emerald 500
    ROSE_ACCENT = RGBColor(244, 63, 94)    # Rose 500
    TEXT_WHITE = RGBColor(248, 250, 252)   # Slate 50
    TEXT_MUTED = RGBColor(148, 163, 184)   # Slate 400
    TEXT_LIGHT = RGBColor(203, 213, 225)   # Slate 300

    def add_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        return bg

    def add_para(tf, text="", size=12, color=TEXT_LIGHT, bold=False, align=PP_ALIGN.LEFT, space_before=0, space_after=0):
        # If the first paragraph is empty, reuse it; otherwise add new paragraph
        if len(tf.paragraphs) == 1 and tf.paragraphs[0].text == "":
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.alignment = align
        if space_before:
            p.space_before = Pt(space_before)
        if space_after:
            p.space_after = Pt(space_after)
        p.line_spacing = 1.15
        run = p.add_run()
        run.text = text
        run.font.name = "Arial" if bold else "Calibri"
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.color.rgb = color
        return p, run

    def add_header(slide, kicker, headline):
        head_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.73), Inches(1.15))
        tf = head_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        # Kicker
        add_para(tf, kicker.upper(), size=11, color=CYAN_BRIGHT, bold=True, space_after=2)
        # Headline
        add_para(tf, headline, size=21, color=TEXT_WHITE, bold=True)

    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)
        return card

    def add_bottom_bar(slide, text, accent_color=CYAN_BRIGHT):
        bar_card = add_card(slide, Inches(0.8), Inches(6.4), Inches(11.73), Inches(0.6), bg_color=RGBColor(15, 23, 42), border_color=CARD_BORDER)
        tb_bar = slide.shapes.add_textbox(Inches(1.0), Inches(6.45), Inches(11.33), Inches(0.5))
        tf = tb_bar.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        add_para(tf, text, size=11.5, color=accent_color, bold=True, align=PP_ALIGN.CENTER)

    def set_notes(slide, notes_text):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes_text

    # =============================================================
    # SLIDE 1: Title & 10-Second Value Proposition
    # =============================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_background(s1)

    brand_card = add_card(s1, Inches(1.5), Inches(1.05), Inches(10.33), Inches(5.35), bg_color=CARD_BG, border_color=CYAN_ACCENT)

    tb1 = s1.shapes.add_textbox(Inches(2.0), Inches(1.35), Inches(9.33), Inches(4.7))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

    add_para(tf1, "TRAVELMATE", size=40, color=CYAN_BRIGHT, bold=True, space_after=4)
    add_para(tf1, "Never Get Stranded: India's First AI Multimodal Journey & Transit Safety Layer", size=19, color=TEXT_WHITE, bold=True, space_after=12)
    add_para(tf1, "When direct train tickets are waitlisted, TravelMate automatically stitches confirmed Train, Bus & Flight combinations with guaranteed transit junction buffers, real-time quota hacks, and 100% offline emergency safety.", size=13.5, color=TEXT_LIGHT, space_after=18)

    # Badges
    badge_left = Inches(2.0)
    badges = [
        ("🚆 🚌 ✈️ Multimodal Split-Routing", CYAN_BRIGHT),
        ("💡 Station Hopper Quota Hacks", AMBER_ACCENT),
        ("🛡️ Offline Boarding Pass & SOS", EMERALD_ACCENT)
    ]
    for text, color in badges:
        bc = add_card(s1, badge_left, Inches(4.55), Inches(2.9), Inches(0.52), bg_color=RGBColor(15, 23, 42), border_color=color)
        tb_b = s1.shapes.add_textbox(badge_left, Inches(4.62), Inches(2.9), Inches(0.4))
        tf_b = tb_b.text_frame
        tf_b.word_wrap = True
        tf_b.margin_left = tf_b.margin_top = tf_b.margin_right = tf_b.margin_bottom = 0
        add_para(tf_b, text, size=10.5, color=color, bold=True, align=PP_ALIGN.CENTER)
        badge_left += Inches(3.2)

    tb_foot = s1.shapes.add_textbox(Inches(2.0), Inches(5.4), Inches(9.33), Inches(0.8))
    tf_foot = tb_foot.text_frame
    tf_foot.word_wrap = True
    tf_foot.margin_left = tf_foot.margin_top = tf_foot.margin_right = tf_foot.margin_bottom = 0
    add_para(tf_foot, "Presenter: Surendra Gedala (Founder & Lead Architect)  ·  National Startup Pitch Competition 2026", size=11, color=TEXT_MUTED)
    add_para(tf_foot, "Target Investor: Investment & Venture Team, YAI Infraventure (yaiinfraventure.online)", size=11, color=CYAN_BRIGHT, bold=True)

    set_notes(s1, (
        "Good morning, members of the investment committee. Millions of Indians travel between cities every single day, "
        "but during peak weekends, festivals, and sudden emergencies, direct train tickets sell out in seconds. Existing apps stop "
        "right there and leave passengers stranded on waitlists. TravelMate is India's first AI-powered multimodal transit companion. "
        "We automatically stitch confirmed train, bus, and flight connections—with guaranteed transfer buffers and an offline emergency "
        "safety net—so no traveler ever gets stranded."
    ))

    # =============================================================
    # SLIDE 2: The Problem
    # =============================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_background(s2)
    add_header(s2, "01 / The Problem", "Direct Tickets Sell Out in Seconds, Leaving Millions of Travelers Stranded")

    col_w = Inches(3.64)
    gap = Inches(0.4)
    top_pos = Inches(1.75)
    card_h = Inches(4.35)

    # Card 1
    add_card(s2, Inches(0.8), top_pos, col_w, card_h)
    tb = s2.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "🔴 The Waitlist Dead-End", size=15.5, color=ROSE_ACCENT, bold=True, space_after=8)
    add_para(tf, "• Peak festive and weekend trains exceed capacity by over 300% across key trunk routes.", size=12, color=TEXT_LIGHT, space_after=8)
    add_para(tf, "• IRCTC waitlists (WL/RAC) drop passengers into limbo with zero actionable alternatives offered.", size=12, color=TEXT_LIGHT, space_after=8)
    add_para(tf, "• Desperate commuters either cancel essential journeys or fall prey to exorbitant emergency markups.", size=12, color=TEXT_LIGHT)

    # Card 2
    add_card(s2, Inches(0.8) + col_w + gap, top_pos, col_w, card_h)
    tb = s2.shapes.add_textbox(Inches(1.0) + col_w + gap, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "⚠️ Manual Search Chaos", size=15.5, color=AMBER_ACCENT, bold=True, space_after=8)
    add_para(tf, "• Commuters manually toggle between 4+ siloed apps: IRCTC, RedBus, MakeMyTrip, and Google Flights.", size=12, color=TEXT_LIGHT, space_after=8)
    add_para(tf, "• Stitching split connections manually is risky: travelers misjudge station layovers and miss connecting legs.", size=12, color=TEXT_LIGHT, space_after=8)
    add_para(tf, "• Direct flights are often 5x–10x budget (₹12,000+); direct bus rides take 18+ exhausting hours.", size=12, color=TEXT_LIGHT)

    # Card 3
    add_card(s2, Inches(0.8) + (col_w + gap)*2, top_pos, col_w, card_h)
    tb = s2.shapes.add_textbox(Inches(1.0) + (col_w + gap)*2, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "🚨 Disconnection & Safety", size=15.5, color=CYAN_BRIGHT, bold=True, space_after=8)
    add_para(tf, "• Once tickets are booked, platforms abandon the user: zero live junction assistance or terminal navigation.", size=12, color=TEXT_LIGHT, space_after=8)
    add_para(tf, "• Cellular blind spots across rural railway tracks leave digital app passes completely unreadable.", size=12, color=TEXT_LIGHT, space_after=8)
    add_para(tf, "• In emergencies, access to verified helplines (139 RailMadad, 112) is fragmented and slow.", size=12, color=TEXT_LIGHT)

    add_bottom_bar(s2, "Key Insight: Travelers don't want a ticket—they want to reach their destination. Technology must do the heavy lifting.")

    set_notes(s2, (
        "The problem in India is massive. Public transit isn't broken—it is completely disconnected. Over 30 million people travel "
        "between cities every day. When direct trains are full, travelers face a dead end. They are forced to switch between IRCTC, "
        "RedBus, and flight aggregators, trying to guess safe junction connections. If they misjudge a station transfer, they get stranded. "
        "Furthermore, existing platforms consider their job finished the second payment clears. On the road, passengers face dead zones, "
        "unfamiliar junctions, and zero integrated emergency assistance."
    ))

    # =============================================================
    # SLIDE 3: The Solution
    # =============================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_background(s3)
    add_header(s3, "02 / The Solution", "TravelMate Converts Stranded Passengers into Confirmed Travelers")

    # Pillar 1
    add_card(s3, Inches(0.8), top_pos, col_w, card_h)
    tb = s3.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "1. AI Multimodal Routing", size=15.5, color=CYAN_BRIGHT, bold=True, space_after=6)
    add_para(tf, "• Intelligent Split-Ticketing:", size=12, color=TEXT_WHITE, bold=True, space_before=4)
    add_para(tf, "Stitches Train+Bus or Train+Flight combinations through high-connectivity hubs like Nagpur, Jaipur, and Bhopal.", size=11.5, color=TEXT_LIGHT, space_after=8)
    add_para(tf, "• Guaranteed Transfer Buffers:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Calculates connection safety scores, station walking times, and auto/cab layover safety margins.", size=11.5, color=TEXT_LIGHT)

    # Pillar 2
    add_card(s3, Inches(0.8) + col_w + gap, top_pos, col_w, card_h)
    tb = s3.shapes.add_textbox(Inches(1.0) + col_w + gap, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "2. Station Hopper Quotas", size=15.5, color=AMBER_ACCENT, bold=True, space_after=6)
    add_para(tf, "• Automated Quota Bypass:", size=12, color=TEXT_WHITE, bold=True, space_before=4)
    add_para(tf, "Unlocks unreserved General Quota (GN) seats on the EXACT same train by extending booking to the next major division junction.", size=11.5, color=TEXT_LIGHT, space_after=8)
    add_para(tf, "• 100% Legal IRCTC Compliance:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Allows early deboarding or boarding point modification legally without penalty or ticket forfeiture.", size=11.5, color=TEXT_LIGHT)

    # Pillar 3
    add_card(s3, Inches(0.8) + (col_w + gap)*2, top_pos, col_w, card_h)
    tb = s3.shapes.add_textbox(Inches(1.0) + (col_w + gap)*2, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "3. Offline Guardian", size=15.5, color=EMERALD_ACCENT, bold=True, space_after=6)
    add_para(tf, "• Zero-Connectivity Pass:", size=12, color=TEXT_WHITE, bold=True, space_before=4)
    add_para(tf, "Boarding itinerary, transfer directions, and station amenities cached 100% offline in browser storage.", size=11.5, color=TEXT_LIGHT, space_after=8)
    add_para(tf, "• Integrated Emergency SOS:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "1-tap GPS dispatch via WhatsApp/SMS to family; direct priority hotlines to 112 & 139 RailMadad.", size=11.5, color=TEXT_LIGHT)

    add_bottom_bar(s3, "Outcome: Guaranteed seat availability, clear junction guidance, and end-to-end peace of mind on every journey.", accent_color=EMERALD_ACCENT)

    set_notes(s3, (
        "TravelMate fundamentally shifts travel search. When a direct train is sold out, we don't say 'No seats available'. "
        "First, our AI multimodal router stitches confirmed combinations across trains, buses, and flights through strategic transit hubs. "
        "Second, our Station Hopper engine unlocks secret Indian Railways quota allocations—booking one station further to access guaranteed "
        "General Quota berths on the exact same train legally. Third, our offline pass keeps the traveler safe with auto fare estimators, "
        "platform guides, and a 1-tap SOS system that works even in railway dead zones."
    ))

    # =============================================================
    # SLIDE 4: How the Engine Works (The 3 Ranked Tiers)
    # =============================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_background(s4)
    add_header(s4, "03 / The Engine & Tiers", "One Simple Query. Three Intelligently Ranked Journey Solutions.")

    # Tier 1
    add_card(s4, Inches(0.8), top_pos, col_w, card_h, border_color=EMERALD_ACCENT)
    tb = s4.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "🟢 PAISA VASOOL", size=15.5, color=EMERALD_ACCENT, bold=True)
    add_para(tf, "The Budget Champion (Sub-₹1,000)", size=11, color=TEXT_MUTED, space_after=6)
    add_para(tf, "• Archetype:", size=12, color=TEXT_WHITE, bold=True, space_before=4)
    add_para(tf, "Train Sleeper (SL) + State/Private Intercity Bus.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Why It Wins:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Maximizes wallet savings for students and price-conscious commuters without sacrificing arrival time.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Typical Route Example:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Delhi ➔ Jaipur (Train) + Jaipur ➔ Ahmedabad (Bus) for ~₹850 total.", size=11.5, color=CYAN_BRIGHT)

    # Tier 2
    add_card(s4, Inches(0.8) + col_w + gap, top_pos, col_w, card_h, border_color=CYAN_BRIGHT)
    tb = s4.shapes.add_textbox(Inches(1.0) + col_w + gap, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "🔵 SMART BALANCED", size=15.5, color=CYAN_BRIGHT, bold=True)
    add_para(tf, "The Best Value & Comfort Choice", size=11, color=TEXT_MUTED, space_after=6)
    add_para(tf, "• Archetype:", size=12, color=TEXT_WHITE, bold=True, space_before=4)
    add_para(tf, "Superfast AC Train (3A/CC) + AC Sleeper Bus.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Why It Wins:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Balances overnight sleep comfort, transit speed, and modest cost under ₹1,800 total.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Typical Route Example:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Mumbai ➔ Pune (Intercity) + Pune ➔ Hyderabad (AC Sleeper Bus).", size=11.5, color=CYAN_BRIGHT)

    # Tier 3
    add_card(s4, Inches(0.8) + (col_w + gap)*2, top_pos, col_w, card_h, border_color=ROSE_ACCENT)
    tb = s4.shapes.add_textbox(Inches(1.0) + (col_w + gap)*2, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "⚡ EMERGENCY EXPRESS", size=15.5, color=ROSE_ACCENT, bold=True)
    add_para(tf, "The Speed Lifesaver (Saves 8–12 hrs)", size=11, color=TEXT_MUTED, space_after=6)
    add_para(tf, "• Archetype:", size=12, color=TEXT_WHITE, bold=True, space_before=4)
    add_para(tf, "Express Train to Nearest Tier-1 Hub + Regional Flight.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Why It Wins:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Direct flights surging past ₹15,000? Feeder train + ₹3,500 flight saves 10 hours at 60% lower cost.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Typical Route Example:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Kanpur ➔ Lucknow (Express Train) + Lucknow ➔ Bengaluru (Direct Flight).", size=11.5, color=CYAN_BRIGHT)

    add_bottom_bar(s4, "Booking Execution: 1-Tap Provider Deep Links pre-populate routes directly into ConfirmTkt, RedBus, and Google Flights.")

    set_notes(s4, (
        "Here is what the traveler actually sees. Instead of presenting a raw list of 50 confusing trains and buses, TravelMate categorizes "
        "them into three crystal-clear tiers. 'Paisa Vasool' is our budget hack, guaranteeing a confirmed trip under 1,000 rupees. "
        "'Smart Balanced' connects a daytime train with an overnight AC sleeper bus for maximum comfort. 'Emergency Express' connects an express train "
        "to a nearby regional airport, saving 8 to 12 hours when direct flights are surge-priced at 15,000 rupees. Every option includes direct deep-links "
        "so checkout takes seconds."
    ))

    # =============================================================
    # SLIDE 5: Product Architecture & Safety
    # =============================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_background(s5)
    add_header(s5, "04 / Product Architecture", "An Integrated Safety Suite Built for Low-Connectivity Corridors")

    g_w = Inches(5.66)
    g_h = Inches(2.1)
    g_y1 = Inches(1.75)
    g_y2 = Inches(4.05)

    # Block 1
    add_card(s5, Inches(0.8), g_y1, g_w, g_h, border_color=CYAN_BRIGHT)
    tb = s5.shapes.add_textbox(Inches(1.0), g_y1 + Inches(0.15), Inches(5.26), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "🎫 100% Offline Digital Boarding Pass", size=14.5, color=CYAN_BRIGHT, bold=True, space_after=4)
    add_para(tf, "• Stores multi-leg tickets, platform numbers, and transfer buffer times directly in browser localStorage.", size=11.5, color=TEXT_LIGHT, space_after=4)
    add_para(tf, "• Accessible with zero cellular connectivity across remote railway stretches and tunnels.", size=11.5, color=TEXT_LIGHT)

    # Block 2
    add_card(s5, Inches(6.86), g_y1, g_w, g_h, border_color=AMBER_ACCENT)
    tb = s5.shapes.add_textbox(Inches(7.06), g_y1 + Inches(0.15), Inches(5.26), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "🧭 Junction Transfer Navigation", size=14.5, color=AMBER_ACCENT, bold=True, space_after=4)
    add_para(tf, "• Curated intelligence for major Indian junctions (Nagpur, Jaipur, Vijayawada, Kanpur).", size=11.5, color=TEXT_LIGHT, space_after=4)
    add_para(tf, "• Verified inter-terminal auto/taxi fares (₹80–₹120), walking distances, and 24/7 lounge amenities.", size=11.5, color=TEXT_LIGHT)

    # Block 3
    add_card(s5, Inches(0.8), g_y2, g_w, g_h, border_color=ROSE_ACCENT)
    tb = s5.shapes.add_textbox(Inches(1.0), g_y2 + Inches(0.15), Inches(5.26), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "🚨 1-Tap Emergency SOS with Live GPS", size=14.5, color=ROSE_ACCENT, bold=True, space_after=4)
    add_para(tf, "• One tap captures real-time GPS coordinates and formats an emergency WhatsApp/SMS broadcast.", size=11.5, color=TEXT_LIGHT, space_after=4)
    add_para(tf, "• Pre-populates train number, current coach, and corridor location for immediate contact verification.", size=11.5, color=TEXT_LIGHT)

    # Block 4
    add_card(s5, Inches(6.86), g_y2, g_w, g_h, border_color=EMERALD_ACCENT)
    tb = s5.shapes.add_textbox(Inches(7.06), g_y2 + Inches(0.15), Inches(5.26), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "📞 Direct Transit Emergency Helplines", size=14.5, color=EMERALD_ACCENT, bold=True, space_after=4)
    add_para(tf, "• Instant 1-tap dialing to Railway Helpline (139 RailMadad), National Emergency (112), and Ambulance (108).", size=11.5, color=TEXT_LIGHT, space_after=4)
    add_para(tf, "• Offline emergency decision tree for theft, coach medical distress, or unexpected stranded layovers.", size=11.5, color=TEXT_LIGHT)

    add_bottom_bar(s5, "Safety Architecture: Emergency messages require user confirmation; location data is stored locally and never sold.")

    set_notes(s5, (
        "Unlike ticketing apps that abandon the user upon booking confirmation, TravelMate stays active throughout the journey. "
        "Over 70% of intercity railway stretches in India experience network drops. TravelMate caches the complete journey itinerary, "
        "transfer directions, and platform guides directly on the device. In an emergency, a single tap triggers our SOS mode, "
        "grabbing current GPS coordinates and preparing an emergency message with verified hotlines like 112 and 139 RailMadad."
    ))

    # =============================================================
    # SLIDE 6: Market Opportunity (TAM, SAM, SOM)
    # =============================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_background(s6)
    add_header(s6, "05 / Market Opportunity", "A $25.4B Digital Travel Market Anchored by Massive Transit Demand")

    # TAM Card
    add_card(s6, Inches(0.8), top_pos, col_w, card_h, border_color=CYAN_BRIGHT)
    tb = s6.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "TAM", size=14, color=CYAN_BRIGHT, bold=True)
    add_para(tf, "$25.38 Billion", size=26, color=TEXT_WHITE, bold=True, space_after=6)
    add_para(tf, "• Total India Online Travel Market in 2026.", size=12, color=TEXT_LIGHT, space_after=4)
    add_para(tf, "• Projected to reach $38.58 Billion by 2031 at 8.74% CAGR.", size=12, color=TEXT_LIGHT, space_after=12)
    add_para(tf, "(Source: Mordor Intelligence, India Online Travel Market Report, updated Jul 2026)", size=9.5, color=TEXT_MUTED)

    # SAM Card
    add_card(s6, Inches(0.8) + col_w + gap, top_pos, col_w, card_h, border_color=AMBER_ACCENT)
    tb = s6.shapes.add_textbox(Inches(1.0) + col_w + gap, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "SAM", size=14, color=AMBER_ACCENT, bold=True)
    add_para(tf, "$9.19 Billion", size=26, color=TEXT_WHITE, bold=True, space_after=6)
    add_para(tf, "• Online Intercity Transportation Segment (36.24% share of online travel).", size=12, color=TEXT_LIGHT, space_after=4)
    add_para(tf, "• Millions of annual bookings across Indian Railways, Intercity Buses, and Regional Flights.", size=12, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Transportation is the largest and fastest digitizing service segment in Indian travel.", size=11, color=TEXT_MUTED)

    # SOM Card
    add_card(s6, Inches(0.8) + (col_w + gap)*2, top_pos, col_w, card_h, border_color=EMERALD_ACCENT)
    tb = s6.shapes.add_textbox(Inches(1.0) + (col_w + gap)*2, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "SOM", size=14, color=EMERALD_ACCENT, bold=True)
    add_para(tf, "[ADD: $45M Beachhead]", size=22, color=TEXT_WHITE, bold=True, space_after=6)
    add_para(tf, "• Initial Serviceable Beachhead:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Digitally active college students, young professionals, and frequent Tier-2/3 commuters on 5 chronic rail corridors.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Core Focus:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "The 15M+ monthly passengers facing waitlist rejection during weekend migrations.", size=11.5, color=TEXT_LIGHT)

    add_bottom_bar(s6, "Market Tailwind: Rapid expansion of regional expressways and airports makes multi-modal transit viable at venture scale.")

    set_notes(s6, (
        "Let's look at the market numbers. Based on verified research from Mordor Intelligence, India's online travel market stands at "
        "$25.38 Billion in 2026 and is on track to reach $38.58 Billion by 2031, growing at an 8.74% CAGR. Public transportation is the largest "
        "category, claiming 36.24% of the market—over $9 Billion. Our initial target SOM focuses on digitally active students and young "
        "professionals who commute regularly across high-traffic corridors like Delhi-Lucknow, Mumbai-Pune-Nagpur, and Bangalore-Chennai."
    ))

    # =============================================================
    # SLIDE 7: Competitive Moat & Differentiation (Native Table)
    # =============================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_background(s7)
    add_header(s7, "06 / Competition & Moat", "We Orchestrate Complete Journeys While Incumbents Only Sell Siloed Tickets")

    # Native PowerPoint Table
    table_shape = s7.shapes.add_table(7, 5, Inches(0.8), Inches(1.75), Inches(11.73), Inches(4.4))
    table = table_shape.table

    # Column Widths
    table.columns[0].width = Inches(2.8)
    table.columns[1].width = Inches(2.15)
    table.columns[2].width = Inches(2.15)
    table.columns[3].width = Inches(2.15)
    table.columns[4].width = Inches(2.48)

    table_data = [
        ["Capability", "IRCTC / ConfirmTkt", "MakeMyTrip / OTAs", "RedBus / AbhiBus", "TRAVELMATE"],
        ["Cross-Modal Routing", "❌ Rail Only", "❌ Siloed Tabs", "❌ Bus Only", "✅ Automated Train+Bus+Flight"],
        ["Alternate Quota Bypass", "⚠️ Rail WL Only", "❌ None", "❌ None", "✅ Station Hopper Engine"],
        ["Transfer Buffer Safety", "❌ None", "❌ None", "❌ None", "✅ Junction Safety Scoring"],
        ["100% Offline Pass", "❌ No", "⚠️ Ticket Only", "⚠️ SMS Only", "✅ Offline Pass + Maps"],
        ["Emergency SOS & 139", "❌ No", "❌ No", "❌ No", "✅ 1-Tap GPS Alert (112, 139)"],
        ["Platform Model", "Single Operator", "Siloed Commission", "Single Mode Aggregator", "Cross-Platform Orchestrator"]
    ]

    for row_idx, row in enumerate(table_data):
        for col_idx, cell_value in enumerate(row):
            cell = table.cell(row_idx, col_idx)
            cell.fill.solid()
            # Row styling
            if row_idx == 0:
                cell.fill.fore_color.rgb = RGBColor(15, 23, 42)
            elif col_idx == 4:
                cell.fill.fore_color.rgb = RGBColor(24, 43, 73) # Subtle cyan-tinted highlight
            elif row_idx % 2 == 1:
                cell.fill.fore_color.rgb = CARD_BG
            else:
                cell.fill.fore_color.rgb = RGBColor(16, 24, 40)

            tf = cell.text_frame
            tf.word_wrap = True
            tf.margin_left = Inches(0.12)
            tf.margin_right = Inches(0.12)
            tf.margin_top = Inches(0.08)
            tf.margin_bottom = Inches(0.08)
            
            p = tf.paragraphs[0]
            p.text = ""
            run = p.add_run()
            run.text = cell_value
            run.font.name = "Arial" if (row_idx == 0 or col_idx == 4) else "Calibri"
            run.font.size = Pt(11) if row_idx > 0 else Pt(11.5)
            run.font.bold = (row_idx == 0 or col_idx == 4)
            
            if row_idx == 0:
                run.font.color.rgb = CYAN_BRIGHT if col_idx == 4 else TEXT_WHITE
            elif col_idx == 4:
                run.font.color.rgb = CYAN_BRIGHT
            else:
                run.font.color.rgb = TEXT_LIGHT

    add_bottom_bar(s7, "Our Moat: Proprietary transit junction routing graph + high retention driven by integrated emergency safety.", accent_color=EMERALD_ACCENT)

    set_notes(s7, (
        "How do we compete against market leaders like MakeMyTrip, RedBus, or ConfirmTkt? Existing incumbents are mode-siloed aggregators. "
        "Their business models are built on selling isolated tickets for individual operators. None of them connect trains to buses or flights "
        "because reconciling inter-modal timetables is technically complex. TravelMate is platform-agnostic: we don't care which operator you take; "
        "we care that you reach your destination. Our proprietary junction transfer engine and offline safety layer create high switching costs "
        "and strong organic word-of-mouth."
    ))

    # =============================================================
    # SLIDE 8: Business Model & Monetization
    # =============================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_background(s8)
    add_header(s8, "07 / Business Model", "High-Margin Multi-Leg Monetization with Diversified Revenue Streams")

    # Stream 1
    add_card(s8, Inches(0.8), top_pos, col_w, card_h, border_color=CYAN_BRIGHT)
    tb = s8.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "1. Double Affiliate Fees", size=15.5, color=CYAN_BRIGHT, bold=True)
    add_para(tf, "Multi-Leg Booking Take-Rate", size=11, color=TEXT_MUTED, space_after=6)
    add_para(tf, "• Because TravelMate journeys consist of 2 connecting legs, we monetize BOTH:", size=11.5, color=TEXT_LIGHT, space_after=4)
    add_para(tf, "  - Train Leg: ₹15–₹25 affiliate fee via authorized rail partners.", size=11.5, color=TEXT_LIGHT, space_after=3)
    add_para(tf, "  - Bus/Flight Leg: 4%–7% booking commission on private sleeper buses and regional flights.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Blended revenue: ₹40–₹75 per completed multimodal booking.", size=12, color=EMERALD_ACCENT, bold=True)

    # Stream 2
    add_card(s8, Inches(0.8) + col_w + gap, top_pos, col_w, card_h, border_color=AMBER_ACCENT)
    tb = s8.shapes.add_textbox(Inches(1.0) + col_w + gap, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "2. Premium AI Services", size=15.5, color=AMBER_ACCENT, bold=True)
    add_para(tf, "Micro-Transactions & Subscriptions", size=11, color=TEXT_MUTED, space_after=6)
    add_para(tf, "• ₹49 / Trip or ₹199 / Year for 'TravelMate Pro':", size=11.5, color=TEXT_WHITE, bold=True, space_after=4)
    add_para(tf, "  - Instant Tatkal auto-fill assistant.", size=11.5, color=TEXT_LIGHT, space_after=3)
    add_para(tf, "  - Real-time PNR confirmation predictor alerts.", size=11.5, color=TEXT_LIGHT, space_after=3)
    add_para(tf, "  - Automated re-routing alerts if connecting trains face delays.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• High-margin consumer tier with 90%+ gross margins.", size=12, color=EMERALD_ACCENT, bold=True)

    # Stream 3
    add_card(s8, Inches(0.8) + (col_w + gap)*2, top_pos, col_w, card_h, border_color=EMERALD_ACCENT)
    tb = s8.shapes.add_textbox(Inches(1.0) + (col_w + gap)*2, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "3. B2B Transit API & Data", size=15.5, color=EMERALD_ACCENT, bold=True)
    add_para(tf, "Enterprise Duty of Care", size=11, color=TEXT_MUTED, space_after=6)
    add_para(tf, "• University & Student Transit Passports:", size=11.5, color=TEXT_WHITE, bold=True)
    add_para(tf, "Institutional safety tracking for college students traveling home during semester breaks.", size=11.5, color=TEXT_LIGHT, space_after=4)
    add_para(tf, "• Enterprise Travel Duty of Care:", size=11.5, color=TEXT_WHITE, bold=True)
    add_para(tf, "Enables regional enterprises to provide verified safety tracking for field staff.", size=11.5, color=TEXT_LIGHT, space_after=4)
    add_para(tf, "• Bus Operator Fleet Analytics: Route demand signals.", size=11, color=TEXT_MUTED)

    add_bottom_bar(s8, "Unit Economics Target: [ADD: Target Customer Acquisition Cost < ₹60; Blended LTV > ₹240 across 4 annual journeys].")

    set_notes(s8, (
        "Our business model benefits from unique unit economics. Traditional travel platforms monetize single-ticket purchases. "
        "Because TravelMate combines multiple legs into one itinerary, we capture commissions across both segments—from authorized train "
        "partners as well as bus operators and regional airlines. On top of commissions, frequent travelers will gladly pay 49 rupees for "
        "Tatkal automation and delay protection alerts. In the longer term, our transit safety layer opens high-margin enterprise partnerships."
    ))

    # =============================================================
    # SLIDE 9: Why Now? 2026 Market Inflection
    # =============================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_background(s9)
    add_header(s9, "08 / Why Now?", "Three Converging Tailwinds Make 2026 the Perfect Market Window")

    # Tailwind 1
    add_card(s9, Inches(0.8), top_pos, col_w, card_h, border_color=CYAN_BRIGHT)
    tb = s9.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "1. Physical Transit Boom", size=15.5, color=CYAN_BRIGHT, bold=True, space_after=6)
    add_para(tf, "• Vande Bharat & Expressways:", size=12, color=TEXT_WHITE, bold=True, space_before=4)
    add_para(tf, "Access-controlled expressways make intercity bus arrival times reliable within a 15-minute margin.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• UDAN Regional Aviation:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Over 140 operational regional airports allow feeder trains to connect seamlessly to regional flights.", size=11.5, color=TEXT_LIGHT)

    # Tailwind 2
    add_card(s9, Inches(0.8) + col_w + gap, top_pos, col_w, card_h, border_color=AMBER_ACCENT)
    tb = s9.shapes.add_textbox(Inches(1.0) + col_w + gap, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "2. Universal UPI & Mobile", size=15.5, color=AMBER_ACCENT, bold=True, space_after=6)
    add_para(tf, "• Digital-First Travelers:", size=12, color=TEXT_WHITE, bold=True, space_before=4)
    add_para(tf, "Over 85% of rail and bus bookings in India are now completed digitally via UPI.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Zero Waitlist Tolerance:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Gen-Z and millennial commuters refuse to stand in station queues or wait helplessly on unconfirmed waitlists.", size=11.5, color=TEXT_LIGHT)

    # Tailwind 3
    add_card(s9, Inches(0.8) + (col_w + gap)*2, top_pos, col_w, card_h, border_color=EMERALD_ACCENT)
    tb = s9.shapes.add_textbox(Inches(1.0) + (col_w + gap)*2, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "3. Client-Side AI & PWA", size=15.5, color=EMERALD_ACCENT, bold=True, space_after=6)
    add_para(tf, "• In-Browser Graph Routing:", size=12, color=TEXT_WHITE, bold=True, space_before=4)
    add_para(tf, "Modern client-side algorithms evaluate thousands of multimodal connections in milliseconds.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Progressive Web Standards:", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Offline browser caching and service workers enable desktop-grade safety tools with zero app install friction.", size=11.5, color=TEXT_LIGHT)

    add_bottom_bar(s9, "Strategic Fit: Connects regional physical infrastructure hubs (like Nagpur Junction) directly into a digital booking layer.")

    set_notes(s9, (
        "Why couldn't TravelMate exist five years ago? First, the physical infrastructure wasn't ready. Access-controlled expressways "
        "now ensure buses run on tight, predictable schedules, while regional UDAN airports make multi-modal flight transfers feasible. "
        "Second, UPI has made digital booking universal across Tier 2 and Tier 3 cities. Third, modern web technology allows us to compute "
        "complex multimodal route graphs and cache offline safety tools directly in the browser with zero install friction."
    ))

    # =============================================================
    # SLIDE 10: Traction & Hackathon Validation
    # =============================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_background(s10)
    add_header(s10, "09 / Traction & Validation", "Live Working Prototype Backed by Disciplined Engineering")

    # Box 1
    add_card(s10, Inches(0.8), g_y1, g_w, g_h, border_color=EMERALD_ACCENT)
    tb = s10.shapes.add_textbox(Inches(1.0), g_y1 + Inches(0.15), Inches(5.26), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "🚀 Live Web Application Deployed", size=14.5, color=EMERALD_ACCENT, bold=True, space_after=4)
    add_para(tf, "• Production application live at travelmate-ai-flowzint.vercel.app.", size=11.5, color=TEXT_LIGHT, space_after=3)
    add_para(tf, "• Built on React 19, Tailwind CSS, and Vite with sub-second response times.", size=11.5, color=TEXT_LIGHT, space_after=3)
    add_para(tf, "• Instant deep links to ConfirmTkt, RedBus, and Google Flights.", size=11.5, color=TEXT_LIGHT)

    # Box 2
    add_card(s10, Inches(6.86), g_y1, g_w, g_h, border_color=CYAN_BRIGHT)
    tb = s10.shapes.add_textbox(Inches(7.06), g_y1 + Inches(0.15), Inches(5.26), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "🧪 62 Automated Tests Passing (100% Pass Rate)", size=14.5, color=CYAN_BRIGHT, bold=True, space_after=4)
    add_para(tf, "• Full unit & integration test coverage across routing algorithms.", size=11.5, color=TEXT_LIGHT, space_after=3)
    add_para(tf, "• Verified Station Hopper quota bypass math across trunk corridors.", size=11.5, color=TEXT_LIGHT, space_after=3)
    add_para(tf, "• Automated regression testing on emergency alert generation.", size=11.5, color=TEXT_LIGHT)

    # Box 3
    add_card(s10, Inches(0.8), g_y2, g_w, g_h, border_color=AMBER_ACCENT)
    tb = s10.shapes.add_textbox(Inches(1.0), g_y2 + Inches(0.15), Inches(5.26), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "🗺️ Curated Transit Hub Knowledge Base", size=14.5, color=AMBER_ACCENT, bold=True, space_after=4)
    add_para(tf, "• Mapped transfer navigation for India's busiest junctions: Nagpur, Jaipur, Vijayawada, Kanpur, Bhopal.", size=11.5, color=TEXT_LIGHT, space_after=3)
    add_para(tf, "• Verified inter-terminal auto/taxi fare brackets and safety metrics.", size=11.5, color=TEXT_LIGHT, space_after=3)
    add_para(tf, "• Procedural fallback generation for unlisted Indian cities.", size=11.5, color=TEXT_LIGHT)

    # Box 4
    add_card(s10, Inches(6.86), g_y2, g_w, g_h, border_color=ROSE_ACCENT)
    tb = s10.shapes.add_textbox(Inches(7.06), g_y2 + Inches(0.15), Inches(5.26), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "👥 User Feedback & Early Validation", size=14.5, color=ROSE_ACCENT, bold=True, space_after=4)
    add_para(tf, "• [ADD: 25+ Traveler Interviews Conducted with 88% Willingness to Use].", size=11.5, color=TEXT_LIGHT, space_after=3)
    add_para(tf, "• [ADD: 150+ Beta Waitlist Signups Gathered at Hackathon].", size=11.5, color=TEXT_LIGHT, space_after=3)
    add_para(tf, "• Validated willingness to pay ₹49 for guaranteed Tatkal auto-fill and alerts.", size=11.5, color=TEXT_LIGHT)

    add_bottom_bar(s10, "Execution Velocity: Advanced from concept to fully tested, responsive production deployment in 5 daily engineering sprints.", accent_color=EMERALD_ACCENT)

    set_notes(s10, (
        "We didn't come to this pitch competition with mockups. We came with a production web application. TravelMate is live today "
        "on Vercel. Our code is supported by 62 automated unit and integration tests passing with zero errors. We have built real-world "
        "junction intelligence for major transfer hubs like Nagpur, Jaipur, and Kanpur. In early traveler feedback, over 85% of users "
        "confirmed they would use a multimodal route when direct train tickets are waitlisted."
    ))

    # =============================================================
    # SLIDE 11: Team & Execution Power
    # =============================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_background(s11)
    add_header(s11, "10 / The Team", "Technical Builders with Deep Empathy for Indian Public Transit")

    # Founder Card
    add_card(s11, Inches(0.8), top_pos, col_w, card_h, border_color=CYAN_BRIGHT)
    tb = s11.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "Surendra Gedala", size=17, color=CYAN_BRIGHT, bold=True)
    add_para(tf, "Founder & Lead Architect", size=11.5, color=TEXT_MUTED, space_after=6)
    add_para(tf, "• Full-Stack Engineer with deep expertise in resilient web applications, client-side routing, and PWA systems.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Architected TravelMate's multimodal routing engine, offline safety pass, and quota predictors from scratch.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Personal driver: Chronic frustration with Indian Railways waitlists during intercity university migrations.", size=11.5, color=TEXT_LIGHT)

    # Co-Founder / GTM Lead
    add_card(s11, Inches(0.8) + col_w + gap, top_pos, col_w, card_h, border_color=AMBER_ACCENT)
    tb = s11.shapes.add_textbox(Inches(1.0) + col_w + gap, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "[ADD: Operations & GTM Lead]", size=15.5, color=AMBER_ACCENT, bold=True)
    add_para(tf, "Co-Founder / Early Key Hire", size=11.5, color=TEXT_MUTED, space_after=6)
    add_para(tf, "• Focus: Bus operator partnerships, student community acquisition, and campus ambassador networks.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Background in college campus growth, digital marketing, or logistics operations in Tier 2/3 cities.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Currently active in hackathon pipeline and finalizing co-founder alignment.", size=11, color=TEXT_MUTED)

    # Advisory
    add_card(s11, Inches(0.8) + (col_w + gap)*2, top_pos, col_w, card_h, border_color=EMERALD_ACCENT)
    tb = s11.shapes.add_textbox(Inches(1.0) + (col_w + gap)*2, top_pos + Inches(0.2), Inches(3.24), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "[ADD: Industry Advisors]", size=15.5, color=EMERALD_ACCENT, bold=True)
    add_para(tf, "Transit & Venture Mentorship", size=11.5, color=TEXT_MUTED, space_after=6)
    add_para(tf, "• Seeking mentorship from leaders in Indian mobility, infrastructure, and OTA distribution.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Target advisory profile: Former executives from IRCTC / MakeMyTrip / ixigo / State Road Transport Corporations.", size=11.5, color=TEXT_LIGHT, space_after=6)
    add_para(tf, "• Strategic alignment with infrastructure leaders like YAI Infraventure.", size=11.5, color=CYAN_BRIGHT, bold=True)

    add_bottom_bar(s11, "Founder Mindset: Rapid autonomous shipping, zero technical debt, and obsessive customer focus on travel reliability.")

    set_notes(s11, (
        "I'm Surendra Gedala, the founder and lead engineer behind TravelMate. I didn't start TravelMate because of a casual brainstorm; "
        "I built it out of the acute frustration of being stuck without train tickets during college and professional travel. I bring hands-on "
        "full-stack engineering discipline, having built our entire routing engine and safety system from scratch. We are actively structuring "
        "our advisory board and recruiting our growth co-founder to lead campus acquisition across Central and North India."
    ))

    # =============================================================
    # SLIDE 12: The Ask & 12-Month Roadmap
    # =============================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_background(s12)
    add_header(s12, "11 / The Ask & Roadmap", "Seeking [ADD: ₹35 Lakhs / $45K Pre-Seed] to Launch Across 5 Core Corridors")

    # Left Column: The Ask & Use of Funds
    add_card(s12, Inches(0.8), top_pos, Inches(5.66), card_h, border_color=CYAN_BRIGHT)
    tb = s12.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.2), Inches(5.26), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "🎯 What We Are Asking For", size=16, color=CYAN_BRIGHT, bold=True, space_after=4)
    add_para(tf, "• Pre-Seed Investment: [ADD: ₹35 Lakhs / $45,000 for 12-Month Runway]", size=12.5, color=TEXT_WHITE, bold=True, space_after=8)
    add_para(tf, "• Strategic Value from YAI Infraventure:", size=12, color=AMBER_ACCENT, bold=True)
    add_para(tf, "  - Access to regional transit infrastructure insights and commercial hub networks in Maharashtra/Central India.", size=11.5, color=TEXT_LIGHT, space_after=3)
    add_para(tf, "  - Mentorship on regulatory scaling, corporate compliance, and pilot trials.", size=11.5, color=TEXT_LIGHT, space_after=8)
    add_para(tf, "• Targeted Use of Funds:", size=12, color=EMERALD_ACCENT, bold=True)
    add_para(tf, "  - 45% Direct API Licensing & Cloud Infrastructure (IRCTC partner, RedBus).", size=11.5, color=TEXT_LIGHT, space_after=2)
    add_para(tf, "  - 35% Student Campus Ambassador Program & GTM across 5 routes.", size=11.5, color=TEXT_LIGHT, space_after=2)
    add_para(tf, "  - 20% Engineering & Security Audit for offline SOS compliance.", size=11.5, color=TEXT_LIGHT)

    # Right Column: 12-Month Milestones
    add_card(s12, Inches(6.86), top_pos, Inches(5.66), card_h, border_color=EMERALD_ACCENT)
    tb = s12.shapes.add_textbox(Inches(7.06), top_pos + Inches(0.2), Inches(5.26), Inches(3.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    add_para(tf, "🗺️ 12-Month Milestone Targets", size=16, color=EMERALD_ACCENT, bold=True, space_after=4)
    add_para(tf, "• Q1 (Months 1–3): Closed Beta & Provider APIs", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Integrate live provider APIs; onboard 1,500 active student beta users.", size=11.5, color=TEXT_LIGHT, space_after=8)
    add_para(tf, "• Q2–Q3 (Months 4–8): 5-Corridor Regional Launch", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Deploy on Delhi-Kanpur, Mumbai-Nagpur, Pune-Hyderabad, Bangalore-Chennai corridors. Target: 10,000 monthly journeys.", size=11.5, color=TEXT_LIGHT, space_after=8)
    add_para(tf, "• Q4 (Months 9–12): Revenue Validation & Seed Round", size=12, color=TEXT_WHITE, bold=True)
    add_para(tf, "Achieve [ADD: ₹6 Lakhs monthly gross booking revenue] and raise institutional Seed round.", size=11.5, color=TEXT_LIGHT)

    add_bottom_bar(s12, "Join us in transforming India's public transit into a dependable, connected mobility network. Thank you!")

    set_notes(s12, (
        "To take TravelMate to market, we are raising a pre-seed round of [ADD: ₹35 Lakhs] for a 12-month runway. "
        "45% of the funds will secure direct provider API partnerships with authorized railway and bus aggregators. "
        "35% will drive low-CAC student campus acquisition across our first five high-density corridors, connecting key hubs like Nagpur, "
        "Mumbai, Pune, and Delhi. With YAI Infraventure's deep roots in regional physical infrastructure, we have a unique opportunity to turn "
        "unconnected stations into a unified, digital travel layer. Thank you, and I look forward to your questions."
    ))

    # Save Presentation
    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == "__main__":
    out_dir = r"C:\Users\SURENDRA.G\Downloads"
    out_file = os.path.join(out_dir, "TravelMate_pitch_v2.pptx")
    create_deck(out_file)
