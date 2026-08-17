var D = window.D || {};

/* ---------- 通用：获取所有选中项 ---------- */
D.selectedTexts=function(){return D.texts.filter(function(t){return t.selected})};

/* ---------- 通用：批量拖拽选中项 ---------- */
D.dragSelected=function(sx,sy){
  var sIcons=D.selectedIcons();
  var sTexts=D.selectedTexts();
  var sp={};
  sIcons.forEach(function(s){sp[s.id]={x:s.x,y:s.y}});
  sTexts.forEach(function(t){sp[t.id]={x:t.x,y:t.y}});
  var dragged=false;
  function move(ev){
    var dx=ev.clientX-sx,dy=ev.clientY-sy;
    if(Math.abs(dx)>3||Math.abs(dy)>3){
      dragged=true;
      sIcons.forEach(function(s){
        var o=sp[s.id];var el=document.querySelector('.icon[data-id="'+s.id+'"]');
        var w=el?el.offsetWidth:96,h=el?el.offsetHeight:80;
        s.x=D.snap(Math.max(0,Math.min(window.innerWidth-w,o.x+dx)));
        s.y=D.snap(Math.max(0,Math.min(window.innerHeight-h,o.y+dy)));
        if(el){el.style.left=s.x+'px';el.style.top=s.y+'px';el.classList.add('dragging')}
      });
      sTexts.forEach(function(t){
        var o=sp[t.id];var el=document.querySelector('.text-note[data-id="'+t.id+'"]');
        var w=el?el.offsetWidth:100,h=el?el.offsetHeight:40;
        t.x=D.snap(Math.max(0,Math.min(window.innerWidth-w,o.x+dx)));
        t.y=D.snap(Math.max(0,Math.min(window.innerHeight-h,o.y+dy)));
        if(el){el.style.left=t.x+'px';el.style.top=t.y+'px';el.classList.add('dragging')}
      });
    }
  }
  function up(){
    sIcons.forEach(function(s){var el=document.querySelector('.icon[data-id="'+s.id+'"]');if(el)el.classList.remove('dragging')});
    sTexts.forEach(function(t){var el=document.querySelector('.text-note[data-id="'+t.id+'"]');if(el)el.classList.remove('dragging')});
    document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);
    if(dragged){D.saveIcons();D.saveTexts()}
  }
  document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
  return{get dragged(){return dragged}};
};

/* ---------- 单图标拖拽 ---------- */
D.enableDrag=function(el,ic,onMove){
  el.addEventListener('mousedown',function(e){
    if(e.button!==0||D.selecting)return;e.preventDefault();
    var sel=D.selectedIcons();
    if(sel.indexOf(ic)<0)return;
    var st=D.dragSelected(e.clientX,e.clientY);
    var moved=false;
    var checkMove=function(){if(st.dragged&&!moved){moved=true;onMove()}};
    document.addEventListener('mousemove',checkMove);
    document.addEventListener('mouseup',function(){document.removeEventListener('mousemove',checkMove)},{once:true});
  });
};

/* ---------- 框选 ---------- */
var selectBox=document.getElementById('selectBox');
var selStartX=0,selStartY=0;

document.addEventListener('mousedown',function(e){
  if(e.button!==0)return;
  if(e.target.closest('.icon')||e.target.closest('.text-note')||e.target.closest('.ctx-menu')||e.target.closest('.modal-mask'))return;
  if(!e.shiftKey)D.clearSelection();
  D.selecting=true;
  selStartX=e.clientX;selStartY=e.clientY;
  selectBox.style.display='block';
  selectBox.style.left=selStartX+'px';selectBox.style.top=selStartY+'px';
  selectBox.style.width='0';selectBox.style.height='0';
  function move(ev){
    var x1=Math.min(selStartX,ev.clientX),y1=Math.min(selStartY,ev.clientY);
    var x2=Math.max(selStartX,ev.clientX),y2=Math.max(selStartY,ev.clientY);
    selectBox.style.left=x1+'px';selectBox.style.top=y1+'px';
    selectBox.style.width=(x2-x1)+'px';selectBox.style.height=(y2-y1)+'px';
    D.icons.forEach(function(ic){
      var el=document.querySelector('.icon[data-id="'+ic.id+'"]');if(!el)return;
      var r=el.getBoundingClientRect();
      var overlap=!(r.right<x1||r.left>x2||r.bottom<y1||r.top>y2);
      if(overlap&&!ic.selected){ic.selected=true;el.classList.add('selected')}
      else if(!overlap&&ic.selected&&!e.shiftKey){ic.selected=false;el.classList.remove('selected')}
    });
    D.texts.forEach(function(t){
      var el=document.querySelector('.text-note[data-id="'+t.id+'"]');if(!el)return;
      var r=el.getBoundingClientRect();
      var overlap=!(r.right<x1||r.left>x2||r.bottom<y1||r.top>y2);
      if(overlap&&!t.selected){t.selected=true;el.classList.add('selected')}
      else if(!overlap&&t.selected&&!e.shiftKey){t.selected=false;el.classList.remove('selected')}
    });
  }
  function up(){D.selecting=false;selectBox.style.display='none';document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up)}
  document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
});

D.clearSelection=function(){
  D.icons.forEach(function(ic){ic.selected=false;var el=document.querySelector('.icon[data-id="'+ic.id+'"]');if(el)el.classList.remove('selected')});
  D.texts.forEach(function(t){t.selected=false;var el=document.querySelector('.text-note[data-id="'+t.id+'"]');if(el)el.classList.remove('selected')});
};
