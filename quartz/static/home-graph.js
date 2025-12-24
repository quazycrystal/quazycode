/**
 * home-graph.js - 최종 통합 및 최적화 버전
 * - 외부 노드 크기 고정 및 화면 자동 맞춤(Auto-fit) 강화
 */

function initGraph() {
  const container = document.getElementById("image-graph")
  if (!container || !window.quartzGraphData) return

  const REPO_NAME = "quazycode"

  // 초기화
  container.innerHTML = ""
  let width = container.clientWidth
  let height = container.clientHeight || 500
  const isMobile = () => window.innerWidth < 768

  // 1. 데이터 가공
  const allNodes = window.quartzGraphData.map((d) => ({ ...d }))
  const links = []
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]))

  allNodes.forEach((sourceNode) => {
    if (sourceNode.links && sourceNode.links.length > 0) {
      sourceNode.links.forEach((targetSlug) => {
        if (nodeMap.has(targetSlug)) {
          links.push({ source: sourceNode.id, target: targetSlug })
        }
      })
    }

    if (sourceNode.isExternal && sourceNode.id !== "index") {
      const alreadyConnected = links.some(
        (l) =>
          (l.source === "index" && l.target === sourceNode.id) ||
          (l.source === sourceNode.id && l.target === "index"),
      )
      if (!alreadyConnected) {
        links.push({ source: "index", target: sourceNode.id, type: "external" })
      }
    }
  })

  const connectedNodeIds = new Set()
  links.forEach((l) => {
    connectedNodeIds.add(l.source)
    connectedNodeIds.add(l.target)
  })

  const filteredNodes = allNodes.filter(
    (node) => connectedNodeIds.has(node.id) || node.id === "index",
  )

  if (filteredNodes.length === 0) return

  // 2. 위계(Degree) 계산
  const degreeMap = new Map()
  filteredNodes.forEach((n) => degreeMap.set(n.id, 0))
  links.forEach((l) => {
    const s = typeof l.source === 'object' ? l.source.id : l.source;
    const t = typeof l.target === 'object' ? l.target.id : l.target;
    degreeMap.set(s, (degreeMap.get(s) || 0) + 1);
    degreeMap.set(t, (degreeMap.get(t) || 0) + 1);
  });

  const minDeg = Math.min(...degreeMap.values())
  const maxDeg = Math.max(...degreeMap.values())

  // 3. 스케일 정의
  const sizeScale = d3.scaleSqrt().domain([minDeg, maxDeg]).range([15, 60])
  const colorScale = d3.scaleLinear().domain([minDeg, maxDeg]).range(["#aaddff", "#ffcf55"])

  // 4. 노드 속성 할당 (외부 노드/인덱스 크기 고정)
  filteredNodes.forEach((n) => {
    const deg = degreeMap.get(n.id) || 0
    n.size = sizeScale(deg)
    n.color = colorScale(deg)

    if (n.id === "index" || n.isExternal === true || n.type === "external") {
      n.size = 75
      n.color = "#ffffff" 
    }
  })

  // 5. [중요] 화면 Fit을 위한 스케일 계산 보정
  // 예측 지름을 더 크게 잡아(120~150) 그래프가 화면 안에 여유 있게 들어오도록 합니다.
  const nodeCount = filteredNodes.length;
  const estimatedDiameter = Math.sqrt(nodeCount) * (isMobile() ? 150 : 200);
  let fitScale = Math.min(width, height) / estimatedDiameter;
  fitScale = Math.max(0.2, Math.min(0.8, fitScale)); // 최대 배율을 0.8로 제한하여 여백 확보

  // 6. 물리 시뮬레이션 - 전체 밸런스 조정 버전
  const simulation = d3.forceSimulation(filteredNodes)
    // [추가] X축 힘: 데스크탑에서 특수 노드를 왼쪽(0.15)으로, 일반 노드를 오른쪽(0.85)으로 당김
  .force("x", d3.forceX(d => {
    const isSpecial = (node) => node.id === "index" || node.isExternal || node.type === "external";
    
    if (isMobile()) return width / 2; // 모바일은 가로 중앙 유지
    return isSpecial(d) ? width * 0.15 : width * 0.85; 
  }).strength(isMobile() ? 0.05 : 0.15))

  // [추가] Y축 힘: 모바일에서 특수 노드를 위쪽(0.15)으로, 일반 노드를 아래쪽(0.85)으로 당김
  .force("y", d3.forceY(d => {
    const isSpecial = (node) => node.id === "index" || node.isExternal || node.type === "external";
    
    if (isMobile()) return isSpecial(d) ? height * 0.15 : height * 0.85;
    return height / 2; // 데스크탑은 세로 중앙 유지
  }).strength(isMobile() ? 0.15 : 0.05))
    // 1. 반발력: 노드들이 서로 밀어내는 힘 (너무 세면 다 날아갑니다)
    .force("charge", d3.forceManyBody().strength(isMobile() ? -200 : -300))
    
    // 2. 충돌 방지: 노드의 실제 부피를 결정 (padding을 20에서 10으로 줄여 촘촘함을 유도)
    .force("collide", d3.forceCollide().radius((d) => (d.size / 2) + 20))
    
    // 3. 중심점: 그래프가 화면 중앙에 머물게 함
    .force("center", d3.forceCenter(width / 2, height / 2))
    
    // 4. 링크 거리: 핵심 조절부
    .force("link", d3.forceLink(links)
      .id((d) => d.id)
      .distance(d => {
        const isSpecial = (node) => 
          node.id === "index" || 
          node.isExternal === true || 
          node.type === "external";

        const s = d.source;
        const t = d.target;

        // 특별 노드와 연결된 경우: 충돌 반경(약 100)보다 훨씬 크게 설정해서 멀리 보냄
        if (isSpecial(t)|| isSpecial(s)) {
          return isMobile() ? 160 : 240; 
        }
        
        // 일반 노드끼리 연결된 경우: 충돌 반경(약 60~80)과 비슷하게 설정해서 촘촘하게 만듦
        return isMobile() ? 40 : 60; 
      })
      // 거리를 지키려는 힘의 세기 (0~1 사이, 1에 가까울수록 엄격하게 거리를 지킵니다)
      .strength(1)
    )
    

  // 7. 렌더링
  const highlightIds = new Set(["index", "Portfolio"])
  const getBaseLinkOpacity = (d) =>
    highlightIds.has(d.source.id) || highlightIds.has(d.target.id) ? 1.0 : 0.6

  const zoom = d3.zoom().scaleExtent([0.1, 5]).on("zoom", (event) => g.attr("transform", event.transform))

  const svg = d3.select("#image-graph").append("svg")
    .attr("width", width).attr("height", height)
    .call(zoom).on("dblclick.zoom", null)

  const g = svg.append("g")

  const link = g.append("g").attr("class", "links")
    .selectAll("line").data(links).enter().append("line")
    .attr("class", "link")
    .style("stroke", (d) => highlightIds.has(d.source.id) && highlightIds.has(d.target.id) ? "#ebebec" : "#55bbffff")
    .style("stroke-width", (d) => highlightIds.has(d.source.id) || highlightIds.has(d.target.id) ? "3px" : "1.5px")
    .style("opacity", (d) => getBaseLinkOpacity(d))

  const node = g.append("g").attr("class", "nodes")
    .selectAll("g").data(filteredNodes).enter().append("g")
    .attr("class", "node")
    .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
    .on("click", (e, d) => { window.location.href = d.link })
    .on("mouseover", (e, d) => nodeHover(e, d, true))
    .on("mouseout", (e, d) => nodeHover(e, d, false))

  const ratio = 1.6

  const normalNodes = node.filter((d) => !highlightIds.has(d.id))
  normalNodes.append("circle")
    .attr("r", (d) => d.size / 4)
    .style("fill", (d) => d.color)

  normalNodes.append("text")
    .attr("class", "node-text")
    .text((d) => d.title)
    //.text((d) => (d.title.length > 10 ? d.title.substring(0, 10) + "..." : d.title))
    .attr("dy", (d) => (d.size / 2) + 12)
    .attr("text-anchor", "middle")
    .style("font-size", "11px").style("fill", (d) => d.color)
    .style("stroke", "#161618").style("stroke-width", "3px").style("paint-order", "stroke")

  const highNodes = node.filter((d) => highlightIds.has(d.id))
  highNodes.append("defs").append("clipPath").attr("id", (d) => `clip-${d.id}`)
    .append("rect").attr("width", (d) => d.size * ratio).attr("height", (d) => d.size)
    .attr("rx", 7).attr("ry", 7).attr("x", (d) => -(d.size * ratio) / 2).attr("y", (d) => -d.size / 2)

  highNodes.append("rect").attr("class", "node-rect")
    .attr("width", (d) => d.size * ratio).attr("height", (d) => d.size)
    .attr("rx", 7).attr("ry", 7).attr("x", (d) => -(d.size * ratio) / 2).attr("y", (d) => -d.size / 2)
    .style("fill", "#fff").style("stroke", "#ebebec").style("stroke-width", "3px")

  highNodes.append("image").attr("class", "node-image").attr("xlink:href", (d) => d.imgUrl)
    .attr("width", (d) => d.size * ratio).attr("height", (d) => d.size)
    .attr("x", (d) => -(d.size * ratio) / 2).attr("y", (d) => -d.size / 2)
    .attr("clip-path", (d) => `url(#clip-${d.id})`).attr("preserveAspectRatio", "xMidYMid slice")
    .on("error", function () { d3.select(this).style("display", "none") })

  highNodes.append("text").attr("class", "node-text")
    .text((d) => d.title)
    //.text((d) => (d.title.length > 10 ? d.title.substring(0, 10) + "..." : d.title))
    .attr("dy", (d) => d.size / 2 + 21).attr("text-anchor", "middle")
    .style("font-size", "12px").style("fill", "#ebebec").style("font-weight", "bold")
    .style("stroke", "#161618").style("stroke-width", "3px").style("paint-order", "stroke")

  simulation.on("tick", () => {
    link.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y)
    node.attr("transform", (d) => `translate(${d.x},${d.y})`)
  })

  // 8. [수정] 초기 줌 피트 적용 방식 개선
  // 중앙 점(width/2, height/2)을 기준으로 스케일을 적용합니다.
  svg.call(zoom.transform, d3.zoomIdentity
    .translate(width / 2, height / 2)
    .scale(fitScale)
    .translate(-(width / 2), -(height / 2))
  )

  function nodeHover(event, d, isHovering) {
    const targetNode = d3.select(event.currentTarget)
    if (isHovering) {
      g.selectAll(".node, .link").transition().duration(200).style("opacity", 0.2)
      targetNode.transition().duration(200).style("opacity", 1.0).attr("transform", `translate(${d.x},${d.y}) scale(1.4)`)
    } else {
      g.selectAll(".node").transition().duration(0).style("opacity", 1.0)
      g.selectAll(".link").transition().duration(0).style("opacity", (l) => getBaseLinkOpacity(l))
      targetNode.transition().duration(0).attr("transform", `translate(${d.x},${d.y}) scale(1)`)
    }
  }

  function dragstarted(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
  function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
  function dragended(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }
}

// [실행부 생략 - 기존과 동일]
function safeInit() {
  const container = document.getElementById("image-graph")
  if (container && window.quartzGraphData && container.children.length === 0) {
    initGraph()
  }
}
window.addEventListener("nav", () => setTimeout(safeInit, 100))
const observer = new MutationObserver(() => { if (document.getElementById("image-graph")) safeInit() })
observer.observe(document.body, { childList: true, subtree: true })
if (!window.quartzGraphData) {
  let _data
  Object.defineProperty(window, "quartzGraphData", {
    configurable: true, enumerable: true,
    get: () => _data,
    set: (v) => { _data = v; safeInit(); }
  })
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", safeInit)
else safeInit()