var D = window.D || {};

/* ---------- 添加 / 删除 ---------- */
D.addIcon=function(url,title,x,y,layout){
  x=D.snap(Math.max(4,Math.min(window.innerWidth-100,x-48)));
  y=D.snap(Math.max(4,Math.min(window.innerHeight-84,y-40)));
  var ic={id:'ic_'+Date.now()+'_'+(++D.idc),url:url,title:title||D.hostname(url),iconType:'favicon',iconUrl:'',iconText:'',iconColor:'',iconImageKey:'',layout:layout||D.defaultLayout,x:x,y:y,selected:false};
  D.icons.push(ic);document.body.appendChild(D.createIconEl(ic));D.saveIcons();
};

D.removeIcon=function(id){
  var ic=D.findIcon(id);
  if(ic&&ic.iconImageKey)D.idbDelete(ic.iconImageKey);
  D.icons=D.icons.filter(function(i){return i.id!==id});
  var el=document.querySelector('.icon[data-id="'+id+'"]');if(el)el.remove();
  D.saveIcons();
};

D.removeIcons=function(ids){
  ids.forEach(function(id){var ic=D.findIcon(id);if(ic&&ic.iconImageKey)D.idbDelete(ic.iconImageKey)});
  D.icons=D.icons.filter(function(i){return ids.indexOf(i.id)<0});
  ids.forEach(function(id){var el=document.querySelector('.icon[data-id="'+id+'"]');if(el)el.remove()});
  D.saveIcons();
};

D.resnapAll=function(){
  D.icons.forEach(function(ic){ic.x=D.snap(ic.x);ic.y=D.snap(ic.y);
    var el=document.querySelector('.icon[data-id="'+ic.id+'"]');if(el){el.style.left=ic.x+'px';el.style.top=ic.y+'px'}});
  D.saveIcons();
};

/* ---------- 导出配置 ---------- */
D.exportConfig=function(){
  var keys=D.icons.filter(function(i){return i.iconImageKey}).map(function(i){return i.iconImageKey});
  var images={};
  var chain=Promise.resolve();
  keys.forEach(function(k){chain=chain.then(function(){return D.idbGet(k).then(function(v){images[k]=v})})});
  chain.then(function(){
    var clone=function(item){var c={};for(var k in item){if(k!=='selected')c[k]=item[k]}return c};
    var data={
      version:2,
      exportedAt:new Date().toISOString(),
      grid:D.grid,
      snapEnabled:D.snapEnabled,
      defaultLayout:D.defaultLayout,
      icons:D.icons.map(clone),
      texts:D.texts.map(clone),
      images:images
    };
    var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download='desktop-config-'+new Date().toISOString().slice(0,10)+'.json';
    document.body.appendChild(a);a.click();a.remove();
    URL.revokeObjectURL(url);
  });
};
