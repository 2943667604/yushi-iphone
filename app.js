(() => {
const C=window.PHONE_CONFIG||{},$=id=>document.getElementById(id),device=$("device");
let currentApp="",currentRoom="",pin="",flash=false,chatData=JSON.parse(JSON.stringify(C.messages||{}));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const imageStyle=src=>src?`background-image:url("${esc(src)}")`:"";
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>$("toast").classList.remove("show"),1800)}
function init(){
 document.documentElement.style.setProperty("--accent",C.character?.accent||"#fee500");
 if(C.wallpaper)$("wallpaper").style.backgroundImage=`url("${C.wallpaper}")`;
 const now=new Date();$("statusTime").textContent="11:35";$("lockTime").textContent="11:35";
 $("lockDate").textContent=`${now.getMonth()+1}月${now.getDate()}日 ${["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][now.getDay()]}`;
 $("weekday").textContent=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][now.getDay()];$("dayNum").textContent=now.getDate();
 $("reminderList").innerHTML=(C.reminders||[]).slice(0,2).map(r=>`${esc(r.title)}<span>${esc(r.detail)}</span>`).join("");
 $("city").textContent=C.weather?.city||"首尔 ↗";$("temp").textContent=C.weather?.temp||"18°";$("weatherDesc").textContent=C.weather?.description||"大部晴朗";
 $("notifications").innerHTML=(C.lockNotifications||[]).map(n=>`<div class="notification" data-notif="${esc(n.app)}"><div class="notif-avatar" style="${n.type==="chat"?imageStyle(C.character?.avatar):""}">${n.type==="chat"?"💬":"☷"}</div><div><div class="notif-title">${esc(n.title)}</div><div class="notif-text">${esc(n.text)}</div></div><div class="notif-time">${esc(n.time||"现在")}</div></div>`).join("");
 $("notifications").querySelectorAll(".notification").forEach((el,i)=>el.onclick=()=>openApp(i<2?"kakao":"reminders"));
 const all=[...(C.homeApps||[]),...(C.dockApps||[])];
 $("iosApps").innerHTML=(C.homeApps||[]).map(a=>appIcon(a)).join("");
 $("dock").innerHTML=(C.dockApps||[]).map(a=>appIcon(a,true)).join("");
 document.querySelectorAll("[data-app]").forEach(el=>el.onclick=()=>openApp(el.dataset.app));
 document.querySelectorAll(".ios-app").forEach(el=>el.onclick=()=>openApp(el.dataset.id));
 $("swipeUnlock").onclick=()=>{device.classList.add("pass-open");pin="";drawDots()};
 $("cancelPass").onclick=()=>{device.classList.remove("pass-open");pin="";drawDots()};
 $("keypad").innerHTML=[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map(n=>`<button class="key" data-key="${n}">${n===""?"":n==="⌫"?"⌫":n}${[2,3,4,5,6,7,8,9].includes(n)?`<small>${({2:"ABC",3:"DEF",4:"GHI",5:"JKL",6:"MNO",7:"PQRS",8:"TUV",9:"WXYZ"})[n]}</small>`:""}</button>`).join("");
 $("keypad").querySelectorAll("[data-key]").forEach(b=>b.onclick=()=>keyPress(b.dataset.key));
 $("backHome").onclick=()=>{device.classList.remove("app-open");currentApp="";};
 $("flashlight").onclick=()=>{flash=!flash;$("flashlight").style.background=flash?"#fff5bd":"#160e18cc";toast(flash?"手电筒已打开":"手电筒已关闭")};
 $("searchBtn").onclick=()=>toast("搜索：可以在 config.js 中自定义应用");
}
function appIcon(a,dock=false){let light=["photos","calendar","notes","mail","safari","kakao"].includes(a.id);return `<div class="ios-app" data-id="${esc(a.id)}"><div class="ios-icon ${light?"light":""}" style="background:${esc(a.color||"#fff")}">${esc(a.icon||"✦")}</div><div class="ios-label">${esc(a.name)}</div></div>`}
function drawDots(){$("passDots").querySelectorAll("i").forEach((d,i)=>d.classList.toggle("filled",i<pin.length))}
function keyPress(k){if(k==="⌫")pin=pin.slice(0,-1);else if(k!=="")pin+=k;if(pin.length>=4){if(pin===String(C.passcode||"0511")){device.classList.remove("pass-open");device.classList.add("unlocked");pin="";}else{toast("密码不正确，请重试");pin=""}}drawDots()}
function openApp(id){device.classList.add("unlocked","app-open");currentApp=id;render(id)}
function appHeader(title,back="‹ 主屏幕"){return `<div class="app-top"><button class="backToHome">${back}</button><div class="mini-island"></div><span class="app-signal">▮▮▮ ◉ ▰</span></div>`}
function render(id){
 const body=$("appBody");let html="";
 if(id==="kakao"||id==="messages")html=renderKakaoList();
 else if(id==="photos")html=renderPhotos();
 else if(id==="instagram")html=renderInstagram();
 else if(id==="settings")html=renderSettings();
 else if(id==="phone"||id==="call")html=renderCall();
 else if(id==="voice")html=renderVoice();
 else if(id==="camera")html=`<div class="section-title">相机</div><p class="settings-help">这是模拟界面。你可以把拍摄按钮扩展为上传照片，或直接在 config.js 中添加图片。</p><button class="settings-row" id="fakeShutter">◎　拍摄（模拟）</button>`;
else if(id==="notes")html=`<div class="section-title">备忘录</div><div style="padding:0 16px 20px">${(C.notes||[]).map((n,i)=>`<div style="padding:16px 4px;border-bottom:1px solid #eee"><div style="font-weight:600;font-size:16px;color:#222">${esc(n.title||"无标题")}</div><div style="font-size:12px;color:#999;margin-top:5px">${esc(n.time||"")}</div><div style="font-size:14px;line-height:1.6;color:#555;margin-top:8px;white-space:pre-wrap">${esc(n.content||"")}</div></div>`).join("")||'<p class="settings-help">还没有备忘录，请在 config.js 添加 notes 内容。</p >'}</div>`;
 else if(id==="calendar")html=`<div class="section-title">日历</div><p class="settings-help">${new Date().toLocaleDateString("zh-CN",{year:"numeric",month:"long",day:"numeric",weekday:"long"})}</p>`;
 else if(id==="weather")html=`<div class="section-title">天气</div><p class="settings-help">${esc(C.weather?.city||"首尔")}　${esc(C.weather?.temp||"18°")}<br>${esc(C.weather?.description||"大部晴朗")}</p>`;
 else html=`<div class="section-title">${esc((C.homeApps||[]).concat(C.dockApps||[]).find(a=>a.id===id)?.name||id)}</div><p class="settings-help">这是一个可自定义的模拟应用界面。</p>`;
 body.innerHTML=appHeader()+html;
 body.querySelectorAll(".backToHome").forEach(b=>b.onclick=()=>{device.classList.remove("app-open");currentApp="";});
 body.querySelectorAll("[data-room]").forEach(el=>el.onclick=()=>openRoom(el.dataset.room));
 if(id==="photos")wirePhotos();if(id==="instagram")wireInstagram();if(id==="settings")wireSettings();if(id==="phone"||id==="call")wireCall();if(id==="voice")wireVoice();
 const shutter=$("fakeShutter");if(shutter)shutter.onclick=()=>toast("拍摄功能为演示效果");
}
function renderKakaoList(){
 return `<div class="chat-toolbar"><strong>聊天</strong><span class="tool-icons">⌕　⊕　⚙</span></div><div class="chat-list">${(C.chats||[]).map(c=>`<div class="chat-list-item" data-room="${esc(c.id)}"><div class="chat-avatar" style="${imageStyle(c.avatar)}">${c.avatar?"":"●"}</div><div class="chat-info"><div class="chat-name">${esc(c.name)}</div><div class="chat-preview">${esc(c.preview||"")}</div></div><div class="chat-meta">${esc(c.time||"昨天")}${c.unread?`<div class="unread">${c.unread}</div>`:""}</div></div>`).join("")}</div><div class="kakao-tabs"><span>♙<br>好友</span><span><strong>☏</strong><b>聊天</b></span><span>☻<br>开放聊天</span><span>♧<br>购物</span><span>•••<br>更多</span></div>`;
}
function openRoom(id){currentRoom=id;const room=(C.chats||[]).find(c=>c.id===id)||{name:id};const msgs=chatData[id]||[];const body=$("appBody");body.innerHTML=appHeader()+`<div class="room-header"><div class="chat-avatar" style="${imageStyle(room.avatar||C.character?.avatar)}">●</div><strong>${esc(room.name)}</strong></div><div class="room-log" id="roomLog">${msgs.map(m=>`<div class="bubble-row ${m.from==="me"?"me":""}"><div class="bubble">${esc(m.text)}</div><span class="bubble-time">${esc(m.time||"")}</span></div>`).join("")}</div><form class="compose" id="compose"><input id="messageInput" placeholder="输入消息…" maxlength="500"><button>➤</button></form>`;
 body.querySelector(".backToHome").onclick=()=>render("kakao");$("compose").onsubmit=e=>{e.preventDefault();const inp=$("messageInput"),t=inp.value.trim();if(!t)return;(chatData[id]||(chatData[id]=[])).push({from:"me",text:t,time:"现在"});openRoom(id);$("roomLog").scrollTop=$("roomLog").scrollHeight;};}
