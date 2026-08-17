var D = window.D || {};

/* ---------- IndexedDB ---------- */
var DB_NAME='desktop_db',STORE='images',db=null;

D.idbOpen=function(){
  return new Promise(function(resolve){
    try{
      var req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=function(e){
        var d=e.target.result;
        if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE);
      };
      req.onsuccess=function(e){db=e.target.result;resolve()};
      req.onerror=function(){resolve()};
    }catch(e){resolve()}
  });
};

D.idbPut=function(key,val){
  return new Promise(function(resolve){
    if(!db){resolve();return}
    try{
      var tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).put(val,key);
      tx.oncomplete=function(){resolve()};
      tx.onerror=function(){resolve()};
    }catch(e){resolve()}
  });
};

D.idbGet=function(key){
  return new Promise(function(resolve){
    if(!db){resolve(null);return}
    try{
      var tx=db.transaction(STORE,'readonly');
      var req=tx.objectStore(STORE).get(key);
      req.onsuccess=function(){resolve(req.result||null)};
      req.onerror=function(){resolve(null)};
    }catch(e){resolve(null)}
  });
};

D.idbDelete=function(key){
  return new Promise(function(resolve){
    if(!db){resolve();return}
    try{
      var tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete=function(){resolve()};
      tx.onerror=function(){resolve()};
    }catch(e){resolve()}
  });
};

/* ---------- 图片裁切 ---------- */
D.cropImageToBase64=function(file,size){
  size=size||96;
  return new Promise(function(resolve,reject){
    var reader=new FileReader();
    reader.onload=function(){
      var img=new Image();
      img.onload=function(){
        var canvas=document.createElement('canvas');
        canvas.width=size;canvas.height=size;
        var ctx=canvas.getContext('2d');
        var minDim=Math.min(img.width,img.height);
        var sx=(img.width-minDim)/2,sy=(img.height-minDim)/2;
        ctx.drawImage(img,sx,sy,minDim,minDim,0,0,size,size);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror=reject;
      img.src=reader.result;
    };
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
};
