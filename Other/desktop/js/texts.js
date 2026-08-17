var D = window.D || {};

var TEXT_KEY='desktop_texts';
D.texts=[];

D.loadTexts=function(){try{D.texts=JSON.parse(localStorage.getItem(TEXT_KEY))||[]}catch(e){D.texts=[]}};
D.saveTexts=function(){localStorage.setItem(TEXT_KEY,JSON.stringify(D.texts))};

D.addText=function(x,y){
  x=D.snap(Math.max(4,Math.min(window.innerWidth-100,x)));
  y=D.snap(Math.max(4,Math.min(window.innerHeight-50,y)));
  var t={id:'txt_'+Date.now()+'_'+(++D.idc),text:'默认文本',x:x,y:y};
  D.texts.push(t);
  var el=D.createTextEl(t);
  document.body.appendChild(el);
  D.saveTexts();
  D.editText(el,t);
};

D.createTextEl=function(t){
  var el=document.createElement('div');
  el.className='text-note';
  el.dataset.id=t.id;
  el.textContent=t.text;
  el.style.left=D.snap(t.x)+'px';
  el.style.top=D.snap(t.y)+'px';

  el.addEventListener('dblclick',function(e){
    e.preventDefault();e.stopPropagation();
    D.editText(el,t);
  });

  el.addEventListener('contextmenu',function(e){
    e.preventDefault();e.stopPropagation();
    D.showConfirm('删除文本','确定要删除这段文本吗？',function(){D.removeText(t.id)});
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
