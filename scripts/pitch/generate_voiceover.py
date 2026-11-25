import asyncio
import os
import edge_tts

VOICE = "en-IN-PrabhatNeural"  # Highly natural, clear Indian English presenter voice
RATE = "-2%"                   # Slightly relaxed for crisp technical articulation
OUTPUT_DIR = "outputs/audio_voiceover"

SEGMENTS = [
    {
        "id": "01_intro",
        "title": "Team Introductions",
        "text": (
            "Hello judges, we are Team TravelMate presenting for BuildX 2026. "
            "My name is Surendra G, team lead and full-stack engineer. "
            "Our project is TravelMate AI, India's first autonomous multimodal transit disruption and route recovery engine."
        )
    },
    {
        "id": "02_problem",
        "title": "Problem Statement",
        "text": (
            "Every single month across India, over 25 million waitlisted train tickets are automatically cancelled. "
            "Over 24 million passengers travel daily on Indian Railways, but track saturation leaves major travel corridors chronically overbooked. "
            "Today, railway, aviation, and intercity bus networks operate in complete silos. "
            "If your direct train from Patna to Bengaluru is waitlisted at WL 90, conventional apps simply say, 'No tickets available.' "
            "Travelers are left stranded, fall prey to unauthorized ticket touts, or face emergency airfares surging past 18,000 rupees. "
            "Furthermore, when passengers attempt manual connecting journeys on their own, they often miscalculate road transit between stations and airports in heavy city traffic, resulting in costly missed flights."
        )
    },
    {
        "id": "03_solution",
        "title": "Proposed Solution",
        "text": (
            "To solve this crisis, we built TravelMate AI. "
            "When direct trains are waitlisted, TravelMate's time-expanded graph routing engine automatically synthesizes verified cross-modal alternatives: "
            "Train plus Flight, Train plus Bus, and multi-train split connections across regional hubs. "
            "Crucially, we do not just match static timetables. We mathematically enforce parametric Minimum Connection Times, "
            "including a mandatory 3-hour transfer buffer for rail-to-air journeys, ensuring passengers safely cover city road transit and domestic airport security check-in."
        )
    },
    {
        "id": "04_implementation",
        "title": "Technical Implementation & Architecture",
        "text": (
            "Under the hood, TravelMate is engineered with a modular, resilient serverless architecture. "
            "First, our API Fusion Layer queries rail timetables and aviation providers in parallel, deduplicating flight records and enforcing search mode purity so train queries are never polluted with buses. "
            "Second, we implement Upstash Redis caching with custom resilience wrappers, withTimeout and withCache, ensuring upstream latency spikes never hang the application. "
            "Third, our Haversine Geolocation Engine performs 50-kilometer radius scans to locate nearby feeder stations and regional airports when direct routes have zero availability. "
            "The entire platform is empirically verified by our 136-test transport test suite and over 308 unit and integration tests, achieving 100% pass rates and zero WCAG 2.1 AA accessibility violations."
        )
    },
    {
        "id": "05a_planner_demo",
        "title": "Live Demo - Train + Flight with 3h Buffer",
        "text": (
            "Let us look at the live product. On our home interface, we select the Delhi to Patna corridor. "
            "Direct trains are heavily waitlisted. In one click, TravelMate generates verified multimodal options. "
            "Here is our signature Train plus Flight recovery card: Leg 1 boards the morning Vande Bharat Express at 06:00 AM. "
            "Our engine identifies a strict 3-hour safe connection buffer at the intermediate junction, allowing ample time for taxi transit to the airport and domestic security clearance before boarding IndiGo flight 6E-6314 to Patna. "
            "Every card displays transparent data provenance and provides 1-click deep links to official IRCTC and airline portals for unbundled booking."
        )
    },
    {
        "id": "05b_tatkal_demo",
        "title": "Live Demo - Emergency Tatkal Desk",
        "text": (
            "For same-day emergency travel, our Tatkal Desk provides real-time millisecond countdown clocks calibrated to official 10:00 AM AC and 11:00 AM Non-AC booking windows, complete with live seat quota availability and station-hopper bypass suggestions."
        )
    },
    {
        "id": "05c_safety_demo",
        "title": "Live Demo - Offline Pass & Safety Hub",
        "text": (
            "Because disruptions frequently occur in poor connectivity corridors, our Safety Mode generates a zero-network digital boarding pass. "
            "It displays the monospace PNR, leg timings, and a high-resolution verifiable QR code that works completely disconnected from the internet. "
            "It also provides 1-tap access to Railway Police helpline 139 and emergency GPS dispatch. "
            "All passenger data remains strictly on the client's local browser storage in full compliance with India's Digital Personal Data Protection Act 2023."
        )
    },
    {
        "id": "06_closing",
        "title": "Closing & Call to Action",
        "text": (
            "TravelMate turns transit cancellations into guaranteed arrival. "
            "Our solution is open-source, fully verified, and live on Vercel at travelmate-ai-flowzint.vercel.app. "
            "Thank you, judges."
        )
    }
]

async def generate_all():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    full_audio_pieces = []
    
    print(f"Generating voiceover using voice: {VOICE} with rate: {RATE}...")
    
    for i, seg in enumerate(SEGMENTS):
        seg_file = os.path.join(OUTPUT_DIR, f"{seg['id']}.mp3")
        print(f"[{i+1}/{len(SEGMENTS)}] Generating {seg['title']}...")
        
        communicate = edge_tts.Communicate(seg["text"], voice=VOICE, rate=RATE)
        await communicate.save(seg_file)
        full_audio_pieces.append(seg_file)
        
    # Also combine all segments into a master audio file
    master_file = "outputs/TravelMate_5Min_Pitch_Voiceover.mp3"
    print(f"Creating combined master voiceover: {master_file}...")
    
    with open(master_file, "wb") as outfile:
        for piece in full_audio_pieces:
            with open(piece, "rb") as infile:
                outfile.write(infile.read())
                
    size_kb = os.path.getsize(master_file) / 1024
    print(f"Done! Master voiceover created successfully ({size_kb:.1f} KB).")

if __name__ == "__main__":
    asyncio.run(generate_all())
