var D = window.D || {};

/* ---------- 图标设置弹窗 ---------- */
var mask=document.getElementById('settingsMask');
var sName=document.getElementById('settingsName'),sUrl=document.getElementById('settingsUrl');
var sPrev=document.getElementById('iconPreview'),sHint=document.getElementById('iconPreviewHint');
var sText=document.getElementById('iconText'),sColor=document.getElementById('iconColor');
var sFile=document.getElementById('iconFile');
var settingsId=null,pendingImage=null,pendingIconUrl=null;
var currentColor='linear-gradient(135deg,#5a9fd4,#4285F4)';

var PRESETS=[
  'linear-gradient(135deg,#5a9fd4,#4285F4)',
  'linear-gradient(135deg,#34d399,#10b981)',
  'linear-gradient(135deg,#a78bfa,#7c3aed)',
  'linear-gradient(135deg,#fbbf24,#f59e0b)',
  'linear-gradient(135deg,#f472b6,#ec4899)',
  'linear-gradient(135deg,#f87171,#ef4444)'
];

function isHttpUrl(s){return /^https?:\/\//i.test((s||'').trim())}

function customIconUrl(){
  var t=sText.value.trim();
  return pendingIconUrl||(isHttpUrl(t)?t:'');
}

/* 当前类型：text 优先 > image > 自定义图标链接 / 自动 favicon */
function currentType(){
  var t=sText.value.trim();
  if(t&&!isHttpUrl(t))return 'text';
  if(pendingImage)return 'image';
  return 'favicon';
}

function renderPreview(){
  sPrev.innerHTML='';
  var type=currentType();
  var label=D.letterOf(sName.value.trim()||D.hostname(sUrl.value.trim()));
  if(type==='text'){
    var fb=document.createElement('div');fb.className='fallback';
    fb.style.background=currentColor;
    fb.textContent=sText.value.trim()||label;
    sPrev.appendChild(fb);
    sHint.textContent='点击上传图片';
  }else if(type==='image'){
    var img=document.createElement('img');img.src=pendingImage;img.alt='';sPrev.appendChild(img);
    sHint.textContent='点击更换';
  }else{
    var iconUrl=customIconUrl();
    if(iconUrl){
      renderFaviconPreview(iconUrl);
      return;
    }
    var fb2=document.createElement('div');fb2.className='fallback';fb2.textContent=label;sPrev.appendChild(fb2);
    sHint.textContent='点击上传图片';
    D.defaultFavicon(sUrl.value.trim()).then(function(url){
      if(currentType()!=='favicon'||customIconUrl()||!url)return;
      sPrev.innerHTML='';
      var img2=document.createElement('img');img2.src=url;img2.alt='';
      img2.onerror=function(){sPrev.innerHTML='';var fb3=document.createElement('div');fb3.className='fallback';fb3.textContent=label;sPrev.appendChild(fb3)};
      sPrev.appendChild(img2);
    });
  }
}

/* 色盘选中状态 */
function syncSwatchActive(){
  document.querySelectorAll('#colorSwatches .swatch[data-color]').forEach(function(s){
    s.classList.toggle('active',s.dataset.color===currentColor);
  });
  var isPreset=PRESETS.indexOf(currentColor)>=0;
  document.querySelector('#colorSwatches .swatch-custom').classList.toggle('active',!isPreset);
}

/* hex → hsl，返回 {h,s,l} 0-1 */
function hexToHsl(hex){
  var r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
  var max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
  var h=0,s=0,l=(max+min)/2;
  if(d){s=l>.5?d/(2-max-min):d/(max+min);
    if(max===r)h=((g-b)/d+(g<b?6:0));else if(max===g)h=((b-r)/d+2);else h=((r-g)/d+4);
    h/=6;
  }
  return{h:h,s:s,l:l};
}
function hslStr(h,s,l){return 'hsl('+Math.round(h*360)+','+Math.round(s*100)+'%,'+Math.round(l*100)+'%)'}

/* 单色 → 带hue偏移的渐变 */
function hexToGradient(hex,shift){
  shift=shift||0.04;
  var c=hexToHsl(hex);
  var h1=(c.h+shift+1)%1,h2=(c.h-shift+1)%1;
  return 'linear-gradient(135deg,'+hslStr(h1,c.s,c.l)+','+hslStr(h2,c.s,c.l)+')';
}

document.querySelectorAll('#colorSwatches .swatch[data-color]').forEach(function(s){
  s.addEventListener('click',function(){currentColor=s.dataset.color;syncSwatchActive();renderPreview()});
});
sColor.addEventListener('input',function(){currentColor=hexToGradient(sColor.value);syncSwatchActive();renderPreview()});

/* 输入联动 */
sText.addEventListener('input',function(){
  var t=sText.value.trim();
  if(isHttpUrl(t)){pendingIconUrl=t;pendingImage=null}
  else pendingIconUrl=null;
  renderPreview();
});
sName.addEventListener('input',renderPreview);
sUrl.addEventListener('input',function(){
  if(!customIconUrl())renderPreview();
});

/* 粘贴链接 → 当作图标 URL，保留在输入框中便于再次查看/编辑 */
sText.addEventListener('paste',function(e){
  var text=(e.clipboardData||window.clipboardData).getData('text').trim();
  if(isHttpUrl(text)){
    e.preventDefault();
    sText.value=text;
    pendingIconUrl=text;
    pendingImage=null;
    renderFaviconPreview(text);
  }
});

function renderFaviconPreview(iconUrl){
  var label=D.letterOf(sName.value.trim()||D.hostname(sUrl.value.trim()));
  sPrev.innerHTML='';
  var fb=document.createElement('div');fb.className='fallback';fb.textContent=label;sPrev.appendChild(fb);
  sHint.textContent='点击更换';
  var img=document.createElement('img');img.src=iconUrl;img.alt='';
  img.onload=function(){sPrev.innerHTML='';sPrev.appendChild(img)};
  img.onerror=function(){};
}

/* 点击预览 → 上传图片 */
sPrev.addEventListener('click',function(){sFile.click()});

sFile.addEventListener('change',async function(e){
  var file=e.target.files[0];if(!file)return;
  try{
    pendingImage=await D.cropImageToBase64(file,96);
    pendingIconUrl=null;
    if(isHttpUrl(sText.value))sText.value='';
    renderPreview();
  }catch(err){}
  sFile.value='';
});

D.openSettings=function(id){
  var ic=D.findIcon(id);if(!ic)return;
  settingsId=id;pendingImage=null;pendingIconUrl=null;
  sName.value=ic.title||'';sUrl.value=ic.url||'';
  sText.value=ic.iconText||'';
  currentColor=ic.iconColor||'linear-gradient(135deg,#5a9fd4,#4285F4)';
  sColor.value=currentColor.startsWith('#')?currentColor:'#4285F4';
  syncSwatchActive();
  var layout=ic.layout||'vertical';
  var lr=document.querySelector('input[name=iconLayout][value="'+layout+'"]');
  if(lr)lr.checked=true;
  D.updateLayoutTabs(layout);
  if(ic.iconType==='image'&&ic.iconImageKey){
    D.idbGet(ic.iconImageKey).then(function(b64){pendingImage=b64;renderPreview()});
  }else if(ic.iconUrl){
    pendingIconUrl=ic.iconUrl;
    sText.value=ic.iconUrl;
    renderFaviconPreview(ic.iconUrl);
  }else{
    renderPreview();
  }
  mask.classList.add('show');
  setTimeout(function(){sName.focus();sName.select()},50);
};

document.getElementById('settingsCancel').addEventListener('click',function(){mask.classList.remove('show');settingsId=null;pendingImage=null;pendingIconUrl=null});
mask.addEventListener('click',function(e){if(e.target===mask){mask.classList.remove('show');settingsId=null;pendingImage=null;pendingIconUrl=null}});

document.getElementById('settingsDelete').addEventListener('click',function(){
  if(!settingsId)return;
  var ic=D.findIcon(settingsId);if(!ic)return;
  var id=settingsId;
  mask.classList.remove('show');settingsId=null;pendingImage=null;pendingIconUrl=null;
  D.showConfirm('删除图标','确定要删除「'+(ic.title||D.hostname(ic.url))+'」吗？',function(){D.removeIcon(id)});
});

document.getElementById('settingsSave').addEventListener('click',async function(){
  if(!settingsId)return;
  var ic=D.findIcon(settingsId);if(!ic)return;
  var url=sUrl.value.trim();if(!url)return;
  ic.title=sName.value.trim()||D.hostname(url);ic.url=url;
  var type=currentType();ic.iconType=type;
  if(type==='text'){
    ic.iconText=sText.value.trim();ic.iconColor=currentColor;
    ic.iconUrl='';ic.iconImageKey='';
  }else if(type==='image'){
    if(pendingImage){
      var key='img_'+Date.now()+'_'+(++D.idc);
      await D.idbPut(key,pendingImage);
      if(ic.iconImageKey)D.idbDelete(ic.iconImageKey);
      ic.iconImageKey=key;
    }
    ic.iconUrl='';ic.iconText='';ic.iconColor='';
  }else{
    ic.iconUrl=customIconUrl();
    ic.iconText='';ic.iconColor='';ic.iconImageKey='';
  }
  var lr=document.querySelector('input[name=iconLayout]:checked');
  ic.layout=lr?lr.value:'vertical';
  D.saveIcons();
  var el=document.querySelector('.icon[data-id="'+ic.id+'"]');if(el)D.updateIconEl(el,ic);
  mask.classList.remove('show');settingsId=null;pendingImage=null;pendingIconUrl=null;
});

/* 布局 tabs */
D.updateLayoutTabs=function(layout){
  document.querySelectorAll('.layout-tabs .tab').forEach(function(tab){
    tab.classList.toggle('active',tab.querySelector('input').value===layout);
  });
};
document.querySelectorAll('input[name=iconLayout]').forEach(function(r){
  r.addEventListener('change',function(){D.updateLayoutTabs(this.value)});
});

/* 导出给 init.js */
D._mask=mask;
