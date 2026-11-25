import asyncio
import os
import edge_tts

# Calibrated for EXACTLY 4 minutes 20 seconds (260 seconds)
VOICE = "en-IN-PrabhatNeural"  # Clear, natural Indian English male presenter voice
RATE = "+10%"                  # Confident, natural presentation pace
OUTPUT_DIR = "outputs/voiceover_4m20s"

SEGMENTS = [
    {
        "id": "01_intro",
        "title": "Team Introductions",
        "target_sec": 20,
        "text": (
            "Hello judges, we are Team TravelMate presenting for BuildX 2026. "
            "My name is Surendra G, team lead and full-stack engineer. "
            "Our project is TravelMate AI, India's first multimodal transit disruption and route recovery engine."
        )
    },
    {
        "id": "02_problem",
        "title": "Problem Statement",
        "target_sec": 45,
        "text": (
            "Every month across India, over 25 million waitlisted train tickets are automatically cancelled. "
            "Over 24 million passengers travel daily on Indian Railways, but track saturation leaves major corridors overbooked. "
            "Today, railway, aviation, and bus networks operate in complete silos. "
            "If your train from Patna to Bengaluru is waitlisted at WL 90, apps simply say, 'No tickets available,' stranding travelers or forcing them to pay emergency airfares surging past 18,000 rupees. "
            "Furthermore, travelers attempting manual connecting journeys often miscalculate road transit between stations and airports in heavy city traffic, resulting in costly missed flights."
        )
    },
    {
        "id": "03_solution",
        "title": "Proposed Solution",
        "target_sec": 40,
        "text": (
            "To solve this, we built TravelMate AI. "
            "When direct trains are waitlisted, our graph routing engine dynamically synthesizes verified cross-modal alternatives: "
            "Train plus Flight, Train plus Bus, and multi-train split connections across regional transit hubs. "
            "Crucially, we do not just match static schedules. We mathematically enforce Minimum Connection Times, "
            "including a strict 3-hour transfer buffer for rail-to-air journeys, ensuring passengers safely cover city road transit and domestic airport security check-in."
        )
    },
    {
        "id": "04_implementation",
        "title": "Technical Implementation & Architecture",
        "target_sec": 50,
        "text": (
            "Under the hood, TravelMate is engineered with a modular, resilient serverless architecture. "
            "Our API Fusion Layer queries rail timetables and aviation providers in parallel, deduplicating records and enforcing search mode purity so train queries are never polluted with buses. "
            "We implement Upstash Redis caching with custom resilience wrappers, withTimeout and withCache, preventing upstream latency spikes. "
            "Our Haversine Geolocation Engine performs 50-kilometer radius scans to locate nearby feeder stations and regional airports. "
            "The platform is empirically verified by our 136-test transport suite and 308 unit and integration tests, achieving 100% pass rates and zero WCAG 2.1 AA accessibility violations."
        )
    },
    {
        "id": "05a_planner_demo",
        "title": "Live Demo - Train + Flight with 3h Buffer",
        "target_sec": 45,
        "text": (
            "Now let us examine the live product. On our home interface, we select the Delhi to Patna corridor. "
            "Direct trains are heavily waitlisted. In one click, TravelMate generates verified multimodal options. "
            "Here is our signature Train plus Flight recovery card: Leg 1 boards the morning Vande Bharat Express at 06:00 AM. "
            "Our engine identifies a strict 3-hour safe connection buffer at the intermediate junction, allowing ample time for taxi transit to the airport and domestic security clearance before boarding IndiGo flight 6E-6314 to Patna. "
            "Every card displays transparent data provenance and provides 1-click deep links to official IRCTC and airline portals for unbundled booking."
        )
    },
    {
        "id": "05b_tatkal_demo",
        "title": "Live Demo - Emergency Tatkal Desk",
        "target_sec": 22,
        "text": (
            "For urgent same-day travel, our Tatkal Desk provides real-time millisecond countdown clocks calibrated to official 10:00 AM AC and 11:00 AM Non-AC booking windows, complete with live seat quota availability and station-hopper bypass suggestions."
        )
    },
    {
        "id": "05c_safety_demo",
        "title": "Live Demo - Offline Pass & Safety Hub",
        "target_sec": 23,
        "text": (
            "Because disruptions frequently occur in poor connectivity corridors, our Safety Mode generates a zero-network digital boarding pass with monospace PNR, leg timings, and a high-resolution QR code. "
            "It also provides 1-tap access to Railway helpline 139 and emergency GPS dispatch, with all passenger data remaining strictly on local browser storage in full compliance with India's Digital Personal Data Protection Act 2023."
        )
    },
    {
        "id": "06_closing",
        "title": "Closing & Call to Action",
        "target_sec": 15,
        "text": (
            "TravelMate turns transit cancellations into guaranteed arrival. "
            "Our solution is open-source, fully verified, and live on Vercel at travelmate-ai-flowzint.vercel.app. "
            "Thank you, judges."
        )
    }
]

async def generate():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    full_audio_pieces = []
    
    print(f"Generating voiceover using voice: {VOICE} with rate: {RATE}...")
    
    for i, seg in enumerate(SEGMENTS):
        seg_file = os.path.join(OUTPUT_DIR, f"{seg['id']}.mp3")
        communicate = edge_tts.Communicate(seg["text"], voice=VOICE, rate=RATE)
        await communicate.save(seg_file)
        sz = os.path.getsize(seg_file)
        sec = sz / 6000
        print(f"[{i+1}/{len(SEGMENTS)}] {seg['title']}: {sz} bytes (~{sec:.1f}s, target: {seg['target_sec']}s)")
        full_audio_pieces.append(seg_file)
        
    master_file = "outputs/TravelMate_4m20s_Master_Voiceover.mp3"
    with open(master_file, "wb") as outfile:
        for piece in full_audio_pieces:
            with open(piece, "rb") as infile:
                outfile.write(infile.read())
                
    total_sz = os.path.getsize(master_file)
    total_sec = total_sz / 6000
    print(f"\n==========================================")
    print(f"Master voiceover: {master_file}")
    print(f"Total size: {total_sz} bytes (~{total_sec:.1f}s = {total_sec/60:.2f} min)")
    print(f"Target duration: 260.0s (4 min 20 sec)")
    print(f"Difference: {total_sec - 260.0:+.1f}s")
    print(f"==========================================")

if __name__ == "__main__":
    asyncio.run(generate())
