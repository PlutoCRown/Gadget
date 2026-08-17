var D = window.D || {};

/* ---------- 右键菜单 ---------- */
D.menus={
  multiMenu:document.getElementById('multiMenu'),
  deskMenu:document.getElementById('deskMenu')
};
D.menuTargetId=null;

D.showMenu=function(name,x,y,id){
  D.hideMenus();D.menuTargetId=id||null;
  var m=D.menus[name];m.classList.add('show');
  m.style.left=Math.min(x,window.innerWidth-m.offsetWidth-4)+'px';
  m.style.top=Math.min(y,window.innerHeight-m.offsetHeight-4)+'px';
};

D.hideMenus=function(){
  Object.keys(D.menus).forEach(function(k){D.menus[k].classList.remove('show')});
  D.menuTargetId=null;
};

/* 多选菜单 */
document.getElementById('multiMenu').addEventListener('click',function(e){
  var item=e.target.closest('.item');if(!item)return;
  var act=item.dataset.action;D.hideMenus();
  var sel=D.selectedIcons();if(!sel.length)return;
  if(act==='open-all')sel.forEach(function(ic){window.open(ic.url,'_blank')});
  else if(act==='delete-all')D.showConfirm('批量删除','确定要删除选中的 '+sel.length+' 个图标吗？',function(){D.removeIcons(sel.map(function(i){return i.id}))});
});

/* 桌面菜单 */
document.getElementById('deskMenu').addEventListener('click',function(e){
  var item=e.target.closest('.item');if(!item)return;
  var act=item.dataset.action;D.hideMenus();
  if(act==='create-text')D.addText(D.mouseX,D.mouseY);
  else if(act==='snap-toggle'){D.snapEnabled=!D.snapEnabled;D.saveSnap();D.updateGridLabel();D.resnapAll()}
  else if(act==='save'){D.saveIcons();D.saveGrid();D.saveSnap();D.saveDefaultLayout();D.saveTexts();D.saveCustomCSS(D.loadCustomCSS());toast('已保存')}
  else if(act==='settings-page')D.openPrefs();
});

document.addEventListener('click',function(e){if(!e.target.closest('.ctx-menu'))D.hideMenus()});

/* ---------- 删除确认 ---------- */
var confirmMask=document.getElementById('confirmMask');
var confirmAction=null;

D.showConfirm=function(title,text,action){
  document.getElementById('confirmTitle').textContent=title;
  document.getElementById('confirmText').textContent=text;
  confirmAction=action;confirmMask.classList.add('show');
};

document.getElementById('confirmCancel').addEventListener('click',function(){confirmMask.classList.remove('show');confirmAction=null});
confirmMask.addEventListener('click',function(e){if(e.target===confirmMask){confirmMask.classList.remove('show');confirmAction=null}});
document.getElementById('confirmOk').addEventListener('click',function(){confirmMask.classList.remove('show');if(confirmAction){confirmAction();confirmAction=null}});

/* ---------- Toast ---------- */
var toastTimer=null;
function toast(msg){
  var el=document.getElementById('toast');
  if(!el){
    el=document.createElement('div');el.id='toast';
    el.style.cssText='position:fixed;bottom:48px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.8);color:#fff;padding:8px 20px;border-radius:8px;font-size:13px;z-index:99999;pointer-events:none;opacity:0;transition:opacity .2s';
    document.body.appendChild(el);
  }
  el.textContent=msg;
  el.style.opacity='1';
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){el.style.opacity='0'},1500);
}

/* ---------- 桌面设置弹窗 ---------- */
var prefsMask=document.getElementById('prefsMask');

function syncDefaultLayoutTabs(){
  document.querySelectorAll('#defaultLayoutTabs .tab').forEach(function(tab){
    tab.classList.toggle('active',tab.querySelector('input').checked);
  });
}

D.openPrefs=function(){
  document.getElementById('gridInput').value=D.grid;
  var r=document.querySelector('input[name=defaultLayout][value="'+D.defaultLayout+'"]');
  if(r)r.checked=true;
  syncDefaultLayoutTabs();
  document.getElementById('layoutApplyAll').checked=false;
  document.getElementById('cssInput').value=D.loadCustomCSS();
  prefsMask.classList.add('show');
};

D.closePrefs=function(){prefsMask.classList.remove('show')};

document.getElementById('prefsClose').addEventListener('click',D.closePrefs);
prefsMask.addEventListener('click',function(e){if(e.target===prefsMask)D.closePrefs()});

document.querySelectorAll('input[name=defaultLayout]').forEach(function(r){
  r.addEventListener('change',syncDefaultLayoutTabs);
});

document.getElementById('gridSave').addEventListener('click',function(){
  var v=parseInt(document.getElementById('gridInput').value);
  if(isNaN(v)||v<1)v=1;if(v>200)v=200;
  document.getElementById('gridInput').value=v;
  D.grid=v;D.saveGrid();
  if(D.snapEnabled)D.resnapAll();
  toast('网格已保存为 '+v+'px');
});

document.getElementById('layoutSave').addEventListener('click',function(){
  var r=document.querySelector('input[name=defaultLayout]:checked');
  var val=r?r.value:'vertical';
  D.defaultLayout=val;D.saveDefaultLayout();
  if(document.getElementById('layoutApplyAll').checked){
    D.icons.forEach(function(ic){
      ic.layout=val;
      var el=document.querySelector('.icon[data-id="'+ic.id+'"]');
      if(el)D.updateIconEl(el,ic);
    });
    D.saveIcons();
  }
  toast('布局已保存');
});

document.getElementById('cssSave').addEventListener('click',function(){
  D.saveCustomCSS(document.getElementById('cssInput').value);
  D.applyCustomCSS();
  toast('CSS 已保存');
});

document.getElementById('exportBtn').addEventListener('click',function(){D.exportConfig()});

document.getElementById('importBtn').addEventListener('click',function(){
  document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change',async function(e){
  var file=e.target.files[0];if(!file)return;
  try{
    var text=await file.text();
    var data=JSON.parse(text);
    if(!data.icons){toast('无效的配置文件');return}
    localStorage.setItem('desktop_icons_v2',JSON.stringify(data.icons));
    if(data.grid){localStorage.setItem('desktop_grid',String(data.grid));D.grid=parseInt(data.grid)||D.grid}
    if(data.defaultLayout){localStorage.setItem('desktop_default_layout',data.defaultLayout);D.defaultLayout=data.defaultLayout}
    if(typeof data.snapEnabled==='boolean'){D.snapEnabled=data.snapEnabled;D.saveSnap();D.updateGridLabel()}
    if(data.images){
      var keys=Object.keys(data.images);
      for(var i=0;i<keys.length;i++)await D.idbPut(keys[i],data.images[keys[i]]);
    }
    D.load();
    document.querySelectorAll('.icon').forEach(function(el){el.remove()});
    D.renderAll();
    D.closePrefs();
    toast('导入成功！共 '+data.icons.length+' 个图标');
  }catch(err){
    toast('导入失败：'+err.message);
  }
  e.target.value='';
});

document.getElementById('clearCacheBtn').addEventListener('click',async function(){
  if(!confirm('将清除 Service Worker 缓存并刷新页面，确定吗？'))return;
  if('caches' in window){
    var keys=await caches.keys();
    await Promise.all(keys.map(function(k){return caches.delete(k)}));
  }
  location.reload();
});

/* 导出给 init.js 使用 */
D._confirmMask=confirmMask;
D._prefsMask=prefsMask;
