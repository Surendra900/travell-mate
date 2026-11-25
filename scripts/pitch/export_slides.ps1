$pptxPath = (Resolve-Path "outputs\TravelMate_BuildX_2026.pptx").Path
$outputDir = Join-Path (Get-Location).Path "outputs\rendered_slides"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$ppt = New-Object -ComObject PowerPoint.Application
try {
    $presentation = $ppt.Presentations.Open($pptxPath, 2, 0, 0)
    $slideCount = $presentation.Slides.Count
    Write-Host "Total slides in presentation: $slideCount"
    for ($i = 1; $i -le $slideCount; $i++) {
        $slide = $presentation.Slides.Item($i)
        $slidePath = Join-Path $outputDir "slide_$i.png"
        $slide.Export($slidePath, "PNG", 1920, 1080)
        Write-Host "Exported slide $i to $slidePath"
    }
    $presentation.Close()
} catch {
    Write-Error $_
} finally {
    $ppt.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
    [System.GC]::Collect()
}
