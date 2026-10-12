import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

// 문제 풀이 폴더: 이 안의 문서는 "개념"으로 치지 않음
const PROBLEM_FOLDERS = [
  "Algorithm/Baekjoon/",
  "Algorithm/SWEA/",
  "Algorithm/Codetree/",
  "Algorithm/Jungol/",
]
const SMALL_FOLDER = 5 // 이보다 적은 폴더는 "Etc"로 묶음

const CV_URL = "https://quazycrystal.github.io/assets/img/JiwonKim_CV_25-11-14.pdf#toolbar=1"

const PHI = 1.618
const GAP = 10 // 기본 간격 단위(px)
// 카드 사이 간격(px, 트리맵 기준 폭에서). 같은 상위 폴더끼리는 1em, 다른 상위 폴더와는 φ em(≈1.6em)
const EM = 16
const GAP_SAME = EM
const GAP_OTHER = EM * PHI

// 색 규칙
// 허용 팔레트 안에서 채도 높고 밝은 색을 우선 쓰고, 같은 카테고리 안에서는 밝기(HSL L)만 조절함
const CATEGORY_COLORS: Record<string, string> = {
  Algorithm: "#00A5CF",
  Language: "#01EFAC",
  Backend: "#7AE582",
}
// 위에 없는 새 상위 폴더에는 아직 안 쓴 팔레트 색을 순서대로 배정 (서로 잘 구분되는 색부터)
const AUTO_PALETTE = ["#524094", "#25A18E", "#2082A6", "#01CBAE", "#562A83", "#004E64", "#9FFFCB"]
// 카테고리 안에서 큰 폴더 → 작은 폴더로 갈수록 밝기를 최대 +6%씩 올림.
// 폴더가 많으면 밝기 상한(MAX_L)까지의 범위를 폴더 수로 나눠서 끝까지 구분되게 함
const LIGHTNESS_STEP = 6
const MAX_L = 85

// 카드 투명감 (밝기와 투명도만 바꿈)
// - 라이트 모드: 옅은 유리 틴트(LIGHT_TINT) + 같은 색을 아주 어둡게 한 글씨(밝기 INK_L%)
// - 다크 모드: 원래 색을 DARK_ALPHA 로 반투명하게 + 흰 글씨
const LIGHT_TINT = 0.45
const INK_L = 20
const DARK_ALPHA = 0.6

// 레이아웃 단위 → 실제 px (글자 배치 계산용). 트리맵은 최대 폭(w × pxPerUnit)으로 고정.
// 높이는 카드를 배치한 결과로 정해짐 (줄이 늘면 세로로 길어짐)
// cols = 1·2단계용 격자 칸 수, spans = 1·2단계 카드가 차지하는 칸 수 (가로·세로 같음)
// smallCols = 3단계 이하 작은 카드를 한 줄에 몇 개씩 놓을지
const LAYOUTS = [
  { cls: "wide", w: 1000, pxPerUnit: 0.7, cols: 6, spans: [4, 2], smallCols: 4 },
  { cls: "tall", w: 600, pxPerUnit: 0.57, cols: 2, spans: [2, 1], smallCols: 2 },
]

// 위계 규칙. 기준 = 본문 제목(h1) 28px, 한 단계 = ÷√φ (두 단계가 1:φ)
// - 폴더 이름(왼쪽 위, 볼드): 가장 큰 타일에서 28px
// - 숫자(오른쪽 아래, 보통): 가장 큰 타일에서 한 단계 작게 (22px)
// - 키워드: 한 단계 작게(22px) 시작해서 줄이 바뀔 때마다 한 단계씩 작아짐
// 다른 타일은 가장 큰 타일 대비 (넓이 비율)^¼ 로 전체 글자를 함께 줄임
const HEAD_PX = 28
const STEP = Math.sqrt(PHI)
const MIN_PX = 11
const MAX_LINES = 8
// 카드 배치: 모든 카드는 가로형 φ:1. 한 단계 내려갈 때마다 폭이 ½ 이라 작은 카드 2×2 가 큰 카드 자리에 딱 맞음.
// 1·2단계는 φ:1 칸 격자 위에 놓음 (넓은 화면: 1단계 4×4칸 옆에 2단계 2×2칸 두 장이 세로로).
// 3단계 이하 작은 카드는 그 아래에 한 줄 smallCols 개씩 (넓은 화면 ¼ 폭). 4단계는 너무 작아 3단계와 같게.
// 크기 단계는 문서 수 순위: 0 → 1단계, 1~2 → 2단계, 3~6 → 3단계, 나머지 → 4단계
// 상위 폴더마다 새 줄에서 시작하고, 위·왼쪽 빈 칸부터 채움 (마지막 줄만 덜 찰 수 있음)
// 여러 칸 카드도 정확히 φ:1 이 되도록 세로 간격 = 가로 간격 ÷ φ
const TIER_ENDS = [1, 3, 7]

