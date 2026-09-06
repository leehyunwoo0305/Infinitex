
"use strict";

var THEMES=[
{id:"dark",n:"Dark",bg:"#1e1e1e",sb:"#252526",bg3:"#2d2d2d",ac:"#007acc",fg:"#d4d4d4",fg2:"#858585",bd:"#3c3c3c"},
{id:"light",n:"Light",bg:"#ffffff",sb:"#f3f3f3",bg3:"#e8e8e8",ac:"#007acc",fg:"#333333",fg2:"#666666",bd:"#d4d4d4"},
{id:"mono",n:"Monokai",bg:"#272822",sb:"#1e1f1c",bg3:"#3e3d32",ac:"#a6e22e",fg:"#f8f8f2",fg2:"#75715e",bd:"#49483e"},
{id:"drac",n:"Dracula",bg:"#282a36",sb:"#21222c",bg3:"#44475a",ac:"#bd93f9",fg:"#f8f8f2",fg2:"#6272a4",bd:"#44475a"},
{id:"sola",n:"Solarized Dark",bg:"#002b36",sb:"#073642",bg3:"#073642",ac:"#268bd2",fg:"#839496",fg2:"#586e75",bd:"#073642"},
{id:"soll",n:"Solarized Light",bg:"#fdf6e3",sb:"#eee8d5",bg3:"#eee8d5",ac:"#268bd2",fg:"#657b83",fg2:"#93a1a1",bd:"#eee8d5"},
{id:"nord",n:"Nord",bg:"#2e3440",sb:"#3b4252",bg3:"#434c5e",ac:"#88c0d0",fg:"#d8dee9",fg2:"#4c566a",bd:"#434c5e"},
{id:"gith",n:"GitHub Dark",bg:"#0d1117",sb:"#161b22",bg3:"#21262d",ac:"#58a6ff",fg:"#c9d1d9",fg2:"#8b949e",bd:"#30363d"},
{id:"gitl",n:"GitHub Light",bg:"#ffffff",sb:"#f6f8fa",bg3:"#eaeef2",ac:"#0969da",fg:"#24292f",fg2:"#656d76",bd:"#d0d7de"},
{id:"oned",n:"One Dark",bg:"#282c34",sb:"#21252b",bg3:"#2c313c",ac:"#61afef",fg:"#abb2bf",fg2:"#5c6370",bd:"#3e4451"},
{id:"ayu",n:"Ayu Dark",bg:"#0b1416",sb:"#0d1017",bg3:"#131920",ac:"#39bae6",fg:"#bfbdb6",fg2:"#626a73",bd:"#1f2430"},
{id:"ayum",n:"Ayu Mirage",bg:"#1f2430",sb:"#232834",bg3:"#2b323d",ac:"#36d7b7",fg:"#cbccc6",fg2:"#707a8c",bd:"#3b4252"},
{id:"gruv",n:"Gruvbox Dark",bg:"#282828",sb:"#3c3836",bg3:"#504945",ac:"#b8bb26",fg:"#ebdbb2",fg2:"#928374",bd:"#504945"},
{id:"rose",n:"Rose Pine",bg:"#191724",sb:"#1f1d2e",bg3:"#26233a",ac:"#eb6f92",fg:"#e0def4",fg2:"#6e6a86",bd:"#393552"},
{id:"cyber",n:"Cyberpunk",bg:"#0a0e14",sb:"#0d1017",bg3:"#131920",ac:"#f07178",fg:"#e6e6e6",fg2:"#686868",bd:"#1d2433"},
{id:"toky",n:"Tokyo Night",bg:"#1a1b26",sb:"#16161e",bg3:"#24283b",ac:"#7aa2f7",fg:"#a9b1d6",fg2:"#565f89",bd:"#292e42"},
{id:"onedl",n:"One Light",bg:"#fafafa",sb:"#f0f0f0",bg3:"#e8e8e8",ac:"#4078f2",fg:"#383a42",fg2:"#a0a1a7",bd:"#d4d4d4"}
];

var FILES=[];

var LANG_ICONS={
  typescript:'<span style="color:#3178c6;font-weight:700">TS</span>',
  javascript:'<span style="color:#f7df1e;font-weight:700">JS</span>',
  python:'<span style="color:#3572A5;font-weight:700">PY</span>',
  java:'<span style="color:#b07219;font-weight:700">JV</span>',
  csharp:'<span style="color:#178600;font-weight:700">C#</span>',
  cpp:'<span style="color:#f34b7d;font-weight:700">C++</span>',
  c:'<span style="color:#555;font-weight:700">C</span>',
  go:'<span style="color:#00ADD8;font-weight:700">GO</span>',
  rust:'<span style="color:#dea584;font-weight:700">RS</span>',
  ruby:'<span style="color:#CC342D;font-weight:700">RB</span>',
  php:'<span style="color:#4F5D95;font-weight:700">PH</span>',
  swift:'<span style="color:#F05138;font-weight:700">SW</span>',
  kotlin:'<span style="color:#A97BFF;font-weight:700">KT</span>',
  scala:'<span style="color:#DC322F;font-weight:700">SC</span>',
  html:'<span style="color:#e44d26;font-weight:700">H</span>',
  css:'<span style="color:#1572b6;font-weight:700">C</span>',
  scss:'<span style="color:#c6538c;font-weight:700">S</span>',
  less:'<span style="color:#1d365d;font-weight:700">L</span>',
  json:'<span style="color:#f7df1e;font-weight:700">{}</span>',
  xml:'<span style="color:#f16529;font-weight:700">&lt;/&gt;</span>',
  yaml:'<span style="color:#cb171e;font-weight:700">YM</span>',
  markdown:'<span style="color:#083fa1;font-weight:700">MD</span>',
  sql:'<span style="color:#e38c00;font-weight:700">SQ</span>',
  shell:'<span style="color:#89e051;font-weight:700">SH</span>',
  powershell:'<span style="color:#012456;font-weight:700">PS</span>',
  dockerfile:'<span style="color:#2496ED;font-weight:700">DK</span>',
  text:'<span style="color:var(--fg2);font-weight:700">TXT</span>',
  pdf:'<span style="color:#f44336;font-weight:700">PDF</span>'
};
var LANG_MAP={typescript:"TypeScript",javascript:"JavaScript",python:"Python",java:"Java",csharp:"C#",cpp:"C++",c:"C",go:"Go",rust:"Rust",ruby:"Ruby",php:"PHP",swift:"Swift",kotlin:"Kotlin",scala:"Scala",html:"HTML",css:"CSS",scss:"SCSS",less:"Less",json:"JSON",xml:"XML",yaml:"YAML",markdown:"Markdown",sql:"SQL",shell:"Shell",powershell:"PowerShell",dockerfile:"Dockerfile",text:"Text",pdf:"PDF"};

var curTheme=THEMES[0],tabs=[],activeTab=null,viewMode="editor",sideVis=true,gitVis=false,termVis=true;

