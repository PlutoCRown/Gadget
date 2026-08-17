var D = window.D || {};

/* ---------- 存储键 ---------- */
var ICON_KEY='desktop_icons_v2',GRID_KEY='desktop_grid',SNAP_KEY='desktop_snap';
var CSS_KEY='desktop_custom_css',LAYOUT_KEY='desktop_default_layout';
var DEFAULT_GRID=10;

/* ---------- 全局状态 ---------- */
D.icons=[];
D.grid=parseInt(localStorage.getItem(GRID_KEY))||DEFAULT_GRID;
D.snapEnabled=localStorage.getItem(SNAP_KEY)!=='0';
D.defaultLayout=localStorage.getItem(LAYOUT_KEY)||'vertical';
D.idc=0;
D.selecting=false;

/* ---------- 图标数据 ---------- */
D.load=function(){try{D.icons=JSON.parse(localStorage.getItem(ICON_KEY))||[]}catch(e){D.icons=[]}};
D.saveIcons=function(){localStorage.setItem(ICON_KEY,JSON.stringify(D.icons))};

/* ---------- 网格 / 布局 ---------- */
D.saveGrid=function(){localStorage.setItem(GRID_KEY,String(D.grid))};
D.saveSnap=function(){localStorage.setItem(SNAP_KEY,D.snapEnabled?'1':'0')};
D.saveDefaultLayout=function(){localStorage.setItem(LAYOUT_KEY,D.defaultLayout)};

/* ---------- 自定义 CSS ---------- */
D.loadCustomCSS=function(){return localStorage.getItem(CSS_KEY)||''};
D.saveCustomCSS=function(css){localStorage.setItem(CSS_KEY,css)};
D.applyCustomCSS=function(){
  var css=D.loadCustomCSS();
  var el=document.getElementById('customStyle');
  if(!el){el=document.createElement('style');el.id='customStyle';document.head.appendChild(el)}
  el.textContent=css?'.desktop-root{\n'+css+'\n}':'';
};

/* ---------- 工具函数 ---------- */
D.hostname=function(url){try{return new URL(url).hostname.replace(/^www\./,'')}catch(e){return url}};
D.defaultFavicon=function(url){
  return fetch(url,{mode:'cors',credentials:'omit',signal:AbortSignal.timeout(5000)})
    .then(function(r){return r.text()})
    .then(function(html){
      var doc=new DOMParser().parseFromString(html,'text/html');
      var link=doc.querySelector('link[rel~="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"]');
      if(link&&link.getAttribute('href')){
        return new URL(link.getAttribute('href'),url).href;
      }
      throw new Error('no icon link');
    })
    .catch(function(){return null});
};
D.letterOf=function(s){for(var i=0;i<s.length;i++){var c=s[i];if(/[a-zA-Z0-9\u4e00-\u9fff]/.test(c))return c.toUpperCase()}return '?'};
D.findIcon=function(id){return D.icons.filter(function(i){return i.id===id})[0]};
D.snap=function(v){return D.snapEnabled?Math.round(v/D.grid)*D.grid:Math.round(v)};
D.selectedIcons=function(){return D.icons.filter(function(i){return i.selected})};
