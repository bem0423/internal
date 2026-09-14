document.addEventListener('DOMContentLoaded',()=>{
  const page = document.body.dataset.page || '';

  // common assets
  const skills = [
    '생산관리','현장관리','고객응대','멘토링','프로젝트관리','전기설비','용접','사무행정','간호보조','요리',
    '정원관리','회계','디지털문해','스마트폰활용','영어회화','운전','물류관리','판매','교육운영','돌봄'
  ];

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
    doLogin.addEventListener('click',()=>{
      localStorage.setItem('masil_logged_in','1');
      window.location.href = 'profile.html';
    });
    doPension.addEventListener('click',()=>{
      openAuthModal(()=>{ localStorage.setItem('masil_logged_in','1'); window.location.href = 'profile.html'; });
    });
    return;
  }

  if(page === 'profile'){
    // skill picker
    const skillSearch = document.getElementById('skillSearch');
    const skillSuggestions = document.getElementById('skillSuggestions');
    const selectedSkills = document.getElementById('selectedSkills');
    let selected = [];

    function renderSuggestions(q=''){
      skillSuggestions.innerHTML = '';
      const ql = q.trim().toLowerCase();
      skills.filter(s=>s.toLowerCase().includes(ql) && !selected.includes(s)).slice(0,20).forEach(s=>{
        const li = document.createElement('li'); li.textContent = s; li.addEventListener('click',()=>{ addSkill(s); skillSearch.value=''; renderSuggestions(); }); skillSuggestions.appendChild(li);
      });
    }
    function addSkill(s){ if(selected.includes(s)) return; selected.push(s); renderSelected(); }
    function removeSkill(s){ selected = selected.filter(x=>x!==s); renderSelected(); }
    function renderSelected(){ selectedSkills.innerHTML=''; selected.forEach(s=>{ const d=document.createElement('span'); d.className='chip'; d.innerHTML = `${s}<span class="remove">×</span>`; d.querySelector('.remove').addEventListener('click',()=>removeSkill(s)); selectedSkills.appendChild(d); }); }

    skillSearch.addEventListener('input',e=>{ renderSuggestions(e.target.value); });
    renderSuggestions();

    // load saved
    const savedProfile = localStorage.getItem('masil_profile');
    if(savedProfile){ try{ const p=JSON.parse(savedProfile); if(p.skills) { selected = p.skills; renderSelected(); } }catch(e){} }

    document.getElementById('saveSkills').addEventListener('click',()=>{
      const profile = JSON.parse(localStorage.getItem('masil_profile')||'{}');
      profile.skills = selected;
      profile.updated = Date.now();
      localStorage.setItem('masil_profile',JSON.stringify(profile));
      window.location.href = 'categories.html';
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
      window.location.href = 'recommendations.html';
    });

    return;
  }

  if(document.body.dataset.page === 'recommendations'){
    const recList = document.getElementById('recList');
    const loading = document.getElementById('loading');
    // simulate loading
    setTimeout(()=>{
      loading.style.display = 'none'; recList.style.display = 'grid';
      const samples = [
        {title:'부천 제조업 보조',meta:'제조업 15년 · 주 3일 가능',img:'assets/rec1.svg'},
        {title:'지역 역사 답사 모임',meta:'지역활동 · 주말 참여',img:'assets/rec2.svg'},
        {title:'청년 멘토링',meta:'생산관리 경험 · 멘토 희망',img:'assets/rec3.svg'},
        {title:'은퇴기술인 교류',meta:'기술 전수 · 프로젝트형',img:'assets/rec4.svg'},
        {title:'단기 자문 프로젝트',meta:'자문·컨설팅 · 단기',img:'assets/rec5.svg'},
        {title:'지역 안전 봉사',meta:'주말 · 정기봉사',img:'assets/rec6.svg'}
      ];
      samples.forEach(s=>{
        const d = document.createElement('div'); d.className='rec-card'; d.innerHTML = `<img src="${s.img}" alt="rec"><div><strong>${s.title}</strong><div class="muted">${s.meta}</div></div>`; recList.appendChild(d);
      });
    },1200);
  }
});
