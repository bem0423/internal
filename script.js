document.addEventListener('DOMContentLoaded',()=>{
  const page = document.body.dataset.page || '';

  // common assets
  const skills = [
    '생산관리','현장관리','고객응대','멘토링','프로젝트관리','전기설비','용접','사무행정','간호보조','요리',
    '정원관리','회계','디지털문해','스마트폰활용','영어회화','운전','물류관리','판매','교육운영','돌봄'
  ];

  // sample recommendations reused across pages
  const sampleRecs = [
    {id:1,title:'부천 제조업 보조',meta:'제조업 15년 · 주 3일 가능',img:'assets/rec1.svg',tags:['제조업 현장관리'],skills:['생산관리','현장관리'],mid:'파트타임(주3일)'},
    {id:2,title:'지역 역사 답사 모임',meta:'지역활동 · 주말 참여',img:'assets/rec2.svg',tags:['문화관광 안내'],skills:['안내','행사운영'],mid:'주말형'},
    {id:3,title:'청년 멘토링',meta:'생산관리 경험 · 멘토 희망',img:'assets/rec3.svg',tags:['교육·멘토링'],skills:['멘토링','프로젝트관리'],mid:'단기·프로젝트'},
    {id:4,title:'은퇴기술인 교류',meta:'기술 전수 · 프로젝트형',img:'assets/rec4.svg',tags:['자문·컨설팅'],skills:['기술전수','자문'],mid:'단기·프로젝트'},
    {id:5,title:'단기 자문 프로젝트',meta:'자문·컨설팅 · 단기',img:'assets/rec5.svg',tags:['자문·컨설팅'],skills:['자문','프로젝트관리'],mid:'단기·프로젝트'},
    {id:6,title:'지역 안전 봉사',meta:'주말 · 정기봉사',img:'assets/rec6.svg',tags:['공공복지 활동'],skills:['안전관리','봉사'],mid:'주말형'}
  ];

  function renderRecommendations(containerId){
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML=''; container.style.display='grid';
    const profile = JSON.parse(localStorage.getItem('masil_profile')||'{}');
    const userSkills = Array.isArray(profile.skills) ? profile.skills : [];
    const userMajor = profile.major || '';
    const userMid = profile.mid || '';

    function computeScore(item){
      let score = 0; const reasons = [];
      if(userMajor && item.tags && item.tags.some(t=>t === userMajor)){ score += 4; reasons.push('경력 분야가 유사합니다'); }
      if(userMid && item.mid && item.mid === userMid){ score += 2; reasons.push('희망 근무형태가 일치합니다'); }
      const sharedSkills = item.skills.filter(s=> userSkills.includes(s));
      if(sharedSkills.length>0){ score += Math.min(sharedSkills.length,5); reasons.push(`공통 스킬: ${sharedSkills.join(', ')}`); }
      return {score,reasons};
    }

    const scored = sampleRecs.map(s=>{ const r=computeScore(s); return Object.assign({},s,r); });
    scored.sort((a,b)=>b.score - a.score);

    scored.forEach(s=>{
      const d = document.createElement('div'); d.className='job-block';
      const reasonText = s.reasons && s.reasons.length ? s.reasons.join(' · ') : '프로필 기반 추천 내용';
      d.innerHTML = `<strong style="display:block;margin-bottom:8px">${s.title}</strong><div class="muted">${s.meta}</div><div style="margin-top:8px;color:#2b8aef">${reasonText}</div>`;
      container.appendChild(d);
    });
  }

  // hide bottom nav by default; will be shown when profile exists
  document.querySelectorAll('.bottom-nav').forEach(n=>{ n.style.display='none'; });
  // if a profile already exists, show the bottom nav across pages
  if(localStorage.getItem('masil_profile')){
    document.querySelectorAll('.bottom-nav').forEach(n=>{ n.style.display='flex'; });
  }

  function openAuthModal(onSuccess){
    const modalBack = document.createElement('div');
    modalBack.className='modal-backdrop';
    modalBack.innerHTML = `
      <div class="modal">
        <h3>모의 PASS 인증</h3>
        <p class="muted">테스트용 인증입니다. 실제 연동은 백엔드/공공API 필요.</p>
        <input id="mockName" placeholder="이름 입력">
        <input id="mockPension" placeholder="국민연금 번호(예: 123-45-6789)">
        <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
          <button id="cancelAuth" class="btn">취소</button>
          <button id="doAuth" class="btn primary">인증</button>
        </div>
      </div>`;
    document.body.appendChild(modalBack);
    document.getElementById('cancelAuth').addEventListener('click',()=>modalBack.remove());
    document.getElementById('doAuth').addEventListener('click',()=>{
      const name = document.getElementById('mockName').value || '홍길동';
      const pnum = document.getElementById('mockPension').value || '000-00-0000';
      localStorage.setItem('pension',JSON.stringify({name,pnum,ts:Date.now()}));
      if(typeof onSuccess === 'function') onSuccess({name,pnum});
      modalBack.remove();
    });
  }

  if(page === 'login'){
    const doLogin = document.getElementById('doLogin');
    const doPension = document.getElementById('doPension');
    const loginCard = document.getElementById('loginCard');
    const loginModal = document.getElementById('loginModal');
    const homeRec = document.getElementById('homeRec');

    // if user already has profile, show home recommendations instead of login
    const existing = localStorage.getItem('masil_profile');
    // Always show the platform (recommendations) on the initial page
    if(homeRec){ homeRec.style.display='block'; renderRecommendations('homeRecList'); }
    // If profile exists, hide login and show nav
    if(existing){ if(loginModal) loginModal.style.display='none'; else if(loginCard) loginCard.style.display='none'; document.querySelectorAll('.bottom-nav').forEach(n=>n.style.display='flex'); }

    doLogin.addEventListener('click',()=>{
      localStorage.setItem('masil_logged_in','1');
      window.location.href = 'profile.html';
    });
    doPension.addEventListener('click',()=>{
      openAuthModal(()=>{ localStorage.setItem('masil_logged_in','1'); window.location.href = 'profile.html'; });
    });
    const fillDemo = document.getElementById('fillDemo');
    if(fillDemo){ fillDemo.addEventListener('click',()=>{
      const demo = {
        imageData: 'assets/rec1.svg',
        intro: '데모 사용자 — 생산관리와 멘토 경험이 있습니다.',
        work: [{industry:'제조업 현장관리',years:15},{industry:'소매·판매',years:4}],
        abilities: {'교육·학습':['직업훈련 A'],'자격증':['자격증 A'],'전문분야':['현장관리'],'디지털 활용':['스마트폰활용']},
        major: '제조업 현장관리', mid: '파트타임(주3일)', minor: '현장관리',
        skills: ['생산관리','현장관리','멘토링']
      };
      localStorage.setItem('masil_profile',JSON.stringify(demo));
      if(loginModal) loginModal.style.display='none'; else if(loginCard) loginCard.style.display='none';
      const homeRec = document.getElementById('homeRec'); if(homeRec) homeRec.style.display='block';
      renderRecommendations('homeRecList'); document.querySelectorAll('.bottom-nav').forEach(n=>n.style.display='flex');
    }); }
    return;
  }

  if(page === 'profile'){
    // (스킬 선택 UI 제거) — 단순히 다음으로 이동하는 버튼만 남깁니다.

    // banner auth to import past work (mock)
    const bannerAuth = document.getElementById('bannerAuth');
    bannerAuth.addEventListener('click',()=>{
      openAuthModal((data)=>{
        // mock import of past work
        const imported = [{industry:'제조업 현장관리',years:15},{industry:'소매·판매',years:4}];
        const profile = JSON.parse(localStorage.getItem('masil_profile')||'{}');
        profile.work = profile.work ? profile.work.concat(imported) : imported;
        localStorage.setItem('masil_profile',JSON.stringify(profile));
        renderWork();
      });
    });

    // work map: industries select and tenure
    const industries = ['제조업 현장관리','돌봄 서비스','교육·멘토링','자문·컨설팅','지역행사 운영','문화관광 안내','소매·판매','식음료 서비스','환경·안전 활동','공공복지 활동'];
    const industrySelect = document.getElementById('industrySelect');
    industries.forEach(i=>{ const o=document.createElement('option'); o.value=i; o.textContent=i; industrySelect.appendChild(o); });
    const tenureInput = document.getElementById('tenureInput');
    const addWorkBtn = document.getElementById('addWork');
    const workList = document.getElementById('workList');
    function renderWork(){
      workList.innerHTML='';
      const profile = JSON.parse(localStorage.getItem('masil_profile')||'{}');
      const items = profile.work || [];
      items.forEach((w,idx)=>{
        const li = document.createElement('li'); li.textContent = `${w.industry} — ${w.years}년 `;
        const edit = document.createElement('button'); edit.className='btn'; edit.textContent='수정'; edit.style.marginLeft='8px'; edit.addEventListener('click',()=>{
          industrySelect.value = w.industry; tenureInput.value = w.years; items.splice(idx,1); profile.work = items; localStorage.setItem('masil_profile',JSON.stringify(profile)); renderWork();
        });
        const del = document.createElement('button'); del.className='btn'; del.textContent='삭제'; del.style.marginLeft='6px'; del.addEventListener('click',()=>{ items.splice(idx,1); profile.work = items; localStorage.setItem('masil_profile',JSON.stringify(profile)); renderWork(); });
        li.appendChild(edit); li.appendChild(del); workList.appendChild(li);
      });
    }
    addWorkBtn.addEventListener('click',()=>{
      const industry = industrySelect.value; const years = parseInt(tenureInput.value||0,10);
      if(!industry){ alert('업종을 선택하세요'); return; }
      if(isNaN(years)){ alert('근속기간을 숫자로 입력하세요'); return; }
      const profile = JSON.parse(localStorage.getItem('masil_profile')||'{}');
      profile.work = profile.work || []; profile.work.push({industry,years}); localStorage.setItem('masil_profile',JSON.stringify(profile)); renderWork();
      tenureInput.value='';
    });
    renderWork();

    document.getElementById('toAbilities').addEventListener('click',()=>{
      const profile = JSON.parse(localStorage.getItem('masil_profile')||'{}');
      profile.updated = Date.now();
      localStorage.setItem('masil_profile',JSON.stringify(profile));
      window.location.href = 'abilities.html';
    });

    return;
  }

  if(page === 'categories'){
    const majors = ['제조업 현장관리','돌봄 서비스','교육·멘토링','자문·컨설팅','지역행사 운영','문화관광 안내','소매·판매','식음료 서비스','환경·안전 활동','공공복지 활동'];
    const mids = ['정규(풀타임)','파트타임(주3일)','주말형','단기·프로젝트','재택·원격','교대근무','시간제(오전)','시간제(오후)','자율근무','봉사형'];
    const minors = ['현장관리','고객응대','기술교육','멘토링','행정지원','안전관리','자문','이벤트운영','배송·물류','기술전수'];
    const selMajor = document.getElementById('selMajor');
    const selMid = document.getElementById('selMid');
    const selMinor = document.getElementById('selMinor');
    function fillSelect(el,arr){ el.innerHTML=''; arr.forEach(a=>{ const o=document.createElement('option'); o.value=a; o.textContent=a; el.appendChild(o); }); }
    fillSelect(selMajor,majors); fillSelect(selMid,mids); fillSelect(selMinor,minors);

    // restore saved
    const savedProfile = JSON.parse(localStorage.getItem('masil_profile')||'{}');
    if(savedProfile.major) selMajor.value = savedProfile.major;
    if(savedProfile.mid) selMid.value = savedProfile.mid;
    if(savedProfile.minor) selMinor.value = savedProfile.minor;

    document.getElementById('doRecommend').addEventListener('click',()=>{
      const profile = JSON.parse(localStorage.getItem('masil_profile')||'{}');
      profile.major = selMajor.value; profile.mid = selMid.value; profile.minor = selMinor.value; profile.updated = Date.now();
      localStorage.setItem('masil_profile',JSON.stringify(profile));
      window.location.href = 'summary.html';
    });

    return;
  }

  if(page === 'mymap'){
    const profile = JSON.parse(localStorage.getItem('masil_profile')||'{}');
    const card = document.getElementById('myProfileCard');
    if(!card) return;
    if(!profile || Object.keys(profile).length===0){ card.innerHTML='<div class="muted">프로필이 아직 없습니다. 프로필을 먼저 설정하세요.</div>'; return; }
    let html = '';
    if(profile.imageData) html += `<img src="${profile.imageData}" style="width:120px;border-radius:10px;margin-bottom:12px">`;
    if(profile.intro) html += `<div style="margin-bottom:10px">${profile.intro}</div>`;
    if(profile.work && profile.work.length){ html += '<h4>근무 이력</h4><ul>'; profile.work.forEach(w=>{ html += `<li>${w.industry} — ${w.years}년</li>` }); html += '</ul>'; }
    if(profile.abilities){ html += '<h4>능력</h4>'; Object.keys(profile.abilities).forEach(k=>{ if(profile.abilities[k] && profile.abilities[k].length) { html += `<strong>${k}</strong><ul>`; profile.abilities[k].forEach(it=> html += `<li>${it}</li>`); html += '</ul>'; } }); }
    card.innerHTML = html;
    return;
  }

  if(document.body.dataset.page === 'recommendations'){
    const recList = document.getElementById('recList');
    const loading = document.getElementById('loading');
    setTimeout(()=>{ if(loading) loading.style.display='none'; renderRecommendations('recList'); },800);
  }
  
  if(page === 'neighborhood'){
    const markers = document.querySelectorAll('.map-marker');
    const popup = document.getElementById('mapPopup');
    const card = document.getElementById('mapCard');
    if(!card) return;
    const mapImage = document.getElementById('mapImage');
    if(mapImage){
      mapImage.addEventListener('error', ()=>{
        console.warn('map image failed to load, using fallback');
        mapImage.src = 'assets/rec4.svg';
        mapImage.alt = '지도 이미지(대체)';
      });
    }
    markers.forEach(m=>{
      m.addEventListener('click',(e)=>{
        // position popup near marker using marker's left/top
        popup.style.display='block';
        popup.style.left = m.style.left;
        popup.style.top = m.style.top;
        popup.innerHTML = `<strong>${m.dataset.title}</strong><div class=\"muted\" style=\"font-size:12px;margin-top:6px\">${m.dataset.desc}</div><div style=\"margin-top:8px\"><a href=\"recommendations.html\" class=\"btn primary\">자세히 보기</a></div>`;
      });
    });
    card.addEventListener('click',(ev)=>{
      if(ev.target.classList && ev.target.classList.contains('map-marker')) return;
      if(popup) popup.style.display='none';
    });
    return;
  }
  
  if(page === 'abilities'){
    let activeTab = '교육·학습';
    const tabBtns = document.querySelectorAll('.tab-btn');
    const abilityInput = document.getElementById('abilityInput');
    const addAbility = document.getElementById('addAbility');
    const abilityLists = document.getElementById('abilityLists');
    const profile = JSON.parse(localStorage.getItem('masil_profile')||'{}');
    profile.abilities = profile.abilities || {'교육·학습':[], '자격증':[], '전문분야':[], '디지털 활용':[]};

    function renderAbilities(){
      abilityLists.innerHTML='';
      Object.keys(profile.abilities).forEach(k=>{
        const box = document.createElement('div'); box.style.marginTop='8px'; box.innerHTML = `<strong>${k}</strong>`;
        const ul = document.createElement('ul'); profile.abilities[k].forEach((it,idx)=>{ const li=document.createElement('li'); li.textContent=it; const del=document.createElement('button'); del.className='btn'; del.textContent='삭제'; del.style.marginLeft='8px'; del.addEventListener('click',()=>{ profile.abilities[k].splice(idx,1); localStorage.setItem('masil_profile',JSON.stringify(profile)); renderAbilities(); }); li.appendChild(del); ul.appendChild(li); }); box.appendChild(ul); abilityLists.appendChild(box);
      });
    }
    tabBtns.forEach(b=>{ b.addEventListener('click',()=>{ activeTab=b.dataset.tab; tabBtns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); }); });
    addAbility.addEventListener('click',()=>{
      const v = abilityInput.value.trim(); if(!v) return; profile.abilities[activeTab] = profile.abilities[activeTab] || []; profile.abilities[activeTab].push(v); localStorage.setItem('masil_profile',JSON.stringify(profile)); abilityInput.value=''; renderAbilities();
    });
    renderAbilities();
    document.getElementById('saveAbilities').addEventListener('click',()=>{ window.location.href = 'categories.html'; });
    return;
  }

  if(page === 'summary'){
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const intro = document.getElementById('intro');
    const profile = JSON.parse(localStorage.getItem('masil_profile')||'{}');
    if(profile.imageData) imagePreview.src = profile.imageData;
    if(profile.intro) intro.value = profile.intro;
    imageInput.addEventListener('change',e=>{
      const f = e.target.files[0]; if(!f) return; const reader = new FileReader(); reader.onload = ()=>{ imagePreview.src = reader.result; }; reader.readAsDataURL(f);
    });
    document.getElementById('saveSummary').addEventListener('click',()=>{
      profile.imageData = imagePreview.src; profile.intro = intro.value; localStorage.setItem('masil_profile',JSON.stringify(profile));
      window.location.href = 'check.html';
    });
    return;
  }
});