function $(id){return document.getElementById(id)}
function findF(a,id){for(var i=0;i<a.length;i++){if(a[i].id===id)return a[i];if(a[i].chi){var r=findF(a[i].chi,id);if(r)return r}}return null}
function toggleFold(id){function w(a){for(var i=0;i<a.length;i++){if(a[i].id===id){a[i].op=!a[i].op;return true}if(a[i].chi&&w(a[i].chi))return true}return false}w(FILES);renderSide()}
function walkUp(el,cls){while(el&&el.tagName!=="BODY"){if(el.classList&&el.classList.contains(cls))return el;el=el.parentElement}return null}
function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function notify(msg){var n=document.createElement("div");n.className="notif";n.textContent=msg;document.body.appendChild(n);setTimeout(function(){n.classList.add("out");setTimeout(function(){n.remove()},300)},2000)}

function applyTheme(t){
  curTheme=t;var s=document.documentElement.style;
  s.setProperty("--bg",t.bg);s.setProperty("--bg2",t.sb);s.setProperty("--bg3",t.bg3);s.setProperty("--ac",t.ac);s.setProperty("--fg",t.fg);s.setProperty("--fg2",t.fg2);s.setProperty("--bd",t.bd);
  notify("Theme: "+t.n);
}
function renderThemes(){
  var h="";for(var i=0;i<THEMES.length;i++){var t=THEMES[i];
  h+='<div class="tc'+(t.id===curTheme.id?" sel":"")+'" data-theme="'+t.id+'"><div class="tn">'+t.n+'</div><div class="cs"><div class="sw" style="background:'+t.bg+'"></div><div class="sw" style="background:'+t.sb+'"></div><div class="sw" style="background:'+t.ac+'"></div><div class="sw" style="background:'+t.fg+'"></div></div></div>'}
  $("tgrid").innerHTML=h;
}

function renderSide(){
  var tree=rT(FILES);
  if(!tree)tree='<div style="padding:20px 12px;color:var(--fg2);font-size:12px;text-align:center">No files opened.<br><br>File > Open File<br>File > Open Folder<br>File > New File</div>';
  var h='<div class="side-hd"><span>Explorer</span><div class="sa"><button class="btn" title="New File">+</button><button class="btn" title="Refresh">&#8634;</button></div></div><div class="ftree">'+tree+'</div>';
  $("sidebar").innerHTML=h;
}
function rT(a){return a.map(function(f){
  var isF=f.tp==="d";
  var ic=isF?'<span style="color:#dcb67a;font-weight:700">&#128194;</span>':(LANG_ICONS[f.lg]||'<span style="color:var(--fg2);font-weight:700">?</span>');
  var cls=isF?"folder":(f.lg||"");
  var act=tabs.some(function(t){return t.fid===f.id&&t.id===activeTab});
  var ch=isF?'<span class="ch'+(f.op?" open":"")+'">&#9656;</span>':'<span class="ch" style="visibility:hidden">&#9656;</span>';
  var kids=(isF&&f.op&&f.chi)?'<div class="tch">'+rT(f.chi)+'</div>':'';
  return '<div class="ti'+(act?" act":"")+'" data-id="'+f.id+'" data-tp="'+f.tp+'">'+ch+'<span class="ic '+cls+'">'+ic+'</span><span>'+f.nm+'</span></div>'+kids;
}).join("")}

function renderTabs(){
  var h="";for(var i=0;i<tabs.length;i++){var t=tabs[i];var ic=LANG_ICONS[t.lg]||'<span style="color:var(--fg2);font-weight:700">?</span>';
  h+='<div class="tab'+(t.id===activeTab?" on":"")+'" data-tid="'+t.id+'"><span style="font-size:11px">'+ic+'</span><span style="overflow:hidden;text-overflow:ellipsis">'+t.nm+'</span>'+(t.mod?'<span class="mod"></span>':'')+'<span class="cls" data-close="'+t.id+'">&#10005;</span></div>'}
  $("tabbar").innerHTML=h;
}

function renderGit(){
  var files=[{nm:"src/components/Button.tsx",st:"added",sg:true},{nm:"src/App.tsx",st:"modified",sg:false},{nm:"src/utils/old.ts",st:"deleted",sg:false}];
  var stg=files.filter(function(f){return f.sg}),unst=files.filter(function(f){return !f.sg});
  var S={added:"&#43;",modified:"&#9998;",deleted:"&#10007;"};
  var h='<div class="gitp-hd"><span style="font-size:14px">&#9734;</span><span>Source Control</span></div>';
  h+='<div class="git-row"><input class="git-inp" placeholder="Commit message..."><button class="git-cbtn"'+(!stg.length?" disabled":"")+'>Commit</button></div>';
  h+='<div class="git-tb"><button class="btn">&#8634;</button><button class="btn">&#8593;</button><button class="btn">&#8595;</button><div style="flex:1"></div><button class="btn">+</button><button class="btn">-</button></div>';
  h+='<div style="flex:1;overflow-y:auto">';
  if(stg.length){h+='<div class="git-sec-hd"><span>Staged Changes</span><span>'+stg.length+'</span></div>';stg.forEach(function(f){h+='<div class="git-f"><span class="st '+f.st+'">'+S[f.st]+'</span><span class="nm">'+f.nm+'</span><span class="ck">&#10003;</span></div>'})}
  if(unst.length){h+='<div class="git-sec-hd"><span>Changes</span><span>'+unst.length+'</span></div>';unst.forEach(function(f){h+='<div class="git-f"><span class="st '+f.st+'">'+S[f.st]+'</span><span class="nm">'+f.nm+'</span></div>'})}
  h+='</div><div class="git-ft"><span>main</span><span>0 &#8595; 0 &#8593;</span></div>';
  $("gitpanel").innerHTML=h;
}

function openFile(f){
  if(f.tp!=="f")return;
  if(f.lg==="pdf"){openPdf(f);return}
  var tab=null;for(var i=0;i<tabs.length;i++){if(tabs[i].fid===f.id){tab=tabs[i];break}}
  if(!tab){tab={id:"t"+f.id,fid:f.id,nm:f.nm,lg:f.lg||"plaintext",mod:false};tabs.push(tab)}
  activeTab=tab.id;
  $("empty").style.display="none";$("codewrap").style.display="flex";$("pdfwrap").style.display="none";
  var ca=$("codearea");ca.value=f.ct||"";$("stlang").textContent=LANG_MAP[f.lg]||f.lg||"plaintext";
  updateLineNums();doHighlight();renderTabs();renderSide();
}
function openPdf(f){
  var tab=null;for(var i=0;i<tabs.length;i++){if(tabs[i].fid===f.id){tab=tabs[i];break}}
  if(!tab){tab={id:"t"+f.id,fid:f.id,nm:f.nm,lg:"pdf",mod:false};tabs.push(tab)}
  activeTab=tab.id;
  $("empty").style.display="none";$("codewrap").style.display="none";$("pdfwrap").style.display="block";
  if(f._blobUrl){$("pdfview").src=f._blobUrl}
  else if(f.ct instanceof ArrayBuffer){var blob=new Blob([f.ct],{type:"application/pdf"});f._blobUrl=URL.createObjectURL(blob);$("pdfview").src=f._blobUrl}
  $("stlang").textContent="PDF";
  renderTabs();renderSide();
}
function closeTab(tid){
  tabs=tabs.filter(function(t){return t.id!==tid});
  if(activeTab===tid){activeTab=tabs.length?tabs[tabs.length-1].id:null;
    if(activeTab){var t=null;for(var i=0;i<tabs.length;i++){if(tabs[i].id===activeTab){t=tabs[i];break}}
      if(t){var f=findF(FILES,t.fid);if(f)openFile(f)}}
    else{$("empty").style.display="flex";$("codewrap").style.display="none";$("pdfwrap").style.display="none"}}
  renderTabs();
}
function updateLineNums(){
  var ca=$("codearea"),ln=$("linenum");
  var lines=(ca.value||"").split("\n").length;var h="";for(var i=1;i<=lines;i++)h+=i+"\n";ln.textContent=h;
}

