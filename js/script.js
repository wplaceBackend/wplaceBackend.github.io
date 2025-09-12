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

/**
 * 이미지를 프레임에 맞춰 확대/축소하면서,
 * 지정한 좌표(cx, cy)를 프레임의 중앙에 오도록 위치시키는 함수입니다.
 *
 * @param {HTMLElement} img - 조정할 <img> 요소
 * @param {number} cx - 원본 이미지에서 중앙에 두고 싶은 X 좌표
 * @param {number} cy - 원본 이미지에서 중앙에 두고 싶은 Y 좌표
 * @param {number} baseScale - 확대 배율 (선택: 미 기재 시 가능한 한 프레임에 맞춤)
 * @param {number} minWidth - 최소 보장 폭 (선택: 미 기재 시 프레임 폭맞춤 없음)
 */
function focusImage(img, cx, cy, baseScale, minWidth = 0) {
  const frame = img.parentElement;
  const frameW = frame.clientWidth;
  const frameH = frame.clientHeight;

  // 원본 타일 1000x1000
  const origW = 1000;
  const origH = 1000;


  const scaleX1 = frameW / (2 * cx);
  const scaleX2 = frameW / (2 * (origW - cx));
  const scaleY1 = frameH / (2 * cy);
  const scaleY2 = frameH / (2 * (origH - cy));

  const coverScale = Math.max(scaleX1, scaleX2, scaleY1, scaleY2);
  const baseOrCover = baseScale ?? coverScale;

  let candidateScale = baseOrCover;
  let gapOccurs = false;
  if (minWidth && minWidth > 0) { // minWidth가 정의되었다면
    const capByROI = frameW / minWidth; // 최소폭이 보장되기 위한 이미지 축소 배율 (폭맞춤)
    candidateScale = Math.min(candidateScale, capByROI); // 선택된 배율 중 더 작은 값 선택 (이미지의 최소 폭보다 프레임의 폭이 좁아지면 capByROI<baseOrCover -> 축소 배율 적용이 필요)
    // const halfHimg = frameH / (2 * candidateScale); // 세로 여백 판단 여부 기준값 (폭 맞춤 축소가 강하게 될 경우, 표시가능한 구역보다 표시해야할 높이가 더 커져 프레임과 이미지 사이 여백 발생)
    // gapOccurs = (cy < halfHimg) || ((origH - cy) < halfHimg); // 여백 발생 여부 판단하는 gapOccurs 계산
  }

  const finalScale = candidateScale; // 여백 발생 시 최소 폭 보장을 포기하고 일반 확대 배율로 계산

  // 계산 로직
  const scaledW = origW * finalScale;
  const scaledH = origH * finalScale;

  // cx, cy를 중앙점으로 잡기 위한 offset 계산
  let offsetX = frameW / 2 - cx * finalScale;
  let offsetY = frameH / 2 - cy * finalScale;

  img.style.width = `${scaledW}px`;
  img.style.height = `${scaledH}px`;
  img.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

// 적용
function applyFocusAll() {
  // 요소 목록
  const focusTargets = [
    { el: document.getElementById("img-1"), cx: 500, cy: 814, minWidth: 164 },
    { el: document.getElementById("img-2"), cx: 220, cy: 196, baseScale: 1.2, minWidth: 361 },
    { el: document.getElementById("img-3"), cx: 607, cy: 622, baseScale: 0.55 },
    { el: document.getElementById("img-4"), cx: 805, cy: 449, baseScale: 0.9 },
  ];

  focusTargets.forEach(t =>
    focusImage(t.el, t.cx, t.cy, t.baseScale, t.minWidth)
  );
}

// 페이지 로드 시 실행
refreshImages(allImgs);
startInterval();
applyFocusAll();

window.addEventListener('beforeunload', () => clearInterval(timer));
window.addEventListener("resize", applyFocusAll); // 창 크기 변경 시마다 위치 재설정
