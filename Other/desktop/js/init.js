var D = window.D || {};

/* ---------- 鼠标位置 ---------- */
D.mouseX=window.innerWidth/2;D.mouseY=window.innerHeight/2;
document.addEventListener('mousemove',function(e){D.mouseX=e.clientX;D.mouseY=e.clientY});

/* ---------- 键盘快捷键 ---------- */
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    if(D._mask.classList.contains('show')){D._mask.classList.remove('show')}
    if(D._prefsMask&&D._prefsMask.classList.contains('show'))D.closePrefs();
    if(D._confirmMask.classList.contains('show'))D._confirmMask.classList.remove('show');
    D.hideMenus();D.clearSelection();
  }
  if((e.key==='Delete'||e.key==='Backspace')&&!D._mask.classList.contains('show')&&!D._confirmMask.classList.contains('show')&&!(D._prefsMask&&D._prefsMask.classList.contains('show'))){
    if(document.activeElement&&document.activeElement.isContentEditable)return;
    var sel=D.selectedIcons();if(sel.length){
      e.preventDefault();
      D.showConfirm('删除图标','确定要删除选中的 '+sel.length+' 个图标吗？',function(){D.removeIcons(sel.map(function(i){return i.id}))});
    }
  }
});

/* ---------- 桌面右键 ---------- */
document.addEventListener('contextmenu',function(e){
  if(e.target.closest('.icon')||e.target.closest('.text-note')||e.target.closest('.modal-mask')||e.target.closest('.ctx-menu'))return;
  e.preventDefault();D.showMenu('deskMenu',e.clientX,e.clientY);
});

/* ---------- 拖放链接 ---------- */
document.addEventListener('dragover',function(e){e.preventDefault();document.body.classList.add('drag-over')});
document.addEventListener('dragleave',function(e){
  if(e.clientX<=0||e.clientY<=0||e.clientX>=window.innerWidth||e.clientY>=window.innerHeight)
    document.body.classList.remove('drag-over');
});
document.addEventListener('drop',function(e){
  e.preventDefault();document.body.classList.remove('drag-over');
  var url=e.dataTransfer.getData('text/uri-list')||e.dataTransfer.getData('text/plain');
  var title=e.dataTransfer.getData('text');if(!url)return;
  try{new URL(url)}catch(e2){return}
  if(url===title)title='';
  D.addIcon(url,title,e.clientX,e.clientY);
});

/* ---------- 粘贴链接 ---------- */
document.addEventListener('paste',function(e){
  if(e.target.closest('.modal-mask')||e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.isContentEditable)return;
  var text=(e.clipboardData||window.clipboardData).getData('text');
  if(!text)return;
  var url=text.trim();
  try{new URL(url)}catch(e2){return}
  e.preventDefault();
  D.addIcon(url,'',D.mouseX,D.mouseY,'horizontal');
});

/* ---------- 初始化 ---------- */
document.body.classList.add('desktop-root');
D.applyCustomCSS();
D.idbOpen().then(function(){D.load();D.renderAll();D.loadTexts();D.renderAllTexts()});

/* ---------- Service Worker ---------- */
if('serviceWorker' in navigator){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('./sw.js').catch(function(){});
  });
}
