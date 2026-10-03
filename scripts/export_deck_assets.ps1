$pptxPath = "C:\Users\SURENDRA.G\Downloads\TravelMate_pitch_v2.pptx"
$pdfPath = "C:\Users\SURENDRA.G\Downloads\TravelMate_pitch_v2.pdf"
$slidesDir = "C:\Users\SURENDRA.G\.gemini\antigravity\brain\e26689ab-38ae-4aa7-8cd7-6b8dae31b7f8\pitch_slides"

if (!(Test-Path $slidesDir)) {
    New-Item -ItemType Directory -Path $slidesDir -Force | Out-Null
}

Write-Host "Opening PowerPoint COM..."
$ppt = New-Object -ComObject PowerPoint.Application
try {
    Write-Host "Opening presentation: $pptxPath"
    $pres = $ppt.Presentations.Open($pptxPath, [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
    
    Write-Host "Exporting PDF to: $pdfPath"
    # 32 = ppSaveAsPDF
    $pres.SaveAs($pdfPath, 32)
    Write-Host "PDF export successful!"

    Write-Host "Exporting slides as PNGs to: $slidesDir"
    $count = $pres.Slides.Count
    for ($i = 1; $i -le $count; $i++) {
        $slide = $pres.Slides.Item($i)
        $outImg = Join-Path $slidesDir ("slide_{0:D2}.png" -f $i)
        $slide.Export($outImg, "PNG", 1920, 1080)
        Write-Host "Exported: slide_{0:D2}.png" -f $i
    }
    
    $pres.Close()
    Write-Host "All slides exported successfully!"
} catch {
    Write-Host "Error during export: $($_.Exception.Message)"
} finally {
    $ppt.Quit()
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
