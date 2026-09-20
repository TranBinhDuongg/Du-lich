(function(root){
  'use strict';
  const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
  const inline = text => escape(text).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  function render(text){
    const lines=String(text).split('\n'), output=[];
    for(let i=0;i<lines.length;i++){
      const line=lines[i].trim();
      if(!line)continue;
      if(line.startsWith('|') && /^\|[\s:|\-]+\|$/.test((lines[i+1]||'').trim())){
        const cells=row=>row.trim().slice(1,-1).split('|').map(c=>c.trim());
        const headers=cells(line),rows=[];i+=2;
        while(i<lines.length && lines[i].trim().startsWith('|')){rows.push('<tr>'+cells(lines[i]).map(c=>'<td>'+inline(c)+'</td>').join('')+'</tr>');i++;}i--;
        output.push('<div class="chat-table-wrap" tabindex="0" role="region" aria-label="Bảng so sánh điểm đến"><table><thead><tr>'+headers.map(c=>'<th scope="col">'+inline(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>');
      }else if(/^[•\-]\s/.test(line)){
        const items=[];while(i<lines.length && /^[•\-]\s/.test(lines[i].trim())){items.push('<li>'+inline(lines[i].trim().replace(/^[•\-]\s/,''))+'</li>');i++;}i--;
        output.push('<ul>'+items.join('')+'</ul>');
      }else output.push('<p>'+inline(line)+'</p>');
    }
    return output.join('');
  }
  root.TripMateChatFormat={render};
  if(typeof module!=='undefined' && module.exports)module.exports={render};
})(typeof window!=='undefined'?window:globalThis);
