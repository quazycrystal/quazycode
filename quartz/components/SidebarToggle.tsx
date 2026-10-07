import { QuartzComponent, QuartzComponentConstructor } from "./types"

// 데스크톱·태블릿에서 왼쪽 사이드바를 접고 펴는 버튼. 상태는 localStorage 에 저장.
// 모바일은 Quartz 기본 메뉴를 그대로 씀
const STORAGE_KEY = "sidebar-collapsed"

const SidebarToggle: QuartzComponent = () => {
  return (
    <button class="sidebar-toggle" type="button" aria-label="Toggle sidebar" title="Toggle sidebar">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="9" y1="4" x2="9" y2="20" />
      </svg>
    </button>
  )
}

// 첫 화면이 그려지기 전에 저장된 상태를 적용해서 깜빡임을 막음
SidebarToggle.beforeDOMLoaded = `
try {
  if (localStorage.getItem("${STORAGE_KEY}") === "1") {
    document.documentElement.classList.add("sidebar-collapsed")
  }
} catch {}
`

// 레이아웃 두 곳(본문·목록 페이지)에 들어가서 스크립트가 중복 포함될 수 있으므로 한 번만 등록
SidebarToggle.afterDOMLoaded = `
if (!window.__sidebarToggleBound) {
  window.__sidebarToggleBound = true
  document.addEventListener("click", (e) => {
    if (!e.target.closest || !e.target.closest(".sidebar-toggle")) return
    const root = document.documentElement
    root.classList.add("sidebar-animating")
    const collapsed = root.classList.toggle("sidebar-collapsed")
    try { localStorage.setItem("${STORAGE_KEY}", collapsed ? "1" : "0") } catch {}
    setTimeout(() => root.classList.remove("sidebar-animating"), 300)
  })
}
`

SidebarToggle.css = `
.sidebar-toggle {
  position: fixed; top: 1.5rem; left: 1.5rem; z-index: 10;
  visibility: visible;
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; padding: 0;
  border: none; border-radius: 6px; background: transparent;
  color: var(--darkgray); cursor: pointer;
  transition: background-color 0.2s ease-out, color 0.2s ease-out;
}
.sidebar-toggle:hover { background: var(--highlight); color: var(--dark); }

@media all and (max-width: 800px) {
  .sidebar-toggle { display: none; }
}

@media all and (min-width: 800px) {
  .sidebar-animating .page > #quartz-body { transition: grid-template-columns 0.25s ease-out; }

  /* 접으면 왼쪽 칸을 없애고, 오른쪽 사이드바(목차·백링크)는 태블릿처럼 본문 아래로 내림.
     본문 좌우 여백을 같게 맞춰 내용 폭을 넓힘 */
  html.sidebar-collapsed .page { max-width: none; }
  html.sidebar-collapsed .page > #quartz-body {
    grid-template-columns: 0 auto;
    grid-template-rows: auto auto auto auto;
    grid-template-areas:
      "grid-sidebar-left grid-header"
      "grid-sidebar-left grid-center"
      "grid-sidebar-left grid-sidebar-right"
      "grid-sidebar-left grid-footer";
    padding-left: 4rem; padding-right: 4rem;
  }
  html.sidebar-collapsed .page > #quartz-body .sidebar.left {
    visibility: hidden; overflow: hidden; padding-left: 0; padding-right: 0;
  }
  html.sidebar-collapsed .page > #quartz-body .sidebar.right {
    position: initial; height: unset; width: 100%;
    flex-direction: row; padding: 0;
  }
  html.sidebar-collapsed .page > #quartz-body .sidebar.right > * { flex: 1; max-height: 24rem; }
}
`

export default (() => SidebarToggle) satisfies QuartzComponentConstructor
