import asyncio
import os
import re
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import edge_tts
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

WORKSPACE = Path("video_workspace")
WORKSPACE.mkdir(exist_ok=True)
OUTPUT_MP4 = Path("Little_Steps_Project_Walkthrough.mp4")
FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
VOICE = "en-IN-NeerjaNeural"

SCENES = [
    {
        "id": "scene_1_intro",
        "header": "OVERVIEW • PROJECT INTRODUCTION",
        "title": "Little Steps — Trusted 24×7 Childcare",
        "subtitle": "Full-Stack Childcare & Crèche Marketplace for Working Parents",
        "narration": "Welcome to Little Steps — a trusted 24×7 childcare platform designed for working parents, rotational shift workers, and modern nuclear families across India.",
        "type": "title_card",
    },
    {
        "id": "scene_2_problem",
        "header": "PROBLEM STATEMENT • MODERN CHILDCARE",
        "title": "The Reality for Working Parents in India",
        "points": [
            "1. Traditional daycares shut down at 6 PM — leaving doctors, nurses & IT shift workers stranded.",
            "2. Unverified Staff & Safety Anxieties — risk of unauthorized child handovers at evening pickup.",
            "3. Zero Capacity Visibility — manual spreadsheets lead to severe overbooking and surprise cancellations.",
        ],
        "narration": "Across urban India today, finding safe childcare is difficult. Traditional daycares shut down at 6 PM, leaving doctors, nurses, and IT professionals working night shifts with no options. Parents also struggle with unverified staff and zero visibility into whether centers are overbooking.",
        "type": "bullets_card",
    },
    {
        "id": "scene_3_home",
        "header": "LIVE PLATFORM • HOMEPAGE & TRUST ENGINE",
        "title": "Transparent 3-Step Walkthrough & Verified Testimonials",
        "url": "https://little-steps-blue.vercel.app/",
        "narration": "Little Steps solves this with verified crèches, flexible hourly, daily, and monthly plans, and a complete trust engine. The homepage guides parents through a transparent three-step process, real parent testimonials, and answers to common safety concerns.",
        "type": "browser_screenshot",
        "screenshot": "ss_home.png",
    },
    {
        "id": "scene_4_centers",
        "header": "LIVE DEMO • LEFT SIDEBAR DIRECTORY & FILTERS",
        "title": "Desktop Left Sidebar with Live GPS 'Near Me' & Budget Slider",
        "url": "https://little-steps-blue.vercel.app/centers",
        "narration": "On our centers directory, parents can filter by city or click 'Detect Near Me' to find the closest hub. The left sidebar allows instant filtering for 24×7 care, infant care under one year, live CCTV monitoring, and custom hourly budgets.",
        "type": "browser_screenshot",
        "screenshot": "ss_centers.png",
    },
    {
        "id": "scene_5_detail",
        "header": "LIVE DEMO • CENTER DETAILS & CAPACITY LOCK",
        "title": "Verified Staff Badges, Safety Protocols & Live Seats Left",
        "url": "https://little-steps-blue.vercel.app/centers/e59a3e43-aeb1-444e-98f0-90191dff3ce8",
        "narration": "Each daycare page provides complete transparency, including verified caregiver credentials, safety measures, and pricing. Our booking engine calculates real-time seat availability to ensure parents never face unexpected cancellations.",
        "type": "browser_screenshot",
        "screenshot": "ss_detail.png",
    },
    {
        "id": "scene_6_pickup_security",
        "header": "SECURITY MECHANISM • DIGITAL PICKUP VERIFICATION",
        "title": "Cryptographic 4-Digit Pickup PIN Handover Protocol",
        "narration": "Safety extends to the moment of pickup. Once a booking is confirmed, parents receive a digital pickup pass with a secret four-digit PIN. Centers verify this PIN before handing over the child, preventing unauthorized pickups.",
        "type": "security_card",
    },
    {
        "id": "scene_7_portals",
        "header": "BUSINESS & GOVERNANCE • DUAL-SIDED MARKETPLACE",
        "title": "Daycare Provider Revenue Analytics & Admin Governance Desk",
        "narration": "For daycare owners, the provider portal offers monthly revenue analytics and seamless booking approvals. Platform administrators govern the ecosystem by verifying daycare licenses and caregiver police checks before centers go live.",
        "type": "portals_card",
    },
    {
        "id": "scene_8_architecture",
        "header": "HOW I BUILT IT • FULL-STACK ARCHITECTURE",
        "title": "TanStack Start, React 19, Supabase DB Triggers & RLS",
        "narration": "I built Little Steps using TanStack Start, React 19, and Tailwind CSS for a high-performance, type-safe full-stack experience. On the backend, Supabase PostgreSQL uses automated database triggers to enforce capacity locks and price calculations, backed by strict Row-Level Security. The platform is deployed live on Vercel.",
        "type": "architecture_card",
    },
    {
        "id": "scene_9_outro",
        "header": "SUMMARY • PRODUCTION DELIVERABLE",
        "title": "Little Steps — Modern Childcare for Working India",
        "narration": "Little Steps bridges the gap between modern working hours and child safety. You can try the live platform at little-steps-blue.vercel.app. Thank you for watching!",
        "type": "outro_card",
    },
]

