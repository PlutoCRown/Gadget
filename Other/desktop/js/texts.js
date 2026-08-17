var D = window.D || {};

var TEXT_KEY='desktop_texts';
var DEFAULT_TEXT_COLOR='#cccccc';
var DEFAULT_TEXT_SIZE=28;
var DEFAULT_TEXT_OPACITY=100;
var TEXT_COLOR_PRESETS=['#ffffff','#cccccc','#8ab4f8','#34d399','#fbbf24','#f472b6','#f87171'];
D.texts=[];

D.loadTexts=function(){try{D.texts=JSON.parse(localStorage.getItem(TEXT_KEY))||[]}catch(e){D.texts=[]}};
D.saveTexts=function(){localStorage.setItem(TEXT_KEY,JSON.stringify(D.texts))};
D.findText=function(id){return D.texts.filter(function(t){return t.id===id})[0]};

D.addText=function(x,y){
  x=D.snap(Math.max(4,Math.min(window.innerWidth-100,x)));
  y=D.snap(Math.max(4,Math.min(window.innerHeight-50,y)));
  var t={id:'txt_'+Date.now()+'_'+(++D.idc),text:'默认文本',x:x,y:y,color:D.resolveTheme()==='light'?'#333333':'#cccccc',opacity:DEFAULT_TEXT_OPACITY,fontSize:DEFAULT_TEXT_SIZE};
  D.texts.push(t);
  var el=D.createTextEl(t);
  document.body.appendChild(el);
  D.saveTexts();
  D.editText(el,t);
};

function clampOpacity(v){
  v=parseInt(v,10);
  if(isNaN(v))v=DEFAULT_TEXT_OPACITY;
  return Math.max(0,Math.min(100,v));
}

function hexToRgb(hex){
  hex=(hex||DEFAULT_TEXT_COLOR).replace('#','');
  if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  hex=hex.slice(0,6);
  return{
    r:parseInt(hex.slice(0,2),16)||0,
    g:parseInt(hex.slice(2,4),16)||0,
    b:parseInt(hex.slice(4,6),16)||0
  };
}

function toRgba(hex,opacity){
  var c=hexToRgb(hex);
  return 'rgba('+c.r+','+c.g+','+c.b+','+(clampOpacity(opacity)/100)+')';
}