var KW_JS="break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|let|new|of|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|async|await|from|static|get|set".split("|");
var KW_PY="and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield".split("|");
var KW_CM="abstract|boolean|byte|char|double|enum|final|float|goto|implements|interface|long|native|package|private|protected|public|short|synchronized|transient|volatile|null|true|false|undefined|NaN|Infinity|self|True|False|None|print|console|document|window|Math|Array|Object|String|Number|Boolean|Function|Promise|Map|Set|JSON|Date|RegExp|Error|this|super|null|undefined|true|false|none|None|True|False".split("|");

var TP_JS="Array|Boolean|Date|Function|Number|Object|Promise|RegExp|String|Map|Set|WeakMap|WeakSet|Symbol|Error|TypeError|RangeError|Math|JSON|Intl|Promise|Proxy|Reflect|console|window|document|HTMLElement|Element|Node|Event|Blob|File|FileReader|URL|FormData|XMLHttpRequest|fetch|setTimeout|setInterval|clearTimeout|clearInterval|parseInt|parseFloat|isNaN|isFinite|encodeURI|decodeURI|encodeURIComponent|decodeURIComponent|alert|confirm|prompt|requestAnimationFrame|cancelAnimationFrame|alert".split("|");

function escH(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}

function highlightJS(code){
  var r="";var i=0;var len=code.length;
  while(i<len){
    if(code[i]==="/"){
      if(code[i+1]==="/"){var end=code.indexOf("\n",i);if(end===-1)end=len;r+='<span class="h-comment">'+escH(code.substring(i,end))+"</span>";i=end;continue}
      if(code[i+1]==="*"){var end2=code.indexOf("*/",i+2);if(end2===-1)end2=len;else end2+=2;r+='<span class="h-comment">'+escH(code.substring(i,end2))+"</span>";i=end2;continue}
    }
    if(code[i]==='"'||code[i]==="'"||code[i]==="`"){
      var q=code[i];var j=i+1;while(j<len&&code[j]!==q){if(code[j]==="\\")j++;j++}j++;r+='<span class="h-string">'+escH(code.substring(i,j))+"</span>";i=j;continue}
    if(code[i]===" "||code[i]==="\t"){var j=i;while(j<len&&(code[j]===" "||code[j]==="\t"))j++;r+=escH(code.substring(i,j));i=j;continue}
    if(/\d/.test(code[i])){var j=i;while(j<len&&/[\d.xXeEa-fAbBoO_]/.test(code[j]))j++;r+='<span class="h-number">'+escH(code.substring(i,j))+"</span>";i=j;continue}
    if(/[a-zA-Z_$]/.test(code[i])){
      var j=i;while(j<len&&/[a-zA-Z0-9_$]/.test(code[j]))j++;
      var w=code.substring(i,j);
      if(KW_JS.indexOf(w)!==-1||KW_CM.indexOf(w)!==-1){r+='<span class="h-keyword">'+w+"</span>"}
      else if(TP_JS.indexOf(w)!==-1){r+='<span class="h-type">'+w+"</span>"}
      else if(j<len&&code[j]==="("){r+='<span class="h-func">'+w+"</span>"}
      else if(w[0]===w[0].toUpperCase()&&/[a-z]/.test(w)===false){r+='<span class="h-type">'+w+"</span>"}
      else{r+='<span class="h-prop">'+w+"</span>"}
      i=j;continue}
    if("(){}[]".indexOf(code[i])!==-1){r+='<span class="h-punct">'+escH(code[i])+"</span>";i++;continue}
    if("=+-*/<>!&|?:;,.%^~".indexOf(code[i])!==-1){r+='<span class="h-op">'+escH(code[i])+"</span>";i++;continue}
    r+=escH(code[i]);i++}
  return r}

