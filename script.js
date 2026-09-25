(() => {
  const root=document.documentElement;
  const themeBtn=document.getElementById('theme');
  const footTheme=document.getElementById('footTheme');
  const icon=document.getElementById('themeIcon');
  const menu=document.getElementById('menu');
  const nav=document.getElementById('mobileNav');
  const setTheme=t=>{root.dataset.theme=t;localStorage.setItem('neo-theme',t);icon.textContent=t==='dark'?'light_mode':'dark_mode'};
  const toggle=()=>setTheme(root.dataset.theme==='dark'?'light':'dark');
  themeBtn?.addEventListener('click',toggle); footTheme?.addEventListener('click',toggle);
  icon.textContent=root.dataset.theme==='dark'?'light_mode':'dark_mode';
  menu?.addEventListener('click',()=>{const o=nav.classList.toggle('open');menu.querySelector('span').textContent=o?'close':'menu'});
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.querySelector('span').textContent='menu'}));
})();