function normalizeHex(hex){
  hex=(hex||DEFAULT_TEXT_COLOR).trim();
  var m=hex.match(/^#([0-9a-f]{3,8})$/i);
  if(!m)return DEFAULT_TEXT_COLOR;
  hex=m[1];
  if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return '#'+hex.slice(0,6).toLowerCase();
}

D.applyTextStyle=function(el,t){
  el.style.color=toRgba(t.color||DEFAULT_TEXT_COLOR,t.opacity);
  el.style.fontSize=(t.fontSize||DEFAULT_TEXT_SIZE)+'px';
};

D.createTextEl=function(t){
  var el=document.createElement('div');
  el.className='text-note';
  el.dataset.id=t.id;
  el.textContent=t.text;
  el.style.left=D.snap(t.x)+'px';
  el.style.top=D.snap(t.y)+'px';
  D.applyTextStyle(el,t);

  el.addEventListener('dblclick',function(e){
    e.preventDefault();e.stopPropagation();
    D.editText(el,t);
  });

  el.addEventListener('contextmenu',function(e){
    e.preventDefault();e.stopPropagation();
    D.openTextSettings(t.id);
  });

  D.enableTextDrag(el,t);
  return el;
};

D.renderAllTexts=function(){
  document.querySelectorAll('.text-note').forEach(function(el){el.remove()});
  D.texts.forEach(function(t){document.body.appendChild(D.createTextEl(t))});
};

D.editText=function(el,t){
  el.contentEditable='true';
  el.classList.add('editing');
  el.focus();
  var range=document.createRange();
  range.selectNodeContents(el);
  var sel=window.getSelection();
  sel.removeAllRanges();sel.addRange(range);

  function onKeydown(e){
    if(e.key==='Enter'||e.key==='Escape'){
      e.preventDefault();e.stopPropagation();el.blur();
    }
  }
  function onBlur(){
    el.contentEditable='false';
    el.classList.remove('editing');
    var v=el.textContent.trim()||'默认文本';
    t.text=v;el.textContent=v;
    D.saveTexts();
    el.removeEventListener('blur',onBlur);
    el.removeEventListener('keydown',onKeydown);
  }
  el.addEventListener('blur',onBlur);
  el.addEventListener('keydown',onKeydown);
};

D.enableTextDrag=function(el,t){
  el.addEventListener('mousedown',function(e){
    if(el.classList.contains('editing')||e.button!==0||D.selecting)return;
    e.preventDefault();
    if(!t.selected){if(!e.shiftKey)D.clearSelection();t.selected=true;el.classList.add('selected')}
    D.dragSelected(e.clientX,e.clientY);
  });
};

D.removeText=function(id){
  D.texts=D.texts.filter(function(t){return t.id!==id});
  var el=document.querySelector('.text-note[data-id="'+id+'"]');
  if(el)el.remove();
  D.saveTexts();
};

/* ---------- 文本设置弹窗 ---------- */
var textMask=document.getElementById('textSettingsMask');
var textSizeInput=document.getElementById('textFontSize');
var textSizeRange=document.getElementById('textFontSizeRange');
var textColorInput=document.getElementById('textColor');
var textOpacityInput=document.getElementById('textOpacity');
var textOpacityRange=document.getElementById('textOpacityRange');
var textPreview=document.getElementById('textStylePreview');
var textSettingsId=null;
var currentTextColor=DEFAULT_TEXT_COLOR;
var currentTextOpacity=DEFAULT_TEXT_OPACITY;

function clampTextSize(v){
  v=parseInt(v,10);
  if(isNaN(v))v=DEFAULT_TEXT_SIZE;
  return Math.max(12,Math.min(120,v));
}

function syncTextSizeInputs(v){
  textSizeInput.value=v;
  textSizeRange.value=v;
}

function syncTextOpacityInputs(v){
  textOpacityInput.value=v;
  textOpacityRange.value=v;
}

function syncTextSwatchActive(){
  var hex=normalizeHex(currentTextColor);
  document.querySelectorAll('#textColorSwatches .swatch[data-color]').forEach(function(s){
    s.classList.toggle('active',normalizeHex(s.dataset.color)===hex);
  });
  var isPreset=TEXT_COLOR_PRESETS.some(function(c){return normalizeHex(c)===hex});
  document.querySelector('#textColorSwatches .swatch-custom').classList.toggle('active',!isPreset);
}

function updateTextPreview(){
  var t=D.findText(textSettingsId);
  var size=clampTextSize(textSizeInput.value);
  textPreview.textContent=t&&t.text?t.text:'预览文本';
  textPreview.style.color=toRgba(currentTextColor,currentTextOpacity);
  textPreview.style.fontSize=size+'px';
  textOpacityRange.style.setProperty('--opacity-color',normalizeHex(currentTextColor));
}

D.openTextSettings=function(id){
  var t=D.findText(id);if(!t)return;
  textSettingsId=id;
  currentTextColor=normalizeHex(t.color||DEFAULT_TEXT_COLOR);
  currentTextOpacity=t.opacity==null?DEFAULT_TEXT_OPACITY:clampOpacity(t.opacity);
  textColorInput.value=currentTextColor;
  syncTextSizeInputs(t.fontSize||DEFAULT_TEXT_SIZE);
  syncTextOpacityInputs(currentTextOpacity);
  syncTextSwatchActive();
  updateTextPreview();
  textMask.classList.add('show');
};

D.closeTextSettings=function(){
  textMask.classList.remove('show');
  textSettingsId=null;
};

document.querySelectorAll('#textColorSwatches .swatch[data-color]').forEach(function(s){
  s.addEventListener('click',function(){
    currentTextColor=normalizeHex(s.dataset.color);
    textColorInput.value=currentTextColor;
    syncTextSwatchActive();
    updateTextPreview();
  });
});
textColorInput.addEventListener('input',function(){
  currentTextColor=normalizeHex(textColorInput.value);
  syncTextSwatchActive();
  updateTextPreview();
});
textOpacityInput.addEventListener('input',function(){
  if(textOpacityInput.value==='')return;
  currentTextOpacity=clampOpacity(textOpacityInput.value);
  textOpacityRange.value=currentTextOpacity;
  updateTextPreview();
});
textOpacityInput.addEventListener('change',function(){
  currentTextOpacity=clampOpacity(textOpacityInput.value);
  syncTextOpacityInputs(currentTextOpacity);
  updateTextPreview();
});
textOpacityRange.addEventListener('input',function(){
  currentTextOpacity=clampOpacity(textOpacityRange.value);
  syncTextOpacityInputs(currentTextOpacity);
  updateTextPreview();
});
textSizeInput.addEventListener('input',function(){
  if(textSizeInput.value==='')return;
  var v=clampTextSize(textSizeInput.value);
  textSizeRange.value=v;
  updateTextPreview();
});
textSizeInput.addEventListener('change',function(){
  var v=clampTextSize(textSizeInput.value);
  syncTextSizeInputs(v);
  updateTextPreview();
});
textSizeRange.addEventListener('input',function(){
  var v=clampTextSize(textSizeRange.value);
  syncTextSizeInputs(v);
  updateTextPreview();
});

document.getElementById('textSettingsCancel').addEventListener('click',D.closeTextSettings);
textMask.addEventListener('click',function(e){if(e.target===textMask)D.closeTextSettings()});

document.getElementById('textSettingsDelete').addEventListener('click',function(){
  if(!textSettingsId)return;
  var id=textSettingsId;
  D.closeTextSettings();
  D.showConfirm('删除文本','确定要删除这段文本吗？',function(){D.removeText(id)});
});

document.getElementById('textSettingsSave').addEventListener('click',function(){
  if(!textSettingsId)return;
  var t=D.findText(textSettingsId);if(!t)return;
  t.color=normalizeHex(currentTextColor);
  t.opacity=clampOpacity(currentTextOpacity);
  t.fontSize=clampTextSize(textSizeInput.value);
  var el=document.querySelector('.text-note[data-id="'+t.id+'"]');
  if(el)D.applyTextStyle(el,t);
  D.saveTexts();
  D.closeTextSettings();
});

D._textMask=textMask;
