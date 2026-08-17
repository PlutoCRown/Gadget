var D = window.D || {};

/* ---------- 渲染 ---------- */
D.renderAll=function(){
  document.querySelectorAll('.icon').forEach(function(el){el.remove()});
  D.icons.forEach(function(ic){document.body.appendChild(D.createIconEl(ic))});
  D.toggleHint();D.updateGridLabel();
};

D.toggleHint=function(){document.getElementById('hint').style.opacity=D.icons.length?'0':'1'};

D.updateGridLabel=function(){
  var el=document.querySelector('#snapToggle .shortcut');
  if(el)el.textContent=D.snapEnabled?'开':'关';
};

D.updateIconEl=function(el,ic){
  el.classList.toggle('layout-horizontal',ic.layout==='horizontal');
  el.classList.toggle('layout-vertical',ic.layout!=='horizontal');
  el.querySelector('.label').textContent=ic.title||D.hostname(ic.url);
  el.style.left=D.snap(ic.x)+'px';el.style.top=D.snap(ic.y)+'px';
  var fav=el.querySelector('.favicon');
  fav.innerHTML='';
  var type=ic.iconType||'favicon';
  var token=++el._token;
  if(type==='text'){
    var fb=document.createElement('div');fb.className='fallback';
    fb.style.background=ic.iconColor||'#4285F4';
    fb.textContent=ic.iconText||D.letterOf(ic.title||D.hostname(ic.url));
    fav.appendChild(fb);
  }else if(type==='image'&&ic.iconImageKey){
    D.idbGet(ic.iconImageKey).then(function(base64){
      if(el._token!==token)return;
      if(base64){
        var img=document.createElement('img');img.src=base64;img.alt='';fav.appendChild(img);
      }else{
        var fb=document.createElement('div');fb.className='fallback';fb.textContent=D.letterOf(ic.title||D.hostname(ic.url));fav.appendChild(fb);
      }
    });
  }else{
    if(ic.iconUrl){
      var img=document.createElement('img');img.src=ic.iconUrl;img.alt='';
      img.onerror=function(){fav.innerHTML='';var fb=document.createElement('div');fb.className='fallback';fb.textContent=D.letterOf(ic.title||D.hostname(ic.url));fav.appendChild(fb)};
      fav.appendChild(img);
    }else{
      var fb0=document.createElement('div');fb0.className='fallback';fb0.textContent=D.letterOf(ic.title||D.hostname(ic.url));fav.appendChild(fb0);
      D.defaultFavicon(ic.url).then(function(iconUrl){
        if(el._token!==token||!iconUrl)return;
        var img=document.createElement('img');img.src=iconUrl;img.alt='';
        img.onerror=function(){};
        fav.innerHTML='';fav.appendChild(img);
      });
    }
  }
};

D.createIconEl=function(ic){
  var el=document.createElement('div');
  el.className='icon';el.dataset.id=ic.id;el._token=0;
  el.style.left=D.snap(ic.x)+'px';el.style.top=D.snap(ic.y)+'px';
  var fav=document.createElement('div');fav.className='favicon';el.appendChild(fav);
  var label=document.createElement('div');label.className='label';el.appendChild(label);
  D.updateIconEl(el,ic);

  var moved;
  el.addEventListener('mousedown',function(e){
    if(e.button!==0)return;moved=false;
    if(D.selecting)return;
    e.stopPropagation();
    if(!ic.selected){
      if(!e.shiftKey)D.clearSelection();
      ic.selected=true;el.classList.add('selected');
    }else if(e.shiftKey){ic.selected=false;el.classList.remove('selected')}
  });
  el.addEventListener('click',function(e){
    if(moved)return;if(e.shiftKey)return;
    var sel=D.selectedIcons();
    if(sel.length===1&&sel[0].id===ic.id)window.open(ic.url,'_blank');
  });
  el.addEventListener('contextmenu',function(e){
    e.preventDefault();e.stopPropagation();
    if(!ic.selected){D.clearSelection();ic.selected=true;el.classList.add('selected')}
    var sel=D.selectedIcons();
    if(sel.length>1){D.showMenu('multiMenu',e.clientX,e.clientY);document.getElementById('multiCount').textContent=sel.length+' 个'}
    else D.openSettings(ic.id);
  });
  D.enableDrag(el,ic,function(){moved=true});
  return el;
};