def capture_screenshots():
    print("=== Step 1: Capturing Live Website Screenshots ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        page = browser.new_page(viewport={"width": 1600, "height": 1000})

        for scene in SCENES:
            if scene.get("type") == "browser_screenshot":
                ss_file = WORKSPACE / scene["screenshot"]
                if not ss_file.exists():
                    print(f"Navigating to {scene['url']}...")
                    try:
                        page.goto(scene["url"], wait_until="networkidle", timeout=30000)
                        page.wait_for_timeout(2000)
                        page.screenshot(path=str(ss_file))
                        print(f"Captured {ss_file.name}")
                    except Exception as e:
                        print(f"Error capturing {scene['url']}: {e}")
        browser.close()

async def generate_audio():
    print("\n=== Step 2: Generating Natural Voiceover Audio (Neerja) ===")
    for scene in SCENES:
        mp3_path = WORKSPACE / f"{scene['id']}.mp3"
        if not mp3_path.exists():
            print(f"Generating audio for {scene['id']}...")
            communicate = edge_tts.Communicate(scene["narration"], VOICE, rate="-2%")
            await communicate.save(str(mp3_path))
            print(f"Saved {mp3_path.name}")

def get_audio_duration(audio_path):
    cmd = [FFMPEG_EXE, "-i", str(audio_path)]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
    m = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", res.stderr)
    if m:
        h, mn, s = map(float, m.groups())
        return h * 3600 + mn * 60 + s
    return 8.0

def get_font(size, bold=False):
    font_file = "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"
    if not os.path.exists(font_file):
        font_file = "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"
    try:
        return ImageFont.truetype(font_file, size)
    except:
        return ImageFont.load_default()

def draw_header(draw, scene):
    # Top Category Pill
    draw.rounded_rectangle([70, 45, 70 + len(scene['header']) * 11 + 30, 85], radius=12, fill="#0ea5e9")
    draw.text((85, 52), scene["header"], font=get_font(16, bold=True), fill="#ffffff")

    # Main Slide Title
    title = scene.get("title", "")
    draw.text((70, 100), title, font=get_font(34, bold=True), fill="#0f172a")

def draw_subtitle_banner(draw, text):
    # Bottom spoken text caption bar
    draw.rounded_rectangle([60, 930, 1860, 1020], radius=16, fill="#0f172a")
    draw.rounded_rectangle([75, 950, 140, 995], radius=10, fill="#38bdf8")
    draw.text((88, 962), "AUDIO", font=get_font(15, bold=True), fill="#0f172a")

    # Wrap text cleanly
    words = text.split()
    line1, line2 = [], []
    for w in words:
        if len(" ".join(line1 + [w])) < 90:
            line1.append(w)
        else:
            line2.append(w)

    draw.text((160, 946), " ".join(line1), font=get_font(19, bold=True), fill="#f8fafc")
    if line2:
        draw.text((160, 978), " ".join(line2), font=get_font(18), fill="#94a3b8")

def render_slide(scene):
    # Canvas 1920x1080 (Soft modern background)
    img = Image.new("RGB", (1920, 1080), color="#f1f5f9")
    draw = ImageDraw.Draw(img)

    # Background subtle gradient top accent
    for y in range(8):
        draw.line([(0, y), (1920, y)], fill="#0284c7")

    draw_header(draw, scene)
    stype = scene["type"]

    if stype == "title_card":
        # Hero Branding Card
        draw.rounded_rectangle([70, 180, 1850, 890], radius=24, fill="#ffffff", outline="#e2e8f0", width=2)
        
        # Center Badge
        draw.rounded_rectangle([860, 240, 1060, 440], radius=100, fill="#0284c7")
        draw.text((915, 290), "👶", font=get_font(90))
        
        draw.text((960, 490), "Little Steps", font=get_font(56, bold=True), fill="#0f172a", anchor="mm")
        draw.text((960, 560), "Trusted 24×7 Childcare & Crèche Platform", font=get_font(28, bold=True), fill="#0284c7", anchor="mm")
        
        # 4 Pillars
        features = [
            ("🛡️ 100% Police Verified", "Every caregiver & center licensed"),
            ("🌙 True 24×7 Night Care", "Open for hospital & IT rotational shifts"),
            ("🔒 Zero Overbooking Trigger", "Database-enforced seat locking"),
            ("🔑 4-Digit Digital Pickup PIN", "Cryptographic handover protection"),
        ]
        col_w = 400
        start_x = 130
        for i, (f_title, f_sub) in enumerate(features):
            x = start_x + i * 420
            draw.rounded_rectangle([x, 650, x + col_w, 820], radius=16, fill="#f8fafc", outline="#cbd5e1", width=1)
            draw.text((x + 20, 680), f_title, font=get_font(20, bold=True), fill="#0f172a")
            draw.text((x + 20, 725), f_sub, font=get_font(15), fill="#64748b")

    elif stype == "bullets_card":
        # Problem cards layout
        draw.rounded_rectangle([70, 180, 1850, 890], radius=24, fill="#ffffff", outline="#e2e8f0", width=2)
        
        cards = [
            ("🌙 The 6 PM Cutoff Crisis", "Daycares in India typically shut at 6 PM. Emergency doctors, night-shift nurses, and IT tech support are completely stranded without overnight options.", "#ef4444"),
            ("⚠️ Unverified Staff & Safety Fears", "Parents fear leaving kids with informal nannies. Kidnapping and unauthorized pickup at evening rush hours require strict identity verification.", "#f59e0b"),
            ("📉 Broken Spreadsheets & Overbooking", "Most centers track seats on paper or Excel. When emergencies happen, centers overbook, causing last-minute cancellations for desperate parents.", "#6366f1")
        ]
        
        for idx, (c_title, c_desc, c_color) in enumerate(cards):
            y = 230 + idx * 210
            draw.rounded_rectangle([120, y, 1800, y + 175], radius=18, fill="#f8fafc", outline=c_color, width=2)
            draw.rounded_rectangle([140, y + 25, 148, y + 150], radius=4, fill=c_color)
            draw.text((170, y + 35), c_title, font=get_font(26, bold=True), fill="#0f172a")
            draw.text((170, y + 80), c_desc, font=get_font(18), fill="#475569")

    elif stype == "browser_screenshot":
        # Mac-style browser window container
        draw.rounded_rectangle([70, 170, 1850, 900], radius=20, fill="#ffffff", outline="#cbd5e1", width=2)
        # Browser chrome header
        draw.rectangle([70, 170, 1850, 215], fill="#e2e8f0")
        # 3 window buttons
        draw.ellipse([90, 186, 104, 200], fill="#ef4444")
        draw.ellipse([114, 186, 128, 200], fill="#f59e0b")
        draw.ellipse([138, 186, 152, 200], fill="#10b981")
        # URL bar
        draw.rounded_rectangle([200, 178, 1700, 208], radius=8, fill="#ffffff")
        draw.text((220, 184), scene.get("url", "https://little-steps-blue.vercel.app/"), font=get_font(14), fill="#64748b")

        ss_path = WORKSPACE / scene["screenshot"]
        if ss_path.exists():
            ss_img = Image.open(ss_path)
            # Resize and crop to fit 1780x685
            ss_resized = ss_img.resize((1780, int(ss_img.height * (1780 / ss_img.width))), Image.Resampling.LANCZOS)
            # Crop top portion
            ss_cropped = ss_resized.crop((0, 0, 1780, 685))
            img.paste(ss_cropped, (70, 215))

    elif stype == "security_card":
        draw.rounded_rectangle([70, 180, 1850, 890], radius=24, fill="#ffffff", outline="#e2e8f0", width=2)
        
        # Left card: Parent Digital Pass
        draw.rounded_rectangle([130, 230, 930, 840], radius=20, fill="#f0f9ff", outline="#0284c7", width=2)
        draw.text((530, 280), "📱 Parent Mobile Digital Pass", font=get_font(26, bold=True), fill="#0369a1", anchor="mm")
        
        draw.rounded_rectangle([200, 340, 860, 520], radius=16, fill="#ffffff", outline="#bae6fd", width=1)
        draw.text((530, 380), "CONFIRMED RESERVATION", font=get_font(14, bold=True), fill="#0284c7", anchor="mm")
        draw.text((530, 420), "Child: Aarav Sharma • Age 2", font=get_font(20, bold=True), fill="#0f172a", anchor="mm")
        draw.text((530, 460), "Center: Sunshine Montessori Daycare", font=get_font(16), fill="#475569", anchor="mm")

        # Big PIN Box
        draw.rounded_rectangle([330, 550, 730, 680], radius=16, fill="#0284c7")
        draw.text((530, 580), "SECRET PICKUP PIN", font=get_font(15, bold=True), fill="#e0f2fe", anchor="mm")
        draw.text((530, 630), "4  8  2  9", font=get_font(42, bold=True), fill="#ffffff", anchor="mm")
        draw.text((530, 750), "🔒 Show this PIN to caregiver at evening pickup", font=get_font(16, bold=True), fill="#0369a1", anchor="mm")

        # Right card: Daycare Verification Terminal
        draw.rounded_rectangle([990, 230, 1790, 840], radius=20, fill="#fdf4ff", outline="#c026d3", width=2)
        draw.text((1390, 280), "🏫 Daycare Handover Terminal", font=get_font(26, bold=True), fill="#a21caf", anchor="mm")
        
        draw.rounded_rectangle([1060, 340, 1720, 520], radius=16, fill="#ffffff", outline="#f5d0fe", width=1)
        draw.text((1390, 380), "CHILD RELEASE VERIFICATION", font=get_font(14, bold=True), fill="#c026d3", anchor="mm")
        draw.text((1390, 430), "Enter 4-Digit Parent Pass PIN:", font=get_font(20, bold=True), fill="#0f172a", anchor="mm")
        
        draw.rounded_rectangle([1230, 470, 1550, 530], radius=10, fill="#f8fafc", outline="#cbd5e1", width=1)
        draw.text((1390, 500), "[  4  8  2  9  ]", font=get_font(24, bold=True), fill="#0f172a", anchor="mm")

        # Success Match Badge
        draw.rounded_rectangle([1140, 610, 1640, 720], radius=16, fill="#22c55e")
        draw.text((1390, 650), "✓ PIN VERIFIED — IDENTITY MATCHED", font=get_font(18, bold=True), fill="#ffffff", anchor="mm")
        draw.text((1390, 685), "Authorized to Release Child", font=get_font(15), fill="#f0fdf4", anchor="mm")
        draw.text((1390, 770), "Zero-Knowledge Database Architecture", font=get_font(16, bold=True), fill="#a21caf", anchor="mm")

    elif stype == "portals_card":
        draw.rounded_rectangle([70, 180, 1850, 890], radius=24, fill="#ffffff", outline="#e2e8f0", width=2)

        # Left: Provider Portal
        draw.rounded_rectangle([120, 230, 930, 840], radius=20, fill="#f8fafc", outline="#cbd5e1", width=1)
        draw.text((160, 270), "📊 Daycare Provider Portal", font=get_font(26, bold=True), fill="#0f172a")
        draw.text((160, 310), "Full business control over slots, revenue, and daily rosters", font=get_font(16), fill="#64748b")
        
        p_items = [
            ("Monthly Revenue Analytics", "Real-time bar charts tracking hourly, daily, and monthly plans."),
            ("Booking Approval Desk", "One-click Accept/Reject with instant seat counter syncing."),
            ("Digital Pickup Validation Tool", "Verify parent PIN before releasing the child."),
            ("Center Profile & Photo Uploads", "Upload classroom & playground photos directly to storage."),
        ]
        for idx, (p_t, p_s) in enumerate(p_items):
            y = 370 + idx * 110
            draw.rounded_rectangle([150, y, 900, y + 90], radius=12, fill="#ffffff", outline="#e2e8f0", width=1)
            draw.text((170, y + 18), "• " + p_t, font=get_font(18, bold=True), fill="#0284c7")
            draw.text((170, y + 48), p_s, font=get_font(14), fill="#475569")

        # Right: Admin Governance Portal
        draw.rounded_rectangle([990, 230, 1800, 840], radius=20, fill="#f8fafc", outline="#cbd5e1", width=1)
        draw.text((1030, 270), "🛡️ Platform Administration", font=get_font(26, bold=True), fill="#0f172a")
        draw.text((1030, 310), "Operational integrity, background checks & legal compliance", font=get_font(16), fill="#64748b")
        
        a_items = [
            ("Center Approval Queue", "Inspect government registration & fire safety certificates."),
            ("Caregiver Verification", "Audit mandatory police verification & pediatric CPR certs."),
            ("Real-Time KPI Dashboard", "Track conversion rates, seat utilization %, and gross booking value."),
            ("Parent Grievance Desk", "Investigate disputes with private incident notes and resolutions."),
        ]
        for idx, (a_t, a_s) in enumerate(a_items):
            y = 370 + idx * 110
            draw.rounded_rectangle([1020, y, 1770, y + 90], radius=12, fill="#ffffff", outline="#e2e8f0", width=1)
            draw.text((1040, y + 18), "• " + a_t, font=get_font(18, bold=True), fill="#7c3aed")
            draw.text((1040, y + 48), a_s, font=get_font(14), fill="#475569")

    elif stype == "architecture_card":
        draw.rounded_rectangle([70, 180, 1850, 890], radius=24, fill="#ffffff", outline="#e2e8f0", width=2)
        
        # 3 Architecture Pillars
        layers = [
            ("⚡ Frontend Layer", "TanStack Start • React 19 • TypeScript • Tailwind CSS", [
                "Server-Side Rendering (SSR) for lightning-fast initial load",
                "Type-safe file-based routing and deep-linked search params",
                "Mobile-first responsive design with Left Sidebar desktop layout",
                "Accessible UI primitives with animated skeleton placeholders",
            ], "#0284c7"),
            ("🛡️ Backend Database Layer", "Supabase PostgreSQL • DB Triggers • RLS", [
                "guard_booking Trigger: Hard capacity lock across all booking dates",
                "Server-side price calculation — tamper-proof billing",
                "Row-Level Security (RLS) isolating parent and provider records",
                "Path-checked Supabase Storage policies for facility photos",
            ], "#10b981"),
            ("🚀 Deployment & Infrastructure", "Vercel Edge • Nitro Preset • Vitest Suite", [
                "Continuous Deployment from GitHub main branch",
                "India DPDP Act 2023 compliance architecture",
                "Vitest unit test suite covering auth, routing, and workflows",
                "Zero TypeScript errors with strict type enforcement",
            ], "#6366f1"),
        ]
        
        for idx, (l_title, l_tech, l_pts, l_col) in enumerate(layers):
            x = 110 + idx * 570
            draw.rounded_rectangle([x, 230, x + 540, 840], radius=18, fill="#f8fafc", outline=l_col, width=2)
            draw.rounded_rectangle([x, 230, x + 540, 310], radius=18, fill=l_col)
            draw.text((x + 20, 245), l_title, font=get_font(22, bold=True), fill="#ffffff")
            draw.text((x + 20, 275), l_tech, font=get_font(13), fill="#e0f2fe")
            
            for p_idx, pt in enumerate(l_pts):
                py = 340 + p_idx * 120
                draw.rounded_rectangle([x + 15, py, x + 525, py + 105], radius=12, fill="#ffffff", outline="#e2e8f0", width=1)
                draw.text((x + 30, py + 15), f"✓ {pt}", font=get_font(15, bold=True), fill="#0f172a")

    elif stype == "outro_card":
        draw.rounded_rectangle([70, 180, 1850, 890], radius=24, fill="#ffffff", outline="#e2e8f0", width=2)
        
        draw.text((960, 280), "Ready for Production", font=get_font(20, bold=True), fill="#0284c7", anchor="mm")
        draw.text((960, 350), "Little Steps — Trusted 24×7 Childcare", font=get_font(48, bold=True), fill="#0f172a", anchor="mm")
        
        draw.rounded_rectangle([360, 430, 1560, 560], radius=20, fill="#f0f9ff", outline="#bae6fd", width=2)
        draw.text((960, 470), "🌐 LIVE PRODUCTION WEBSITE", font=get_font(16, bold=True), fill="#0369a1", anchor="mm")
        draw.text((960, 515), "https://little-steps-blue.vercel.app", font=get_font(30, bold=True), fill="#0284c7", anchor="mm")

        draw.rounded_rectangle([360, 600, 1560, 730], radius=20, fill="#f8fafc", outline="#e2e8f0", width=2)
        draw.text((960, 640), "📦 OPEN SOURCE GITHUB REPOSITORY", font=get_font(16, bold=True), fill="#64748b", anchor="mm")
        draw.text((960, 685), "https://github.com/vineetkrsingh769/Little-Steps", font=get_font(26, bold=True), fill="#0f172a", anchor="mm")

        draw.text((960, 800), "Built with TanStack Start, React 19, Supabase & Tailwind CSS", font=get_font(20), fill="#64748b", anchor="mm")

    draw_subtitle_banner(draw, scene["narration"])
    slide_file = WORKSPACE / f"{scene['id']}.png"
    img.save(str(slide_file))
    print(f"Rendered {slide_file.name}")
    return slide_file

def assemble_video():
    print("\n=== Step 3: Rendering Scene Clips with FFmpeg ===")
    clip_list = WORKSPACE / "clips.txt"
    with open(clip_list, "w") as f_clips:
        for scene in SCENES:
            slide_png = WORKSPACE / f"{scene['id']}.png"
            audio_mp3 = WORKSPACE / f"{scene['id']}.mp3"
            clip_mp4 = WORKSPACE / f"{scene['id']}.mp4"

            duration = get_audio_duration(audio_mp3) + 0.8  # small buffer for smooth breath
            print(f"Encoding {scene['id']} ({duration:.1f}s)...")

            # Command to generate video clip with still image + audio
            cmd = [
                FFMPEG_EXE, "-y",
                "-loop", "1", "-i", str(slide_png),
                "-i", str(audio_mp3),
                "-c:v", "libx264", "-tune", "stillimage",
                "-c:a", "aac", "-b:a", "192k", "-pix_fmt", "yuv420p",
                "-t", str(duration),
                str(clip_mp4)
            ]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            f_clips.write(f"file '{clip_mp4.resolve().as_posix()}'\n")

    print("\n=== Step 4: Concatenating Final Video ===")
    final_cmd = [
        FFMPEG_EXE, "-y",
        "-f", "concat", "-safe", "0",
        "-i", str(clip_list.resolve()),
        "-c", "copy",
        str(OUTPUT_MP4.resolve())
    ]
    subprocess.run(final_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(f"\nSuccessfully created: {OUTPUT_MP4.resolve()}")

async def run_audio():
    await generate_audio()

def main():
    capture_screenshots()
    asyncio.run(run_audio())
    for scene in SCENES:
        render_slide(scene)
    assemble_video()

if __name__ == "__main__":
    main()