const prettify = (s: string) => s.replace(/_/g, " ")
const isConceptSlug = (slug: string) =>
  !PROBLEM_FOLDERS.some((p) => slug.startsWith(p)) && !(slug.split("/").pop() ?? "").startsWith("_")

const hexToHsl = (hex: string): [number, number, number] => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l * 100]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h =
    max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s * 100, l * 100]
}

const hslToHex = (h: number, s: number, l: number) => {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// 색상(H)과 채도(S)는 그대로 두고 밝기만 바꿈
const adjustLightness = (hex: string, delta: number) => {
  const [h, s, l] = hexToHsl(hex)
  return hslToHex(h, s, Math.min(MAX_L, Math.max(15, l + delta)))
}

const withLightness = (hex: string, l: number) => {
  const [h, s] = hexToHsl(hex)
  return hslToHex(h, s, l)
}

const rgba = (hex: string, alpha: number) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Poppins 기준 대략적인 글자 폭(em)
const textWidth = (s: string, px: number) =>
  [...s].reduce((w, ch) => {
    if (/[ㄱ-힝]/.test(ch)) return w + 1
    if (ch === " ") return w + 0.3
    if (/[A-Z0-9]/.test(ch)) return w + 0.68
    return w + 0.58
  }, 0) * px

type Folder = { name: string; path: string; category: string; docs: string[] }
type Concept = { slug: string; title: string; weight: number }
type Line = { px: number; words: Concept[] }

// 키워드를 무거운 순서대로 줄에 채움. 줄이 바뀔 때마다 글자가 한 단계(÷√φ)씩 작아짐.
// 타일 세로 50% 지점부터 폴더 이름 선까지(boxH) 다 들어가는 줄만 남김
function layoutLines(concepts: Concept[], startPx: number, boxW: number, boxH: number): Line[] {
  if (boxW <= 0 || boxH <= 0) return []
  const lines: Line[] = []
  const queue = [...concepts]
  let usedH = 0
  for (let i = 0; i < MAX_LINES && queue.length > 0; i++) {
    const px = Math.max(MIN_PX, startPx / Math.pow(STEP, i))
    const line: Line = { px, words: [] }
    // 키워드 사이 간격은 글자 크기에 비례 (CSS column-gap: 0.5em 과 같음)
    const colGap = 0.5 * px
    let x = 0
    for (let j = 0; j < queue.length; ) {
      const w = textWidth(queue[j].title, px)
      const next = line.words.length === 0 ? w : x + colGap + w
      if (next <= boxW) {
        line.words.push(queue[j])
        queue.splice(j, 1)
        x = next
      } else {
        j++
      }
    }
    if (line.words.length === 0) break
    // 폴더 이름 선을 넘는 줄은 통째로 뺌
    usedH += px * 1.3
    if (usedH > boxH) break
    lines.push(line)
  }
  return lines
}

type Box = { folder: Folder; x0: number; y0: number; x1: number; y1: number }
// groups = 상위 폴더별 카드 목록 (큰 카드부터)
function gridLayout(
  groups: { folder: Folder; tier: number }[][],
  cols: number,
  spans: number[],
  smallCols: number,
  W: number,
  gSame: number,
  gOther: number,
) {
  const gv = gSame / PHI
  const u = (W - (cols - 1) * gSame) / cols
  const uh = u / PHI
  const su = (W - (smallCols - 1) * gSame) / smallCols
  const sh = su / PHI
  const boxes: Box[] = []
  let y = 0
  groups.forEach((group, gi) => {
    if (gi > 0) y += gOther
    const used: boolean[][] = []
    const free = (r: number, c: number, n: number) => {
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (used[r + i]?.[c + j]) return false
      return true
    }
    let rows = 0
    const big = group.filter((c) => c.tier <= spans.length)
    const small = group.filter((c) => c.tier > spans.length)
    for (const { folder, tier } of big) {
      const n = Math.min(cols, spans[tier - 1])
      let placed = false
      for (let r = 0; !placed; r++) {
        for (let c = 0; c <= cols - n && !placed; c++) {
          if (!free(r, c, n)) continue
          for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) (used[r + i] ??= [])[c + j] = true
          const x0 = c * (u + gSame)
          const y0 = y + r * (uh + gv)
          boxes.push({
            folder,
            x0,
            y0,
            x1: x0 + n * u + (n - 1) * gSame,
            y1: y0 + n * uh + (n - 1) * gv,
          })
          rows = Math.max(rows, r + n)
          placed = true
        }
      }
    }
    if (rows > 0) y += rows * uh + (rows - 1) * gv
    // 작은 카드: 큰 카드 블록 아래에 한 줄 smallCols 개씩
    small.forEach(({ folder }, i) => {
      const r = Math.floor(i / smallCols)
      const c = i % smallCols
      const x0 = c * (su + gSame)
      const y0 = y + (rows > 0 ? gv : 0) + r * (sh + gv)
      boxes.push({ folder, x0, y0, x1: x0 + su, y1: y0 + sh })
    })
    if (small.length > 0) {
      const smallRows = Math.ceil(small.length / smallCols)
      y += (rows > 0 ? gv : 0) + smallRows * sh + (smallRows - 1) * gv
    }
  })
  return { boxes, h: y }
}

