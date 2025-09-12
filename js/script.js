let intervalSec = 30;
let timer;

// 자동 새로고침 대상 (타일 제외)
const imgs = [
  document.getElementById('img-1'),
  document.getElementById('img-2'),
  document.getElementById('img-3'),
  document.getElementById('img-4')
];

// 페이지 최초 로드용 (타일 포함)
const allImgs = [
  ...imgs,
  ...Array.from({ length: 9 }, (_, i) => document.getElementById(`tile-${i + 1}`))
];

function refreshImages(list) {
  list.forEach(img => {
    const base = img.getAttribute('data-src');
    if (!base) return;
    const url = base + (base.includes('?') ? '&' : '?') + 't=' + Date.now();

    const preload = new Image();
    preload.onload = () => {
      img.classList.add('hidden');
      setTimeout(() => {
        img.src = url;
        img.classList.remove('hidden');
      }, 200);
    };
    preload.onerror = () => {
      console.warn('Failed to load image:', url);
    };
    preload.src = url;
  });
}

function refreshAll() {
  refreshImages(imgs); // 자동 새로고침 대상만
}

function startInterval() {
  clearInterval(timer);
  timer = setInterval(refreshAll, intervalSec * 1000);
}

document.getElementById('interval').addEventListener('change', e => {
  intervalSec = parseInt(e.target.value, 10) || 5;
  startInterval();
});

// 페이지 로드 시 실행
refreshImages(allImgs);
startInterval();

window.addEventListener('beforeunload', () => clearInterval(timer));