function renderPhotos(){const p=C.photos||[];return `<div class="photo-toolbar">选择</div><div class="section-title">图库</div><div class="section-subtitle">${p.length} 张照片</div><div class="photo-month">2026年10月</div><div class="photo-grid">${p.map((x,i)=>`<div class="photo-tile ${x.src?"":"empty"}" data-photo="${i}" style="${imageStyle(x.src)}">${x.src?"":"＋"}</div>`).join("")}</div><p class="settings-help">将你自己的照片放到 assets 文件夹，并在 config.js 的 photos 数组中填写文件名。</p>`}
function wirePhotos(){document.querySelectorAll("[data-photo]").forEach(el=>el.onclick=()=>{const p=C.photos[+el.dataset.photo];if(!p?.src)return toast("请先在 config.js 中设置照片路径");const viewer=document.createElement("div");viewer.className="photo-viewer";viewer.innerHTML=`<button>×</button><img src="${esc(p.src)}" alt="${esc(p.caption||"photo")}">`;viewer.querySelector("button").onclick=()=>viewer.remove();$("appBody").appendChild(viewer);})}

function renderInstagram(){const ig=C.instagram||{},posts=ig.posts||[];return `<div class="ig-head"><span>Instagram</span><span>＋　♡　☰</span></div><div class="ig-profile"><div class="ig-avatar"><div style="${imageStyle(ig.avatar||C.character?.avatar)}"></div></div><div class="ig-stats"><div><b>${posts.length}</b>帖子</div><div><b>1.2万</b>粉丝</div><div><b>328</b>关注</div></div></div><div class="ig-bio"><b>${esc(ig.displayName||C.character?.name||"Your Character")}</b><br>${esc(ig.bio||"daily life ♡")}</div><div class="ig-buttons"><button id="followBtn">关注</button><button id="messageIg">发消息</button></div><div class="ig-post-grid">${posts.map((p,i)=>`<div class="ig-post" data-ig="${i}" style="${imageStyle(p.src)}">${p.src?"":"＋"}</div>`).join("")}</div>`}

