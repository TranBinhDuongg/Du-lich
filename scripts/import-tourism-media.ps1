Add-Type -AssemblyName System.IO.Compression.FileSystem
$docs = Get-Content -Raw (Join-Path $PSScriptRoot '../assets/data/tourism-sources.json') | ConvertFrom-Json
$out = Join-Path $PSScriptRoot '../assets/images/source'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$result = @()
for ($i=0; $i -lt $docs.Count; $i++) {
  $folder = if ($i -eq 7) { 'D:/' } else { 'C:/Users/nlhel.PERUSI/Downloads/' }
  $zip = [IO.Compression.ZipFile]::OpenRead((Join-Path $folder $docs[$i].name))
  try {
    $media = @($zip.Entries | Where-Object { $_.FullName -match '^word/media/.*\.(png|jpe?g|webp)$' })
    foreach ($entry in $media) {
      $name = 'doc-' + $i + '-' + [IO.Path]::GetFileName($entry.FullName)
      [IO.Compression.ZipFileExtensions]::ExtractToFile($entry,(Join-Path $out $name),$true)
      $result += @{sourceFile=$docs[$i].name;document=$i;path=('assets/images/source/'+$name);bytes=$entry.Length}
    }
    Write-Output ($i.ToString() + ': '+$media.Count+' images')
  } finally { $zip.Dispose() }
}
$result | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 (Join-Path $PSScriptRoot '../assets/data/tourism-media.json')