export default (() => {
  const HomeGraph: QuartzComponent = ({ allFiles, fileData }: QuartzComponentProps) => {
    // 홈 화면(index)에서만 그림
    if (fileData.slug !== "index") {
      return <></>
    }

    const files = (allFiles ?? []).filter((f: any) => f.slug && f.slug !== "index") as any[]
    const titleOf = new Map<string, string>(
      files.map((f) => [f.slug, prettify(f.frontmatter?.title ?? f.slug.split("/").pop())]),
    )

    // 1. 카테고리 > 2단계 폴더별 문서 (루트에 있는 파일은 제외)
    const folders = new Map<string, Folder>()
    for (const f of files) {
      const parts: string[] = f.slug.split("/")
      if (parts.length < 2) continue
      const category = parts[0]
      const isDirect = parts.length === 2
      const path = isDirect ? category : `${category}/${parts[1]}`
      if (!folders.has(path)) {
        folders.set(path, { name: isDirect ? "Etc" : prettify(parts[1]), path, category, docs: [] })
      }
      folders.get(path)!.docs.push(f.slug)
    }

    // 문서가 아주 적은 폴더는 카테고리별 "Etc" 하나로 묶음 (하나뿐이면 이름 유지)
    for (const category of new Set([...folders.values()].map((f) => f.category))) {
      const small = [...folders.values()].filter(
        (f) => f.category === category && f.docs.length < SMALL_FOLDER && f.path !== category,
      )
      if (small.length < 2) continue
      for (const f of small) folders.delete(f.path)
      const etc = folders.get(category) ?? { name: "Etc", path: category, category, docs: [] }
      etc.docs.push(...small.flatMap((f) => f.docs))
      folders.set(category, etc)
    }

    // 2. 문서 간 연결 (방향 무시) 과 개념 노트 백링크 수
    const neighbors = new Map<string, Set<string>>()
    const backlinks = new Map<string, number>()
    const link = (a: string, b: string) => {
      if (!neighbors.has(a)) neighbors.set(a, new Set())
      neighbors.get(a)!.add(b)
    }
    for (const f of files) {
      for (const target of new Set<string>(f.links ?? [])) {
        if (target === f.slug || !titleOf.has(target)) continue
        link(f.slug, target)
        link(target, f.slug)
        backlinks.set(target, (backlinks.get(target) ?? 0) + 1)
      }
    }

    // 타일별 개념: 폴더 안 개념 노트는 백링크 수, 폴더 밖 개념 노트는 이 폴더 문서와 연결된 수
    const conceptsOf = (folder: Folder): Concept[] => {
      const inFolder = new Set(folder.docs)
      const weights = new Map<string, number>()
      for (const doc of folder.docs) {
        if (isConceptSlug(doc) && backlinks.get(doc)) weights.set(doc, backlinks.get(doc)!)
        for (const other of neighbors.get(doc) ?? []) {
          if (inFolder.has(other) || !isConceptSlug(other)) continue
          weights.set(other, (weights.get(other) ?? 0) + 1)
        }
      }
      return [...weights.entries()]
        .map(([slug, weight]) => ({ slug, title: titleOf.get(slug)!, weight }))
        .sort((a, b) => b.weight - a.weight)
    }

    const categories = [...new Set([...folders.values()].map((f) => f.category))]
      .map((name) => {
        const list = [...folders.values()]
          .filter((f) => f.category === name)
          .sort((a, b) => b.docs.length - a.docs.length)
        return { name, folders: list, count: list.reduce((s, f) => s + f.docs.length, 0) }
      })
      // 가장 큰 폴더의 문서 수 순 (같으면 문서 총수 순) → 문서가 많은 폴더가 위에 보임
      .sort((a, b) => b.folders[0].docs.length - a.folders[0].docs.length || b.count - a.count)

    const categoryColor = new Map<string, string>()
    const unused = AUTO_PALETTE.filter((hex) => !Object.values(CATEGORY_COLORS).includes(hex))
    for (const c of categories) {
      const fixed = CATEGORY_COLORS[c.name]
      categoryColor.set(
        c.name,
        fixed ?? unused.shift() ?? AUTO_PALETTE[categoryColor.size % AUTO_PALETTE.length],
      )
    }
    const colorOf = (category: string) => categoryColor.get(category)!

    const tileColor = new Map<string, string>()
    for (const c of categories) {
      const base = colorOf(c.name)
      const room = MAX_L - hexToHsl(base)[2]
      const step =
        c.folders.length > 1 ? Math.min(LIGHTNESS_STEP, room / (c.folders.length - 1)) : 0
      c.folders.forEach((f, i) => tileColor.set(f.path, adjustLightness(base, i * step)))
    }

    // 크기 단계(tier)는 문서 수 순위로 정함. 상위 폴더 안에서는 큰 카드부터
    const tierOf = new Map<string, number>()
    categories
      .flatMap((c) => c.folders)
      .sort((a, b) => b.docs.length - a.docs.length)
      .forEach((f, rank) => tierOf.set(f.path, TIER_ENDS.filter((end) => rank >= end).length + 1))
    const groups = categories.map((c) =>
      c.folders
        .map((folder) => ({ folder, tier: tierOf.get(folder.path)! }))
        .sort((a, b) => a.tier - b.tier || b.folder.docs.length - a.folder.docs.length),
    )

    // 간격도 레이아웃 단위로 계산해서 트리맵 폭에 비례해 함께 줄어들게 함
    const layouts = LAYOUTS.map((base) => {
      const gSame = GAP_SAME / base.pxPerUnit
      const gOther = GAP_OTHER / base.pxPerUnit
      const { boxes, h } = gridLayout(
        groups,
        base.cols,
        base.spans,
        base.smallCols,
        base.w,
        gSame,
        gOther,
      )
      const maxArea = Math.max(...boxes.map((d) => (d.x1 - d.x0) * (d.y1 - d.y0)))
      return { ...base, h, leaves: boxes, maxArea }
    })

    const conceptCache = new Map([...folders.values()].map((f) => [f.path, conceptsOf(f)]))

    // 3. 포트폴리오 바로가기
    const portfolio = files.find((f) => f.slug.toLowerCase() === "portfolio")
    const portfolioUrl: string | undefined = portfolio?.frontmatter?.externalUrl
    const portfolioImg: string | undefined = portfolio?.frontmatter?.imgUrl

    const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`

    return (
      <div class="home-overview">
        <div class="home-links">
          {portfolio && (
            <a
              class="home-portfolio"
              href={portfolioUrl ?? `./${portfolio.slug}`}
              // 포트폴리오·CV 는 블로그와 같은 도메인이라 Quartz SPA 가 가로채지 않게 data-router-ignore
              {...(portfolioUrl
                ? { target: "_blank", rel: "noopener", "data-router-ignore": "" }
                : {})}
            >
              {portfolioImg && <img src={`./${portfolioImg}`} alt="" loading="lazy" />}
              <span>Art Portfolio</span>
            </a>
          )}
          <a class="home-cv" href={CV_URL} target="_blank" rel="noopener" data-router-ignore="">
            CV
          </a>
        </div>

        <div class="home-categories">
          {categories.map((c) => (
            <span>
              <i style={{ background: colorOf(c.name) }}></i>
              <b>{c.name}</b> {c.count}
            </span>
          ))}
        </div>

        {layouts.map((l) => (
          <div class={`home-treemap ${l.cls}`} style={{ aspectRatio: `${l.w} / ${l.h}` }}>
            {l.leaves.map((leaf) => {
              const folder = leaf.folder
              const count = folder.docs.length
              const tileW = (leaf.x1 - leaf.x0) * l.pxPerUnit
              const tileH = (leaf.y1 - leaf.y0) * l.pxPerUnit
              const size =
                tileW >= 200 && tileH >= 130 ? "lg" : tileW >= 56 && tileH >= 50 ? "sm" : "xs"
              const scale = Math.max(
                0.5,
                Math.pow(((leaf.x1 - leaf.x0) * (leaf.y1 - leaf.y0)) / l.maxArea, 0.25),
              )
              // 이름·키워드·숫자 사이 간격도 여백과 같은 비율로 줄임
              const innerGap = (GAP / 2) * scale
              // 글자 크기는 트리맵 폭 기준(cqw)으로 내보내서 화면 폭이 달라도 계산한 배치가 유지되게 함
              const cq = (v: number) => `${((v / (l.w * l.pxPerUnit)) * 100).toFixed(3)}cqw`
              // 작은 타일에서는 폴더 이름이 한 줄 + 숫자가 들어가도록 줄이되, 최소 글자(MIN_PX) 아래로는 안 줄임
              // (최소 크기에서도 한 줄에 안 들어가면 CSS 가 아래 줄로 넘김)
              const baseNamePx = Math.max(MIN_PX * STEP, HEAD_PX * scale)
              // 카드 안쪽 여백 = 카드에서 가장 큰 글자(폴더 이름) 크기. 여백까지 넣고 폭·높이에 맞춤
              const namePx = Math.max(
                MIN_PX,
                Math.min(
                  baseNamePx,
                  tileW / (textWidth(folder.name, 1) * 1.12 + 2),
                  tileH / (1.15 * (1 + 1 / STEP) + 0.2 + 2),
                ),
              )
              const pad = namePx
              const countPx = Math.max(MIN_PX, namePx / STEP / STEP) // 이름보다 두 단계 작게
              // 키워드는 세로 50% 지점부터. 작은 카드라 한 줄도 안 들어가면 폴더 이름 바로 아래부터
              const concepts = conceptCache.get(folder.path)!
              const wordsW = (tileW - 2 * pad) * 0.92
              const countTop = pad + countPx + innerGap
              let wordsTop: number | undefined
              let lines =
                size === "xs"
                  ? []
                  : layoutLines(concepts, namePx / STEP, wordsW, tileH / 2 - countTop)
              if (lines.length === 0 && size !== "xs") {
                wordsTop = pad + namePx + innerGap
                lines = layoutLines(concepts, namePx / STEP, wordsW, tileH - wordsTop - countTop)
              }
              const color = tileColor.get(folder.path)!
              return (
                <div
                  class={`home-cell ${size}`}
                  style={{
                    left: pct(leaf.x0, l.w),
                    top: pct(leaf.y0, l.h),
                    width: pct(leaf.x1 - leaf.x0, l.w),
                    height: pct(leaf.y1 - leaf.y0, l.h),
                  }}
                >
                  <div
                    class="home-tile"
                    style={{
                      "--tile-light-bg": rgba(color, LIGHT_TINT),
                      "--tile-light-ink": withLightness(color, INK_L),
                      "--tile-dark-bg": rgba(color, DARK_ALPHA),
                      padding: cq(pad),
                    }}
                  >
                    <a
                      class="home-tile-link"
                      href={`./${folder.path}/`}
                      title={`${folder.category} / ${folder.name} · ${count}`}
                      aria-label={`${folder.name} (${count})`}
                    ></a>
                    <span class="name" style={{ fontSize: cq(namePx) }}>
                      {folder.name}
                    </span>
                    {lines.length > 0 && (
                      <div
                        class="words"
                        style={{
                          left: cq(pad),
                          right: cq(pad),
                          bottom: cq(countTop),
                          ...(wordsTop !== undefined ? { top: cq(wordsTop) } : {}),
                        }}
                      >
                        {lines.map((line) => (
                          <div class="line" style={{ fontSize: cq(line.px) }}>
                            {line.words.map((w) => (
                              <a href={`./${w.slug}`} class="internal home-word">
                                {w.title}
                              </a>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    <span
                      class="count"
                      style={{ fontSize: cq(countPx), right: cq(pad), bottom: cq(pad) }}
                    >
                      {count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  HomeGraph.css = `
.home-overview { margin-top: ${GAP * PHI * PHI}px; }

.home-links { display: flex; align-items: center; gap: ${GAP * PHI}px; }
.home-portfolio {
  display: inline-flex; align-items: center; gap: ${GAP * PHI}px;
  padding: 0 !important; background: none !important;
  color: var(--dark) !important; text-decoration: none;
}
.home-portfolio img {
  width: ${Math.round(42 * PHI)}px; height: 42px; object-fit: cover;
  border-radius: 6px; margin: 0; display: block;
  transition: transform 0.2s ease-out;
}
.home-portfolio span { font-weight: 600; font-size: 1rem; }
.home-portfolio:hover img { transform: scale(1.06); }
.home-portfolio:hover span { text-decoration: underline; text-underline-offset: 3px; }
.home-cv {
  display: inline-flex; align-items: center; height: 30px;
  padding: 0 ${GAP * PHI}px !important; border-radius: 6px;
  border: 1px solid var(--lightgray); background: none !important;
  color: var(--dark) !important; font-weight: 600; font-size: 0.9rem; text-decoration: none;
  transition: background-color 0.2s ease-out, border-color 0.2s ease-out;
}
.home-cv:hover { border-color: var(--gray); background: var(--highlight) !important; }

.home-categories {
  display: flex; flex-wrap: wrap; gap: ${GAP / 2}px ${GAP * PHI}px;
  margin: ${GAP * PHI * PHI}px 0 ${GAP}px;
  font-size: 0.9rem; color: var(--gray); font-variant-numeric: tabular-nums;
}
.home-categories span { display: inline-flex; align-items: center; gap: 0.4em; }
.home-categories i { width: 0.65em; height: 0.65em; border-radius: 2px; display: inline-block; }
.home-categories b { color: var(--darkgray); font-weight: 500; }

.home-treemap {
  position: relative; container-type: inline-size;
  width: 100%; max-width: ${LAYOUTS[0].w * LAYOUTS[0].pxPerUnit}px;
}
.home-treemap.tall { display: none; }
@media (max-width: 800px) {
  .home-treemap.wide { display: none; }
  .home-treemap.tall { display: block; }
}

.home-cell { position: absolute; }
.home-tile {
  position: absolute; inset: 0;
  box-sizing: border-box; overflow: hidden; border-radius: 8px;
  display: flex; flex-direction: column;
  transition: transform 0.22s ease-out;
}
.home-tile { background: var(--tile-light-bg); color: var(--tile-light-ink); }
:root[saved-theme="dark"] .home-tile { background: var(--tile-dark-bg); color: #fff; }
.home-cell:hover { z-index: 2; }
.home-cell:hover .home-tile {
  transform: scale(1.06);
}
.home-cell.sm:hover .home-tile, .home-cell.xs:hover .home-tile { transform: scale(1.18); }

.home-tile-link { position: absolute; inset: 0; background: none !important; padding: 0 !important; }
/* 자간은 모든 글자에 같게. 이름·숫자는 글자 위아래 빈 공간을 잘라서 보이는 여백 = padding 이 되게 함 */
.home-tile .count, .home-tile .words, .home-tile .name {
  pointer-events: none; line-height: 1.15; letter-spacing: -0.01em;
}
.home-tile .name, .home-tile .count { text-box: trim-both cap alphabetic; }
.home-tile .name {
  position: relative; align-self: flex-start; max-width: 100%;
  font-weight: 700;
  /* 좁은 카드에서는 말줄임 대신 아래 줄로 넘김 */
  white-space: normal; overflow-wrap: anywhere;
}
.home-tile .count {
  position: absolute;
  font-weight: 400; line-height: 1; font-variant-numeric: tabular-nums;
}
/* 키워드는 타일 세로 50% 지점부터, 숫자 선을 넘으면 잘림 */
.home-tile .words {
  position: absolute; top: 50%; overflow: hidden;
}
.home-tile .line {
  display: flex; column-gap: 0.5em; white-space: nowrap; overflow: hidden; line-height: 1.3;
}
.home-word {
  pointer-events: auto; color: inherit !important; background: none !important;
  padding: 0 !important; white-space: nowrap; font-weight: 400; opacity: 0.72;
  font-size: inherit; line-height: 1.3 !important;
}
.home-word:hover { opacity: 1; text-decoration: underline; text-underline-offset: 2px; }
`

  return HomeGraph
}) satisfies QuartzComponentConstructor
