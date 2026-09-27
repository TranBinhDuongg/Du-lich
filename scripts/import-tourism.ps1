Add-Type -AssemblyName System.IO.Compression.FileSystem
$paths = @('C:/Users/nlhel.PERUSI/Downloads/An Giang-Cần Thơ-Hậu Giang.docx','C:/Users/nlhel.PERUSI/Downloads/CÁC TUYẾN BẾN TRE,LONGAN,TIỀN GIANG.docx','C:/Users/nlhel.PERUSI/Downloads/Hành trình Bạc Liêu (2N1Đ).docx','C:/Users/nlhel.PERUSI/Downloads/Hành trình liên tỉnh Bến Tre-Trà Vinh-Vĩnh Long-Đồng Tháp(4n3d).docx','C:/Users/nlhel.PERUSI/Downloads/Hành trình Sóc Trăng (2N1Đ).docx','C:/Users/nlhel.PERUSI/Downloads/HỒ CHÍ MINH.docx','C:/Users/nlhel.PERUSI/Downloads/Kiên Giang-An Giang.docx','D:/lịch trình chi tiết.docx')
$docs = @()
foreach ($path in $paths) {
  $zip = [IO.Compression.ZipFile]::OpenRead($path)
  try {
    $reader = [IO.StreamReader]::new($zip.GetEntry('word/document.xml').Open())
    [xml]$xml = $reader.ReadToEnd()
    $reader.Dispose()
    $ns = [Xml.XmlNamespaceManager]::new($xml.NameTable)
    $ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
    $paragraphs = @()
    foreach ($p in $xml.SelectNodes('//w:body//w:p',$ns)) {
      $value = ($p.SelectNodes('.//w:t',$ns) | ForEach-Object { $_.InnerText }) -join ''
      if ($value.Trim()) { $paragraphs += $value.Trim() }
    }
    $docs += @{name=[IO.Path]::GetFileName($path); paragraphs=$paragraphs}
  } finally { $zip.Dispose() }
}
$out = Join-Path $PSScriptRoot '../assets/data'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$docs | ConvertTo-Json -Depth 20 | Set-Content -Encoding utf8 (Join-Path $out 'tourism-sources.json')
$docs | ForEach-Object { Write-Output ($_.name + ': ' + $_.paragraphs.Count + ' paragraphs') }