function wireInstagram(){const f=$("followBtn");if(f)f.onclick=()=>{f.textContent=f.textContent==="关注"?"已关注":"关注";toast(f.textContent==="已关注"?"已关注":"已取消关注")};const m=$("messageIg");if(m)m.onclick=()=>openApp("kakao");document.querySelectorAll("[data-ig]").forEach(el=>el.onclick=()=>{const p=C.instagram.posts[+el.dataset.ig];if(p?.src){const v=document.createElement("div");v.className="photo-viewer";v.innerHTML=`<button>×</button><img src="${esc(p.src)}">`;v.querySelector("button").onclick=()=>v.remove();$("appBody").appendChild(v)}})}
function renderSettings(){return `<div class="section-title">设置</div><div class="settings-row"><span>人物名称</span><button id="editName">${esc(C.character?.name||"设置")}</button></div><div class="settings-row"><span>更换人物头像</span><button id="avatarPick">选择图片</button></div><div class="settings-row"><span>更换手机壁纸</span><button id="wallPick">选择图片</button></div><div class="settings-row"><span>主题颜色</span><input id="accentPick" type="color" value="${esc(C.character?.accent||"#fee500")}"></div><div class="settings-row"><span>解锁密码</span><button id="editPin">修改说明</button></div><p class="settings-help">网页内临时更换的图片刷新后会恢复。若要永久保存，请将图片放入 assets 文件夹，再修改 config.js。密码默认 0511，也可以在 config.js 中修改。</p><input id="filePicker" type="file" accept="image/*" hidden>`}
function wireSettings(){const pick=$("filePicker");let target="";$("editName").onclick=()=>{const n=prompt("输入人物名称",C.character?.name||"");if(n){C.character.name=n;toast("本次会话已修改名称");render("settings")}};$("avatarPick").onclick=()=>{target="avatar";pick.click()};$("wallPick").onclick=()=>{target="wallpaper";pick.click()};pick.onchange=()=>{const f=pick.files[0];if(!f)return;const u=URL.createObjectURL(f);if(target==="avatar")C.character.avatar=u;else $("wallpaper").style.backgroundImage=`url("${u}")`;toast("图片已临时应用；永久更改请修改 config.js")};$("accentPick").oninput=e=>{document.documentElement.style.setProperty("--accent",e.target.value);C.character.accent=e.target.value};$("editPin").onclick=()=>toast("在 config.js 修改 passcode 字段")}
function renderCall(){return `<div class="call-screen"><div class="call-avatar" style="${imageStyle(C.character?.avatar)}">♡</div><h2>${esc(C.character?.name||"Your Character")}</h2><p id="callStatus">手机通话 · 模拟</p><div class="call-actions"><button class="red" id="decline">×<span>挂断</span></button><button class="green" id="answer">☎<span>接听</span></button></div><div id="callLines"></div><p>此功能为网页模拟，不会拨打真实电话。</p></div>`}
function wireCall(){$("answer").onclick=()=>{ $("callStatus").textContent="通话中 · 00:01";$("callLines").innerHTML=(C.call?.lines||[]).map(x=>`<div class="voice-card">${esc(x)}</div>`).join("");toast("已接通（模拟）")};$("decline").onclick=()=>{toast("通话结束");device.classList.remove("app-open")}}
function renderVoice(){return `<div class="section-title">语音消息</div>${(C.voiceMessages||[]).map(v=>`<div class="voice-card"><b>${esc(v.title)}</b><div style="color:#999;font-size:12px;margin-top:5px">${esc(v.duration||"音频")}</div>${v.src?`<audio controls preload="none" src="${esc(v.src)}"></audio>`:"<p>请在 config.js 设置音频文件路径。</p>"}</div>`).join("")}`}
init();
})();