# Erstellt die App-Icons (assets/icon.ico, assets/icon-*.png) und eine Desktop-Verknüpfung zur App.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$ico  = Join-Path $root 'assets\icon.ico'
$html = Join-Path $root 'index.html'

function New-IconPng([int]$s, [switch]$Full) {
  $bmp = New-Object System.Drawing.Bitmap $s, $s
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::Transparent)
  $r = [int]($s * 0.22)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc(0, 0, $r, $r, 180, 90); $path.AddArc($s - $r - 1, 0, $r, $r, 270, 90)
  $path.AddArc($s - $r - 1, $s - $r - 1, $r, $r, 0, 90); $path.AddArc(0, $s - $r - 1, $r, $r, 90, 90)
  $path.CloseFigure()
  if ($Full) { $path = New-Object System.Drawing.Drawing2D.GraphicsPath; $path.AddRectangle((New-Object System.Drawing.Rectangle 0, 0, $s, $s)) }
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Point 0, 0), (New-Object System.Drawing.Point $s, $s), ([System.Drawing.Color]::FromArgb(45, 212, 191)), ([System.Drawing.Color]::FromArgb(129, 140, 248))
  $g.FillPath($brush, $path)
  $dark = [System.Drawing.Color]::FromArgb(11, 16, 32)
  $pen = New-Object System.Drawing.Pen $dark, ([float]($s * 0.05))
  $f = $s / 64.0
  $pts = @(@(32, 18), @(15, 45), @(49, 45))
  $g.DrawLine($pen, [float](32 * $f), [float](18 * $f), [float](15 * $f), [float](45 * $f))
  $g.DrawLine($pen, [float](32 * $f), [float](18 * $f), [float](49 * $f), [float](45 * $f))
  $g.DrawLine($pen, [float](15 * $f), [float](45 * $f), [float](49 * $f), [float](45 * $f))
  foreach ($p in $pts) {
    $g.FillEllipse((New-Object System.Drawing.SolidBrush $dark), [float](($p[0] - 7) * $f), [float](($p[1] - 7) * $f), [float](14 * $f), [float](14 * $f))
    $g.FillEllipse([System.Drawing.Brushes]::White, [float](($p[0] - 3) * $f), [float](($p[1] - 3) * $f), [float](6 * $f), [float](6 * $f))
  }
  $g.Dispose()
  $ms = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  return ,$ms.ToArray()
}

# ICO mit mehreren PNG-Größen schreiben
$sizes = 16, 32, 48, 256
$images = foreach ($s in $sizes) { ,(New-IconPng $s) }
$fs = [System.IO.File]::Create($ico)
$bw = New-Object System.IO.BinaryWriter $fs
$bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]$sizes.Count)
$offset = 6 + 16 * $sizes.Count
for ($i = 0; $i -lt $sizes.Count; $i++) {
  $s = $sizes[$i]; $len = $images[$i].Length
  $bw.Write([byte]($(if ($s -ge 256) { 0 } else { $s }))); $bw.Write([byte]($(if ($s -ge 256) { 0 } else { $s })))
  $bw.Write([byte]0); $bw.Write([byte]0); $bw.Write([UInt16]1); $bw.Write([UInt16]32)
  $bw.Write([UInt32]$len); $bw.Write([UInt32]$offset)
  $offset += $len
}
foreach ($img in $images) { $bw.Write($img) }
$bw.Close()

# Vollflächige PNGs für iPhone/PWA (iOS rundet die Ecken selbst)
foreach ($s in 180, 192, 512) { [IO.File]::WriteAllBytes((Join-Path $root "assets\icon-$s.png"), (New-IconPng $s -Full)) }

# Verknüpfung auf dem Desktop
$desktop = [Environment]::GetFolderPath('Desktop')
$lnk = Join-Path $desktop 'Netzwerktechnik-Trainer.lnk'
$sh = New-Object -ComObject WScript.Shell
$sc = $sh.CreateShortcut($lnk)
$sc.TargetPath = $html
$sc.WorkingDirectory = $root
$sc.IconLocation = "$ico,0"
$sc.Description = 'Netzwerktechnik lernen – IPv6, DHCP, APIPA, DNS'
$sc.Save()
Write-Output "Icon:        $ico"
Write-Output "Verknüpfung: $lnk"