function highlightHTML(code){
  var r="";var i=0;while(i<code.length){
    if(code.substr(i,4)==="<!--"){var end=code.indexOf("-->",i);if(end===-1)end=code.length;else end+=3;r+='<span class="h-comment">'+escH(code.substring(i,end))+"</span>";i=end;continue}
    if(code[i]==="<"&&(code[i+1]==="/"||/[a-zA-Z!]/.test(code[i+1]))){
      var j=i;while(j<code.length&&code[j]!==">"){if(code[j]==='"'||code[j]==="'"){var q=code[j];j++;while(j<code.length&&code[j]!==q)j++;j++}else j++}j++;r+='<span class="h-punct">&lt;</span>';var tag=code.substring(i+1,j-1).replace(/^\/?/,"");
      var m=tag.match(/^(\w+)([\s\S]*)/);if(m){r+='<span class="h-tag">'+escH(m[1])+"</span>";var rest=m[2];
        rest=rest.replace(/(\s+)([\w-]+)(=)("(?:[^"]*")|'(?:[^']*')|[\w-]+)/g,function(_,sp,n,e,v){return '<span class="h-punct">'+sp+'</span><span class="h-attr">'+escH(n)+'</span><span class="h-op">'+e+'</span><span class="h-val">'+escH(v)+"</span>"});
        r+=escH(rest)}else r+=escH(tag);
      r+='<span class="h-punct">&gt;</span>';i=j;continue}
    if(code[i]==="<"){var j=code.indexOf(">",i);if(j===-1)j=code.length;else j++;r+='<span class="h-punct">'+escH(code.substring(i,j))+"</span>";i=j;continue}
    var j=i;while(j<code.length&&code[j]!=="<")j++;r+=escH(code.substring(i,j));i=j}
  return r}

function highlightCSS(code){
  var r="";var i=0;while(i<code.length){
    if(code[i]==="/"&&code[i+1]==="*"){var end=code.indexOf("*/",i+2);if(end===-1)end=code.length;else end+=2;r+='<span class="h-comment">'+escH(code.substring(i,end))+"</span>";i=end;continue}
    if(code[i]==='"'||code[i]==="'"){var q=code[i];var j=i+1;while(j<code.length&&code[j]!==q){if(code[j]==="\\")j++;j++}j++;r+='<span class="h-string">'+escH(code.substring(i,j))+"</span>";i=j;continue}
    if(code[i]==="#"&&/[a-fA-F0-9]{3,8}/.test(code.substr(i+1,8))){var j=i+1;while(j<code.length&&/[a-fA-F0-9]/.test(code[j]))j++;r+='<span class="h-number">'+escH(code.substring(i,j))+"</span>";i=j;continue}
    if(/\d/.test(code[i])){var j=i;while(j<code.length&&/[\d.%a-zA-Z]/.test(code[j]))j++;r+='<span class="h-number">'+escH(code.substring(i,j))+"</span>";i=j;continue}
    if(code[i]==="@"&&/[a-zA-Z]/.test(code[i+1]||"")){var j=i+1;while(j<code.length&&/[a-zA-Z-]/.test(code[j]))j++;r+='<span class="h-keyword">'+escH(code.substring(i,j))+"</span>";i=j;continue}
    if(/[a-zA-Z_-]/.test(code[i])){var j=i;while(j<code.length&&/[a-zA-Z0-9_-]/.test(code[j]))j++;var w=code.substring(i,j);if(w==="!important"||["important","inherit","initial","unset","none","auto","solid","dashed","dotted","block","inline","flex","grid","absolute","relative","fixed","sticky"].indexOf(w)!==-1){r+='<span class="h-keyword">'+w+"</span>"}else{r+='<span class="h-prop">'+w+"</span>"}i=j;continue}
    if("(){}:,;>~+[]".indexOf(code[i])!==-1){r+='<span class="h-punct">'+escH(code[i])+"</span>";i++;continue}
    r+=escH(code[i]);i++}
  return r}

function highlightGeneric(code){return escH(code)}

function doHighlight(){
  var ca=$("codearea"),hl=$("codehl");
  if(!ca||!hl)return;
  var code=ca.value;
  var t=null;for(var i=0;i<tabs.length;i++){if(tabs[i].id===activeTab){t=tabs[i];break}}
  var lang=t?t.lg:"";
  var highlighted;
  if(lang==="typescript"||lang==="javascript")highlighted=highlightJS(code);
  else if(lang==="html")highlighted=highlightHTML(code);
  else if(lang==="css"||lang==="scss"||lang==="less")highlighted=highlightCSS(code);
  else if(lang==="json")highlighted=highlightJS(code);
  else highlighted=highlightGeneric(code);
  hl.innerHTML=highlighted+"<br>"}

function syncScroll(){
  var ca=$("codearea"),hl=$("codehl"),ln=$("linenum");
  if(ca&&hl){hl.scrollTop=ca.scrollTop;hl.scrollLeft=ca.scrollLeft}
  if(ca&&ln)ln.scrollTop=ca.scrollTop;
}

var codeArea;
function initEditor(){
  codeArea=$("codearea");
  codeArea.addEventListener("input",function(){doHighlight();updateLineNums();triggerAC();
    for(var i=0;i<tabs.length;i++){if(tabs[i].id===activeTab){tabs[i].mod=true;break}}renderTabs();if(viewMode!=="editor")updatePrev()});
  codeArea.addEventListener("scroll",syncScroll);
  codeArea.addEventListener("click",function(){var pos=this.selectionStart;var lines=this.value.substring(0,pos).split("\n");$("stpos").textContent="Ln "+lines.length+", Col "+(lines[lines.length-1].length+1);hideAC()});
  codeArea.addEventListener("keyup",function(){var pos=this.selectionStart;var lines=this.value.substring(0,pos).split("\n");$("stpos").textContent="Ln "+lines.length+", Col "+(lines[lines.length-1].length+1)});
  codeArea.addEventListener("keydown",function(e){
    if(acKeyHandler(e))return;
    if(e.key==="Tab"){e.preventDefault();var s=this.selectionStart,en=this.selectionEnd;this.value=this.value.substring(0,s)+"  "+this.value.substring(en);this.selectionStart=this.selectionEnd=s+2;doHighlight();updateLineNums();triggerAC()}
    if(e.key==="Enter"&&!acVisible){e.preventDefault();var s=this.selectionStart;var bef=this.value.lastIndexOf("\n",s-1)+1;var line=this.value.substring(bef,s);var indent=line.match(/^\s*/)[0];var befChar=this.value[s-1];var aftChar=this.value[s];var extra="";if(befChar==="{"||befChar==="("||befChar==="["||befChar===":"){extra="  ";indent+="  "}if((befChar==="}"||befChar===")"||befChar==="]")&&aftChar==="}"){this.value=this.value.substring(0,s)+"\n"+indent+this.value.substring(s);this.selectionStart=this.selectionEnd=s+1+indent.length}else{this.value=this.value.substring(0,s)+"\n"+indent+extra+this.value.substring(s);this.selectionStart=this.selectionEnd=s+1+indent.length+extra.length}doHighlight();updateLineNums()}
    if(e.ctrlKey&&e.key==="d"){e.preventDefault();var s=this.selectionStart,en=this.selectionEnd;if(s!==en){var sel=this.value.substring(s,en);var bef=this.value.lastIndexOf("\n",s-1)+1;this.value=this.value.substring(0,en)+"\n"+sel+this.value.substring(en);this.selectionStart=s+sel.length+1;this.selectionEnd=en+sel.length+1;doHighlight();updateLineNums()}}
  });}

function buildPreviewHtml(content,lang){
  if(lang==="html")return content;
  if(lang==="css")return "<!DOCTYPE html><html><head><style>"+content+"</style></head><body><p>CSS Preview</p></body></html>";
  if(lang==="markdown"){
    var md=content.replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>")
    .replace(/```(\w*)\n([\s\S]*?)```/g,"<pre><code>$2</code></pre>").replace(/`([^`]+)`/g,"<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>")
    .replace(/^> (.+)$/gm,"<blockquote>$1</blockquote>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/\n\n/g,"<br><br>");
    return "<!DOCTYPE html><html><head><style>body{font:14px/1.6 -apple-system,sans-serif;max-width:700px;margin:0 auto;padding:20px;color:#333}code{background:#f4f4f4;padding:2px 6px;border-radius:3px}pre{background:#f4f4f4;padding:12px;border-radius:6px;overflow-x:auto}</style></head><body>"+md+"</body></html>";
  }
  return "<!DOCTYPE html><html><head><style>body{font:13px monospace;padding:20px;background:#1e1e1e;color:#d4d4d4}.o{margin:6px 0;padding:8px;background:#2d2d2d;border-radius:4px}.e{color:#f44747}</style></head><body><div id=\"o\"></div><script>var o=document.getElementById('o');try{"+content+"}catch(e){o.innerHTML='<pre class=e>'+e.message+'</pre>'}<\/script></body></html>";
}

function updatePrev(){
  var t=null;for(var i=0;i<tabs.length;i++){if(tabs[i].id===activeTab){t=tabs[i];break}}if(!t)return;
  var f=findF(FILES,t.fid);if(!f)return;
  var ct=f.ct||"",lg=f.lg||"";
  var html=buildPreviewHtml(ct,lg);
  $("prevframe").src=URL.createObjectURL(new Blob([html],{type:"text/html"}));
}

function setView(m){
  viewMode=m;
  $("btnEd").className="btn"+(m==="editor"?" on":"");
  $("btnSplit").className="btn"+(m==="split"?" on":"");
  $("btnPrev").className="btn"+(m==="preview"?" on":"");
  var pv=$("prevpanel"),rz=$("rsz");
  if(m==="editor"){pv.style.display="none";rz.style.display="none"}
  else if(m==="split"){pv.style.display="flex";pv.style.width="50%";rz.style.display="block";updatePrev()}
  else{pv.style.display="flex";pv.style.width="100%";rz.style.display="none";updatePrev()}
}

var termHistory=[],termHistIdx=-1;
function termPrint(cls,txt){var d=document.createElement("div");d.className="ln "+(cls||"");d.textContent=txt;$("tblog").appendChild(d);$("tblog").scrollTop=$("tblog").scrollHeight}
function termHtml(cls,html){var d=document.createElement("div");d.className="ln "+(cls||"");d.innerHTML=html;$("tblog").appendChild(d);$("tblog").scrollTop=$("tblog").scrollHeight}

function runTermCmd(c){
  var p=c.split(" "),cmd=p[0].toLowerCase();
  var cmds={
    help:function(){termHtml("li","<b>Available commands:</b>");termPrint("","  help       Show this help");termPrint("","  clear      Clear terminal");termPrint("","  echo       Print text");termPrint("","  date       Current date/time");termPrint("","  whoami     User info");termPrint("","  ls         List files");termPrint("","  pwd        Working directory");termPrint("","  cat        Show file content");termPrint("","  neofetch   System info");termPrint("","  theme      Change theme");termPrint("","  calc       Calculator");termPrint("","  history    Command history")},
    clear:function(){$("tblog").innerHTML=""},
    echo:function(){termPrint("",p.slice(1).join(" "))},
    date:function(){termPrint("",new Date().toString())},
    whoami:function(){termHtml("li","developer@hexastudio")},
    pwd:function(){termPrint("","/home/developer/project")},
    ls:function(){termPrint("","src/  styles/  components/  package.json  index.html  README.md")},
    cat:function(){if(p[1]){var f=findF(FILES,p[1]);if(f)termPrint("",f.ct||"(empty)");else termHtml("le","File not found: "+p[1])}else termPrint("lw","Usage: cat <filename>")},
    neofetch:function(){termHtml("li","<b style='color:#bd93f9'>HexaStudio v1.0</b>");termPrint("","OS: Web Browser");termPrint("Shell: HexaShell 1.0");termPrint("Theme: "+curTheme.n)},
    theme:function(){if(p[1]){var found=null;for(var i=0;i<THEMES.length;i++){if(THEMES[i].id===p[1]||THEMES[i].n.toLowerCase()===p[1].toLowerCase()){found=THEMES[i];break}}if(found){applyTheme(found)}else termHtml("le","Theme not found: "+p[1])}else termPrint("","Current: "+curTheme.n+" | Usage: theme <name>")},
    calc:function(){try{var expr=p.slice(1).join("");var result=Function("\"use strict\";return ("+expr+")")();termHtml("li","= "+result)}catch(e){termHtml("le","Invalid expression")}},
    history:function(){termHistory.forEach(function(h,i){termPrint("",(i+1)+"  "+h)})}
  };
  if(cmds[cmd])cmds[cmd]();
  else termHtml("le","Command not found: "+cmd+' (type "help")');
}

initEditor();

var AC_JS="var|let|const|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|from|default|try|catch|finally|throw|async|await|typeof|instanceof|in|of|true|false|null|undefined|void|delete|yield|static|get|set|super|with|debugger".split("|");
var AC_JS2="console|document|window|Math|Array|Object|String|Number|Boolean|Function|Promise|Map|Set|WeakMap|WeakSet|JSON|Date|RegExp|Error|TypeError|RangeError|parseInt|parseFloat|isNaN|isFinite|encodeURI|decodeURI|encodeURIComponent|decodeURIComponent|setTimeout|setInterval|clearTimeout|clearInterval|requestAnimationFrame|cancelAnimationFrame|alert|confirm|prompt|fetch|XMLHttpRequest|Blob|File|FileReader|URL|FormData|HTMLElement|Element|Node|Event|navigator|location|history|localStorage|sessionStorage|screen|performance|crypto|AbortController|AbortSignal|Symbol|Proxy|Reflect|Intl|BigInt|WeakRef|FinalizationRegistry|structuredClone|queueMicrotask|atob|btoa|TextEncoder|TextDecoder|ReadableStream|WritableStream|TransformStream|Headers|Request|Response".split("|");
var AC_HTML="html|head|body|div|span|p|a|h1|h2|h3|h4|h5|h6|ul|ol|li|table|tr|td|th|form|input|button|select|option|textarea|img|video|audio|canvas|svg|script|style|link|meta|title|section|article|aside|header|footer|nav|main|figure|figcaption|details|summary|dialog|template|slot|label|fieldset|legend|datalist|output|progress|meter|source|track|map|area|col|colgroup|caption|thead|tbody|tfoot".split("|");
var AC_CSS="color|background|margin|padding|border|display|position|width|height|top|left|right|bottom|font|text|flex|grid|transform|transition|animation|opacity|overflow|z-index|cursor|content|align|justify|gap|wrap|direction|order|grow|shrink|basis|self|place|float|clear|visibility|outline|box|resize|user|pointer|clip|filter|object|resize|vertical|white|word|letter|line|tab|gap|column|row|area|template|min|max|fit".split("|");
var AC_PY="def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|yield|lambda|pass|break|continue|and|or|not|is|in|True|False|None|del|global|nonlocal|assert|print|self|async|await".split("|");
var AC_TS="interface|type|enum|namespace|module|declare|abstract|implements|readonly|private|protected|public|static|override|abstract|keyof|infer|extends|implements|satisfies|as|is|never|unknown|any|void|string|number|boolean|null|undefined|symbol|bigint|object|Array|Record|Partial|Required|Pick|Omit|Exclude|Extract|ReturnType|Parameters|Promise|Map|Set".split("|");
var acItems=[];
var acIdx=-1;var acVisible=false;
var KW_COLORS={keyword:"h-keyword",string:"h-string",number:"h-number",comment:"h-comment",type:"h-type","function":"h-func",tag:"h-tag",property:"h-prop"};

function getWordAt(s,pos){
  var b=pos-1;while(b>=0&&/[a-zA-Z0-9_]/.test(s[b]))b--;b++;return s.substring(b,pos)}

function getACItems(word,lang){
  var lists=[];
  if(lang==="typescript"||lang==="javascript"){lists.push(AC_JS,AC_JS2)}
  else if(lang==="html"){lists.push(AC_HTML)}
  else if(lang==="css"||lang==="scss"||lang==="less"){lists.push(AC_CSS)}
  else if(lang==="python"){lists.push(AC_PY)}
  else if(lang==="json"){lists.push(AC_JS2)}
  else{lists.push(AC_JS,AC_JS2)}
  var wl=word.toLowerCase();var r=[];
  for(var k=0;k<lists.length;k++){var lst=lists[k];for(var i=0;i<lst.length;i++){if(lst[i].toLowerCase().indexOf(wl)===0&&lst[i]!==word)r.push(lst[i])}}
  return r.slice(0,15)}

function showAC(items){
  var pop=$("acpop");if(!items.length){hideAC();return}
  var ca=$("codearea");var pos=ca.selectionStart;var bef=ca.value.substring(0,pos);var lines=bef.split("\n");var line=lines.length-1;var col=lines[line].length;
  var fontW=8.4;var left=55+col*fontW;var top=(line+1)*22.4-ca.scrollTop;
  acItems=items;acIdx=0;
  var h="";for(var i=0;i<items.length;i++){
    var tp="kw";if(AC_JS2.indexOf(items[i])!==-1)tp="obj";else if(lang==="html")tp="tag";else if(lang==="css"||lang==="scss")tp="css";
    h+='<div class="acitem'+(i===0?" sel":"")+'" data-idx="'+i+'"><span class="ack">'+tp+'</span><span class="acn">'+items[i]+'</span></div>'}
  pop.innerHTML=h;pop.classList.add("vis");pop.style.left=left+"px";pop.style.top=top+"px";acVisible=true}

function hideAC(){$("acpop").classList.remove("vis");acVisible=false;acIdx=-1;acItems=[]}

function insertAC(item){
  var ca=$("codearea");var pos=ca.selectionStart;var bef=ca.value.substring(0,pos);var aft=ca.value.substring(pos);
  var b=pos-1;while(b>=0&&/[a-zA-Z0-9_]/.test(bef[b]))b--;b++;var word=bef.substring(b,pos);
  ca.value=bef.substring(0,b)+item+aft;ca.selectionStart=ca.selectionEnd=b+item.length;
  doHighlight();updateLineNums();ca.focus()}

function acKeyHandler(e){
  if(!acVisible)return false;
  if(e.key==="ArrowDown"){e.preventDefault();acIdx=Math.min(acIdx+1,acItems.length-1);updACSel();return true}
  if(e.key==="ArrowUp"){e.preventDefault();acIdx=Math.max(acIdx-1,0);updACSel();return true}
  if(e.key==="Enter"||e.key==="Tab"){e.preventDefault();if(acIdx>=0&&acIdx<acItems.length)insertAC(acItems[acIdx]);hideAC();return true}
  if(e.key==="Escape"){hideAC();return true}
  return false}

function updACSel(){var els=$("acpop").querySelectorAll(".acitem");for(var i=0;i<els.length;i++){els[i].classList.toggle("sel",i===acIdx)}}

function triggerAC(){
  var ca=$("codearea");var pos=ca.selectionStart;var bef=ca.value.substring(0,pos);var w=getWordAt(bef,pos);
  if(w.length<1){hideAC();return}
  var t=null;for(var i=0;i<tabs.length;i++){if(tabs[i].id===activeTab){t=tabs[i];break}}
  var lang=t?t.lg:"";var items=getACItems(w,lang);showAC(items)}

var findIdx=-1;
function doFind(){var q=$("findInput").value;if(!q){$("findCount").textContent="0 results";return}var txt=codeArea.value;var matches=[];var pos=0;while((pos=txt.toLowerCase().indexOf(q.toLowerCase(),pos))!==-1){matches.push(pos);pos++}$("findCount").textContent=matches.length+" results";if(matches.length>0){findIdx=(findIdx+1)%matches.length;codeArea.focus();codeArea.setSelectionRange(matches[findIdx],matches[findIdx]+q.length)}}

$("terminp").addEventListener("keydown",function(e){
  if(e.key==="Enter"){var v=this.value.trim();if(v){termHistory.push(v);termHistIdx=termHistory.length;termHtml("lp","&#10095; "+esc(v));runTermCmd(v)}this.value=""}
  else if(e.key==="ArrowUp"){e.preventDefault();if(termHistIdx>0){termHistIdx--;this.value=termHistory[termHistIdx]||""}}
  else if(e.key==="ArrowDown"){e.preventDefault();if(termHistIdx<termHistory.length-1){termHistIdx++;this.value=termHistory[termHistIdx]||""}else{termHistIdx=termHistory.length;this.value=""}}
});

$("ctx").onclick=function(e){var ci=walkUp(e.target,"ci");if(!ci)return;var act=ci.getAttribute("data-act");if(act==="save")notify("File saved!");else if(act==="find"){$("findbar").classList.toggle("vis");if($("findbar").classList.contains("vis"))$("findInput").focus()}else if(act==="newfile")notify("New file created");this.style.display="none"};
document.addEventListener("contextmenu",function(e){e.preventDefault();var cm=$("ctx");cm.innerHTML='<div class="ci" data-act="save">Save File</div><div class="ci" data-act="find">Find</div><div class="sep"></div><div class="ci" data-act="newfile">New File</div>';cm.style.display="block";cm.style.left=Math.min(e.clientX,window.innerWidth-200)+"px";cm.style.top=Math.min(e.clientY,window.innerHeight-200)+"px"});
document.addEventListener("click",function(){$("ctx").style.display="none"});

document.addEventListener("dragover",function(e){e.preventDefault()});
document.addEventListener("drop",function(e){
  e.preventDefault();var file=e.dataTransfer.files[0];
  if(file&&file.type==="application/pdf"){var reader=new FileReader();reader.onload=function(ev){var blob=new Blob([ev.target.result],{type:"application/pdf"});var url=URL.createObjectURL(blob);$("empty").style.display="none";$("codewrap").style.display="none";$("pdfwrap").style.display="block";$("pdfview").src=url;var tab={id:"tpdf",fid:"pdf",nm:file.name,lg:"pdf",mod:false};var exists=false;for(var i=0;i<tabs.length;i++){if(tabs[i].lg==="pdf"){exists=true;break}}if(!exists){tabs.push(tab);activeTab=tab.id}$("stlang").textContent="PDF";renderTabs();renderSide();notify("PDF loaded: "+file.name)};reader.readAsArrayBuffer(file)}
});

renderSide();renderTabs();
termHtml("li","HexaStudio Terminal v1.0");
termPrint("lw","Type 'help' for available commands");
termPrint("");

$("btnSide").onclick=function(){sideVis=!sideVis;$("sidebar").classList.toggle("hide",!sideVis);this.className="btn"+(sideVis?" on":"")};
$("btnGit").onclick=function(){gitVis=!gitVis;$("gitpanel").classList.toggle("hide",!gitVis);this.className="btn"+(gitVis?" on":"");if(gitVis)renderGit()};
$("btnTerm").onclick=function(){termVis=!termVis;$("termpanel").classList.toggle("hide",!termVis);this.className="btn"+(termVis?" on":"")};
$("btnCT").onclick=function(){termVis=false;$("termpanel").classList.add("hide");$("btnTerm").className="btn"};
$("btnEd").onclick=function(){setView("editor")};
$("btnSplit").onclick=function(){setView("split")};
$("btnPrev").onclick=function(){setView("preview")};
$("btnFind").onclick=function(){$("findbar").classList.toggle("vis");if($("findbar").classList.contains("vis"))$("findInput").focus()};
$("btnTheme").onclick=function(){renderThemes();$("tmod").classList.add("vis")};
$("ctmod").onclick=function(){$("tmod").classList.remove("vis")};
$("tmod").onclick=function(e){if(e.target===this)this.classList.remove("vis")};
$("btnRP").onclick=function(){updatePrev()};
$("findInput").addEventListener("input",function(){findIdx=-1;doFind()});
$("findNext").onclick=function(){doFind()};
$("findPrev").onclick=function(){findIdx-=2;if(findIdx<-1)findIdx=-1;doFind()};
$("findClose").onclick=function(){$("findbar").classList.remove("vis")};

$("tgrid").onclick=function(e){var c=walkUp(e.target,"tc");if(!c)return;var tid=c.getAttribute("data-theme");for(var i=0;i<THEMES.length;i++){if(THEMES[i].id===tid){applyTheme(THEMES[i]);break}}$("tmod").classList.remove("vis")};
$("sidebar").onclick=function(e){var ti=walkUp(e.target,"ti");if(!ti)return;var id=ti.getAttribute("data-id"),tp=ti.getAttribute("data-tp");if(tp==="d")toggleFold(id);else{var f=findF(FILES,id);if(f)openFile(f)}};
$("tabbar").onclick=function(e){var cls=walkUp(e.target,"cls");if(cls){e.stopPropagation();closeTab(cls.getAttribute("data-close"));return}var tab=walkUp(e.target,"tab");if(!tab)return;var tid=tab.getAttribute("data-tid");activeTab=tid;var t=null;for(var i=0;i<tabs.length;i++){if(tabs[i].id===tid){t=tabs[i];break}}if(t){var f=findF(FILES,t.fid);if(f)openFile(f)}renderTabs()};

var resizing=false;
$("rsz").onmousedown=function(e){e.preventDefault();resizing=true;document.body.style.cursor="col-resize";document.body.style.userSelect="none"};
document.onmousemove=function(e){if(!resizing)return;var r=document.querySelector(".main").getBoundingClientRect();$("prevpanel").style.width=Math.max(200,r.right-e.clientX)+"px"};
document.onmouseup=function(){if(resizing){resizing=false;document.body.style.cursor="";document.body.style.userSelect=""}};

document.onkeydown=function(e){
  if(e.ctrlKey&&e.key==="`"){e.preventDefault();termVis=!termVis;$("termpanel").classList.toggle("hide",!termVis);$("btnTerm").className="btn"+(termVis?" on":"")}
  if(e.ctrlKey&&e.key==="b"){e.preventDefault();sideVis=!sideVis;$("sidebar").classList.toggle("hide",!sideVis);$("btnSide").className="btn"+(sideVis?" on":"")}
  if(e.ctrlKey&&e.key==="f"){e.preventDefault();$("findbar").classList.toggle("vis");if($("findbar").classList.contains("vis"))$("findInput").focus()}
  if(e.ctrlKey&&e.key==="s"){e.preventDefault();notify("File saved!");for(var i=0;i<tabs.length;i++){if(tabs[i].id===activeTab){tabs[i].mod=false}}renderTabs()}
};

updateLineNums();

// ==================== DROPDOWN MENUS ====================
var openDD=null;
function closeAllDD(){var dds=document.querySelectorAll(".dropdown");for(var i=0;i<dds.length;i++)dds[i].classList.remove("vis");openDD=null}
function toggleDD(id){var dd=$(id);if(!dd)return;if(openDD&&openDD!==dd){closeAllDD();dd.classList.add("vis");openDD=dd}else if(dd.classList.contains("vis")){dd.classList.remove("vis");openDD=null}else{dd.classList.add("vis");openDD=dd}}

var menuMap={miFile:"ddFile",miEdit:"ddEdit",miView:"ddView",miRun:"ddRun",miHelp:"ddHelp"};
Object.keys(menuMap).forEach(function(k){var el=$(k);if(el){el.addEventListener("click",function(e){e.stopPropagation();toggleDD(menuMap[k])});el.addEventListener("mouseenter",function(){if(openDD){closeAllDD();toggleDD(menuMap[k])}})}});

document.addEventListener("click",function(e){if(!walkUp(e.target,"mi"))closeAllDD()});

var nextId=100;
function showPrompt(title,placeholder,cb){
  $("promptTitle").textContent=title;
  $("promptInput").value="";
  $("promptInput").placeholder=placeholder||"";
  $("prompt").classList.add("vis");
  $("promptInput").focus();
  function ok(){close();cb($("promptInput").value.trim())}
  function close(){$("prompt").classList.remove("vis");$("promptOk").onclick=null;$("promptCancel").onclick=null;$("promptInput").onkeydown=null}
  $("promptOk").onclick=ok;
  $("promptCancel").onclick=close;
  $("promptInput").onkeydown=function(e){if(e.key==="Enter")ok();if(e.key==="Escape")close()}
}
function addFileToTree(name,content,lang){
  var id=""+(++nextId);
  if(!FILES[0])FILES.push({id:""+(++nextId),nm:"workspace",tp:"d",op:true,chi:[]});
  var file={id:id,nm:name,tp:"f",lg:lang||guessLang(name),ct:content||""};
  FILES[0].chi.push(file);
  FILES[0].op=true;
  renderSide();
  openFile(file);
  notify("Created: "+name);
  return file;
}
function guessLang(n){
  var f=n.toLowerCase();
  if(/\.tsx?$/.test(f))return"typescript";
  if(/\.jsx?$/.test(f))return"javascript";
  if(/\.py$/.test(f))return"python";
  if(/\.java$/.test(f))return"java";
  if(/\.cs$/.test(f))return"csharp";
  if(/\.cpp$|\.cc$|\.cxx$|\.hpp$|\.h$/.test(f))return"cpp";
  if(/\.c$/.test(f))return"c";
  if(/\.go$/.test(f))return"go";
  if(/\.rs$/.test(f))return"rust";
  if(/\.rb$/.test(f))return"ruby";
  if(/\.php$/.test(f))return"php";
  if(/\.swift$/.test(f))return"swift";
  if(/\.kt$|\.kts$/.test(f))return"kotlin";
  if(/\.scala$/.test(f))return"scala";
  if(/\.html?$|\.htm$/.test(f))return"html";
  if(/\.css$/.test(f))return"css";
  if(/\.scss$/.test(f))return"scss";
  if(/\.less$/.test(f))return"less";
  if(/\.json$/.test(f))return"json";
  if(/\.xml$/.test(f))return"xml";
  if(/\.ya?ml$/.test(f))return"yaml";
  if(/\.md$|\.markdown$/.test(f))return"markdown";
  if(/\.sql$/.test(f))return"sql";
  if(/\.sh$|\.bash$|\.zsh$/.test(f))return"shell";
  if(/\.ps1$|\.psm1$/.test(f))return"powershell";
  if(f==="dockerfile")return"dockerfile";
  if(/\.txt$/.test(f))return"text";
  if(/\.pdf$/.test(f))return"pdf";
  if(/\.vue$/.test(f))return"javascript";
  if(/\.svelte$/.test(f))return"javascript";
  return"";
}
function addFileFromDisk(file){
  var reader=new FileReader();
  reader.onload=function(ev){
    var content=ev.target.result;
    var id=""+(++nextId);
    var lang=guessLang(file.name);
    var isPdf=file.type==="application/pdf";
    var fObj={id:id,nm:file.name,tp:"f",lg:isPdf?"pdf":lang,ct:isPdf?"":content};
    if(isPdf){var blob=new Blob([content],{type:"application/pdf"});fObj._blobUrl=URL.createObjectURL(blob)}
    FILES[0].chi.push(fObj);FILES[0].op=true;
    renderSide();
    if(isPdf)openPdf(fObj);else openFile(fObj);
    notify("Opened: "+file.name);
  };
  if(file.type==="application/pdf")reader.readAsArrayBuffer(file);
  else reader.readAsText(file);
}
function addFolderFromDisk(files){
  if(!FILES[0])FILES.push({id:""+(++nextId),nm:"workspace",tp:"d",op:true,chi:[]});
  var root=FILES[0];root.op=true;
  for(var i=0;i<files.length;i++){
    var file=files[i];
    var parts=file.webkitRelativePath?file.webkitRelativePath.split("/"):file.name.split("/");
    var current=root;
    for(var j=0;j<parts.length-1;j++){
      var dirName=parts[j];
      var found=null;
      if(current.chi){for(var k=0;k<current.chi.length;k++){if(current.chi[k].nm===dirName&&current.chi[k].tp==="d"){found=current.chi[k];break}}}
      if(!found){found={id:""+(++nextId),nm:dirName,tp:"d",op:true,chi:[]};if(!current.chi)current.chi=[];current.chi.push(found)}
      current=found;
    }
    var fileName=parts[parts.length-1];
    var lang=guessLang(fileName);
    var isPdf=file.type==="application/pdf";
    (function(f,cn,lg,par){
      if(isPdf){var fObj={id:""+(++nextId),nm:cn,tp:"f",lg:"pdf",ct:""};var r=new FileReader();r.onload=function(ev){var blob=new Blob([ev.target.result],{type:"application/pdf"});fObj._blobUrl=URL.createObjectURL(blob)};r.readAsArrayBuffer(f);if(!par.chi)par.chi=[];par.chi.push(fObj)}
      else{var reader2=new FileReader();reader2.onload=function(ev2){var fObj={id:""+(++nextId),nm:cn,tp:"f",lg:lg,ct:ev2.target.result};if(!par.chi)par.chi=[];par.chi.push(fObj);renderSide()};reader2.readAsText(f)}
    })(file,fileName,lang,current);
  }
  renderSide();
  notify("Folder opened: "+files.length+" files");
}

var ddActions={
  newfile:function(){showPrompt("New File","filename.ts",function(name){if(name)addFileToTree(name,"")})},
  newfolder:function(){showPrompt("New Folder","foldername",function(name){if(name){if(!FILES[0])FILES.push({id:""+(++nextId),nm:"workspace",tp:"d",op:true,chi:[]});var id=""+(++nextId);FILES[0].chi.push({id:id,nm:name,tp:"d",op:true,chi:[]});FILES[0].op=true;renderSide();notify("Created folder: "+name)}})},
  save:function(){if(!activeTab)return;var t=null;for(var i=0;i<tabs.length;i++){if(tabs[i].id===activeTab){t=tabs[i];break}}if(!t)return;var f=findF(FILES,t.fid);if(!f)return;
    if(window.showSaveFilePicker){window.showSaveFilePicker({suggestedName:f.nm}).then(function(handle){handle.createWritable().then(function(w){w.write(f.ct||"");w.close();notify("Saved: "+f.nm);t.mod=false;renderTabs()})}).catch(function(){})}
    else{var blob=new Blob([f.ct||""],{type:"text/plain"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=f.nm;a.click();notify("Downloaded: "+f.nm);t.mod=false;renderTabs()}
  },
  saveas:function(){ddActions.save()},
  openfile:function(){$("fileInput").click()},
  opendir:function(){$("folderInput").click()},
  closeTab:function(){if(activeTab)closeTab(activeTab)},
  closeAll:function(){tabs=[];activeTab=null;$("empty").style.display="flex";$("codewrap").style.display="none";renderTabs()},
  undo:function(){if(codeArea){codeArea.focus();document.execCommand("undo")}},
  redo:function(){if(codeArea){codeArea.focus();document.execCommand("redo")}},
  cut:function(){if(codeArea){codeArea.focus();document.execCommand("cut")}},
  copy:function(){if(codeArea){codeArea.focus();document.execCommand("copy")}},
  paste:function(){navigator.clipboard.readText().then(function(t){if(codeArea){var s=codeArea.selectionStart,e=codeArea.selectionEnd;codeArea.value=codeArea.value.substring(0,s)+t+codeArea.value.substring(e);codeArea.selectionStart=codeArea.selectionEnd=s+t.length;updateLineNums()}}).catch(function(){notify("Paste: Use Ctrl+V")})},
  find:function(){$("findbar").classList.toggle("vis");if($("findbar").classList.contains("vis"))$("findInput").focus()},
  replace:function(){notify("Replace: Ctrl+H")},
  selectAll:function(){if(codeArea){codeArea.focus();codeArea.select()}},
  duplicateLine:function(){if(codeArea){var s=codeArea.selectionStart,e=codeArea.selectionEnd;var start=codeArea.value.lastIndexOf("\n",s-1)+1;var end=codeArea.value.indexOf("\n",e);if(end===-1)end=codeArea.value.length;var line=codeArea.value.substring(start,end);codeArea.value=codeArea.value.substring(0,end)+"\n"+line+codeArea.value.substring(end);updateLineNums()}},
  deleteLine:function(){if(codeArea){var s=codeArea.selectionStart;var start=codeArea.value.lastIndexOf("\n",s-1)+1;var end=codeArea.value.indexOf("\n",s);if(end===-1)end=codeArea.value.length;codeArea.value=codeArea.value.substring(0,start)+codeArea.value.substring(end);codeArea.selectionStart=codeArea.selectionEnd=start;updateLineNums()}},
  toggleSidebar:function(){$("btnSide").click()},
  toggleTerminal:function(){$("btnTerm").click()},
  toggleGit:function(){$("btnGit").click()},
  viewEditor:function(){setView("editor")},
  viewSplit:function(){setView("split")},
  viewPreview:function(){setView("preview")},
  zoomIn:function(){var fs=parseInt(getComputedStyle(codeArea).fontSize)||14;codeArea.style.fontSize=Math.min(fs+2,24)+"px";$("linenum").style.fontSize=Math.min(fs+2,24)+"px";notify("Font: "+Math.min(fs+2,24)+"px")},
  zoomOut:function(){var fs=parseInt(getComputedStyle(codeArea).fontSize)||14;codeArea.style.fontSize=Math.max(fs-2,8)+"px";$("linenum").style.fontSize=Math.max(fs-2,8)+"px";notify("Font: "+Math.max(fs-2,8)+"px")},
  resetZoom:function(){codeArea.style.fontSize="14px";$("linenum").style.fontSize="14px";notify("Font reset")},
  wordwrap:function(){var ca=$("codearea");if(ca){var isOn=ca.style.whiteSpace==="pre-wrap";ca.style.whiteSpace=isOn?"pre":"pre-wrap";notify("Word Wrap: "+(isOn?"Off":"On"))}},
  minimap:function(){notify("Minimap")},
  linenumbers:function(){var ln=$("linenum");if(ln){var isOff=ln.style.display==="none";ln.style.display=isOff?"block":"none";notify("Line Numbers: "+(isOff?"On":"Off"))}},
  runCode:function(){if(viewMode!=="split")setView("split");updatePrev();notify("Running code...")},
  runFile:function(){ddActions.runCode()},
  debug:function(){notify("Debug started")},
  stopDebug:function(){notify("Debug stopped")},
  openTerminal:function(){notify("External terminal")},
  shortcuts:function(){notify("Ctrl+B: Sidebar | Ctrl+`: Terminal | Ctrl+F: Find | Ctrl+S: Save | Ctrl+D: Duplicate")},
  about:function(){notify("HexaStudio v1.0")},
  docs:function(){notify("hexastudio.dev")},
  feedback:function(){notify("feedback@hexastudio.dev")}
};

$("fileInput").addEventListener("change",function(e){var files=e.target.files;if(files){for(var i=0;i<files.length;i++)addFileFromDisk(files[i])}e.target.value=""});
$("folderInput").addEventListener("change",function(e){var files=e.target.files;if(files&&files.length>0)addFolderFromDisk(files);e.target.value=""});

document.querySelectorAll(".dd-item").forEach(function(item){
  item.addEventListener("click",function(e){
    e.stopPropagation();
    var act=this.getAttribute("data-action");
    if(act&&ddActions[act])ddActions[act]();
    closeAllDD();
  });
});

