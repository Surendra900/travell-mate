import asyncio
import os
import time
import edge_tts

def get_duration(path):
    with open(path, 'rb') as f:
        data = f.read()
    frame_count = 0
    pos = 0
    while pos < len(data) - 4:
        if data[pos] == 0xFF and (data[pos+1] & 0xE0) == 0xE0:
            ver = (data[pos+1] >> 3) & 3
            layer = (data[pos+1] >> 1) & 3
            sr_idx = (data[pos+2] >> 2) & 0x03
            bitrate_idx = (data[pos+2] >> 4) & 0x0F
            padding = (data[pos+2] >> 1) & 0x01
            if ver == 2 and layer == 1 and sr_idx == 1:
                frame_count += 1
                bitrates_v2_l3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]
                if bitrate_idx < len(bitrates_v2_l3) and bitrates_v2_l3[bitrate_idx] > 0:
                    frame_len = int(72 * (bitrates_v2_l3[bitrate_idx] * 1000) / 24000) + padding
                    pos += max(frame_len, 1)
                    continue
        pos += 1
    return frame_count * (576.0 / 24000.0)

VOICE = "en-IN-PrabhatNeural"
OUTPUT_DIR = "outputs/voiceover_4m20s"

SEGMENTS = [
    {
        "id": "01_intro",
        "title": "Team Introductions",
        "rate": "+15%",
        "text": (
            "Hello judges, we are Team TravelMate presenting for BuildX 2026. "
            "My name is Surendra G, team lead and full-stack engineer. "
            "Our project is TravelMate AI, India's first multimodal transit disruption and route recovery engine."
        )
    },
    {
        "id": "02_problem",
        "title": "Problem Statement",
        "rate": "+16%",
        "text": (
            "Every month across India, over 25 million waitlisted train tickets are automatically cancelled. "
            "Over 24 million passengers travel daily on Indian Railways, but track saturation leaves major corridors heavily overbooked. "
            "Today, railway, aviation, and bus networks operate in complete silos. "
            "If your train from Patna to Bengaluru is waitlisted at WL 90, apps simply say, 'No tickets available,' stranding travelers or forcing them to pay emergency airfares surging past 18,000 rupees. "
            "Furthermore, travelers attempting manual connecting journeys often miscalculate road transit between stations and airports in heavy city traffic, resulting in costly missed flights."
        )
    },
    {
        "id": "03_solution",
        "title": "Proposed Solution",
        "rate": "+15%",
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
        "rate": "+16%",
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
        "rate": "+15%",
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
        "rate": "+15%",
        "text": (
            "For urgent same-day travel, our Tatkal Desk provides real-time millisecond countdown clocks calibrated to official 10:00 AM AC and 11:00 AM Non-AC booking windows, complete with live seat quota availability and station-hopper bypass suggestions."
        )
    },
    {
        "id": "05c_safety_demo",
        "title": "Live Demo - Offline Pass & Safety Hub",
        "rate": "+15%",
        "text": (
            "Because disruptions frequently occur in poor connectivity corridors, our Safety Mode generates a zero-network digital boarding pass with monospace PNR, leg timings, and a high-resolution QR code. "
            "It also provides 1-tap access to Railway helpline 139 and emergency GPS dispatch, with all passenger data remaining strictly on local browser storage in full compliance with India's Digital Personal Data Protection Act 2023."
        )
    },
    {
        "id": "06_closing",
        "title": "Closing & Call to Action",
        "rate": "+12%",
        "text": (
            "TravelMate turns transit cancellations into guaranteed arrival. "
            "Our solution is open-source, fully verified, and live on Vercel at travelmate-ai-flowzint.vercel.app. "
            "Thank you, judges."
        )
    }
]

async def generate_segment_with_retry(seg, max_retries=5):
    seg_file = os.path.join(OUTPUT_DIR, f"{seg['id']}.mp3")
    for attempt in range(1, max_retries + 1):
        try:
            comm = edge_tts.Communicate(seg["text"], voice=VOICE, rate=seg["rate"])
            await comm.save(seg_file)
            dur = get_duration(seg_file)
            return seg_file, dur
        except Exception as e:
            print(f"  [Attempt {attempt} failed for {seg['id']}: {e}]")
            if attempt < max_retries:
                await asyncio.sleep(2 * attempt)
            else:
                raise

async def calibrate():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    full_audio_pieces = []
    total_dur = 0
    
    print("Generating calibrated voiceover segments with retry...")
    for i, seg in enumerate(SEGMENTS):
        seg_file, dur = await generate_segment_with_retry(seg)
        total_dur += dur
        print(f"[{i+1}/{len(SEGMENTS)}] {seg['title']}: {dur:.2f}s (rate {seg['rate']})")
        full_audio_pieces.append(seg_file)
        await asyncio.sleep(0.5)
        
    master_file = "outputs/TravelMate_4m20s_Master_Voiceover.mp3"
    with open(master_file, "wb") as outfile:
        for piece in full_audio_pieces:
            with open(piece, "rb") as infile:
                outfile.write(infile.read())
                
    final_dur = get_duration(master_file)
    print("\n" + "="*50)
    print(f"Master file: {master_file}")
    print(f"Master Duration: {final_dur:.2f}s ({final_dur/60:.2f} min = {int(final_dur//60)}m {int(final_dur%60):02d}s)")
    print(f"Target Duration: 260.00s (4m 20s)")
    print(f"Difference: {final_dur - 260.0:+.2f}s")
    print("="*50)

if __name__ == "__main__":
    asyncio.run(calibrate())
