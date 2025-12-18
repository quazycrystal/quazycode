/**
 * home-graph.js 
 * - 최적화 버전: 리소스 낭비 방지 및 로딩 안정성 강화
 */

function initGraph() {
    const container = document.getElementById('image-graph');
    if (!container || !window.quartzGraphData) return;

    // -------------------------------------------------------
    // [설정] 이미지 경로 및 기본 정보
    // -------------------------------------------------------
    const REPO_NAME = "quazycode"; 

    function resolveImagePath(url) {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        let cleanPath = url.startsWith('/') ? url.slice(1) : url;
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

        if (isLocal) return "/" + cleanPath;
        if (cleanPath.startsWith(REPO_NAME)) return "/" + cleanPath;
        return "/" + REPO_NAME + "/" + cleanPath;
    }

    // 초기화 및 캔버스 설정
    container.innerHTML = '';
    let width = container.clientWidth;
    let height = container.clientHeight || 500;
    const isMobile = () => window.innerWidth < 768; 

    // 데이터 가공
    const allNodes = window.quartzGraphData.map(d => ({...d}));
    const links = [];
    const nodeMap = new Map(allNodes.map(n => [n.id, n]));

    allNodes.forEach(sourceNode => {
        if (sourceNode.links && sourceNode.links.length > 0) {
            sourceNode.links.forEach(targetSlug => {
                if (nodeMap.has(targetSlug)) {
                    links.push({ source: sourceNode.id, target: targetSlug });
                }
            });
        }
        if (sourceNode.isExternal && sourceNode.id !== "index") {
            const alreadyConnected = links.some(l => 
                (l.source === "index" && l.target === sourceNode.id) ||
                (l.source === sourceNode.id && l.target === "index")
            );
            if (!alreadyConnected) {
                links.push({ source: "index", target: sourceNode.id, type: "external" });
            }
        }
    });

    const connectedNodeIds = new Set();
    links.forEach(l => { connectedNodeIds.add(l.source); connectedNodeIds.add(l.target); });
    const filteredNodes = allNodes.filter(node => connectedNodeIds.has(node.id) || node.id === "index");

    if (filteredNodes.length === 0) return;

    // -------------------------------------------------------
    // [계산] Depth 및 레이아웃
    // -------------------------------------------------------
    const adjacencyList = {};
    filteredNodes.forEach(n => adjacencyList[n.id] = []);
    links.forEach(l => {
        if(adjacencyList[l.source]) adjacencyList[l.source].push(l.target);
        if(adjacencyList[l.target]) adjacencyList[l.target].push(l.source);
    });

    const nodeDepths = {}; 
    const queue = [{ id: "index", depth: 0 }];
    const visited = new Set(["index"]);
    nodeDepths["index"] = 0;
    let maxDepth = 0;

    while (queue.length > 0) {
        const { id, depth } = queue.shift();
        maxDepth = Math.max(maxDepth, depth);
        const neighbors = adjacencyList[id] || [];
        neighbors.forEach(neighborId => {
            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                nodeDepths[neighborId] = depth + 1;
                queue.push({ id: neighborId, depth: depth + 1 });
            }
        });
    }

    filteredNodes.forEach(n => {
        if (nodeDepths[n.id] === undefined) nodeDepths[n.id] = maxDepth + 1;
    });

    const nodeCount = filteredNodes.length;
    const estimatedDiameter = Math.sqrt(nodeCount) * (isMobile() ? 100 : 120); 
    let fitScale = Math.min(width, height) / estimatedDiameter;
    fitScale = Math.max(0.3, Math.min(1.0, fitScale));

    // -------------------------------------------------------
    // [물리] Simulation
    // -------------------------------------------------------
    const simulation = d3.forceSimulation(filteredNodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(isMobile() ? 50 : 80))
        .force("charge", d3.forceManyBody().strength(isMobile() ? -150 : -250))
        .force("collide", d3.forceCollide().radius(d => d.size * 0.8).iterations(2));

    if (isMobile()) {
        simulation.force("y", d3.forceY(d => {
            if (d.isExternal) return height * 0.1;
            if (d.id === "index") return height * 0.25;
            const depthRatio = nodeDepths[d.id] / (maxDepth || 1); 
            return (height * 0.3) + (depthRatio * (height * 0.6));
        }).strength(0.5));
        simulation.force("center", d3.forceX(width / 2));
    } else {
        simulation.force("x", d3.forceX(d => {
            if (d.isExternal) return width * 0.1;
            if (d.id === "index") return width * 0.25;
            const depthRatio = nodeDepths[d.id] / (maxDepth || 1);
            return (width * 0.3) + (depthRatio * (width * 0.6));
        }).strength(0.4));
        simulation.force("center", d3.forceY(height / 2));
    }

    // -------------------------------------------------------
    // [렌더링] SVG 및 요소 생성
    // -------------------------------------------------------
    const highlightIds = new Set(["index", "Portfolio"]);
    const getBaseLinkOpacity = (d) => (highlightIds.has(d.source.id) || highlightIds.has(d.target.id)) ? 1.0 : 0.6;

    const zoom = d3.zoom()
        .scaleExtent([0.1, 5])
        .on("zoom", (event) => g.attr("transform", event.transform));

    const svg = d3.select("#image-graph").append("svg")
        .attr("width", width).attr("height", height)
        .call(zoom).on("dblclick.zoom", null);

    const g = svg.append("g");

    const link = g.append("g").attr("class", "links")
        .selectAll("line").data(links).enter().append("line")
        .attr("class", "link")
        .style("stroke", d => (highlightIds.has(d.source.id) && highlightIds.has(d.target.id)) ? "#ebebec" : "#55bbffff") 
        .style("stroke-width", d => (highlightIds.has(d.source.id) || highlightIds.has(d.target.id)) ? "3px" : "1.5px")
        .style("opacity", d => getBaseLinkOpacity(d));

    const node = g.append("g").attr("class", "nodes")
        .selectAll("g").data(filteredNodes).enter().append("g")
        .attr("class", "node")
        .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
        .on("click", (e, d) => { window.location.href = d.link; })
        .on("mouseover", (e, d) => nodeHover(e, d, true))
        .on("mouseout", (e, d) => nodeHover(e, d, false));

    const ratio = 1.6; 

    // 일반 노드 (Circle)
    const normalNodes = node.filter(d => !highlightIds.has(d.id));
    normalNodes.append("circle").attr("r", d => d.size / 5).style("fill", "#55bbffff");
    normalNodes.append("text").attr("class", "node-text")
        .text(d => d.title.length > 10 ? d.title.substring(0, 10) + "..." : d.title)
        .attr("dy", d => (d.size / 2) + (d.size / 5))
        .attr("text-anchor", "middle").style("font-size", "12px").style("fill","#55bbffff")
        .style("stroke", "#161618").style("stroke-width", "3px").style("paint-order", "stroke").style("stroke-linejoin", "round");

    // 강조 노드 (Image Card)
    const highNodes = node.filter(d => highlightIds.has(d.id));
    highNodes.append("defs").append("clipPath").attr("id", d => `clip-${d.id}`)
        .append("rect").attr("width", d => d.size * ratio).attr("height", d => d.size)
        .attr("rx", 7).attr("ry", 7).attr("x", d => -(d.size * ratio) / 2).attr("y", d => -d.size / 2);

    highNodes.append("rect").attr("class", "node-rect")
        .attr("width", d => d.size * ratio).attr("height", d => d.size)
        .attr("rx", 7).attr("ry", 7).attr("x", d => -(d.size * ratio) / 2).attr("y", d => -d.size / 2)
        .style("fill", "#fff").style("stroke", "#ebebec").style("stroke-width", "3px");

    highNodes.append("image").attr("class", "node-image").attr("xlink:href", d => d.imgUrl)
        .attr("width", d => d.size * ratio).attr("height", d => d.size)
        .attr("x", d => -(d.size * ratio) / 2).attr("y", d => -d.size / 2)
        .attr("clip-path", d => `url(#clip-${d.id})`).attr("preserveAspectRatio", "xMidYMid slice")
        .on("error", function() { d3.select(this).style("display", "none"); });

    highNodes.append("text").attr("class", "node-text")
        .text(d => d.title.length > 10 ? d.title.substring(0, 10) + "..." : d.title)
        .attr("dy", d => (d.size / 2) + 21).attr("text-anchor", "middle")
        .style("font-size", "12px").style("fill", "#ebebec").style("font-weight", "bold")
        .style("stroke", "#161618").style("stroke-width", "3px").style("paint-order", "stroke").style("stroke-linejoin", "round");

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // 초기 줌 위치 설정
    svg.call(zoom.transform, d3.zoomIdentity
        .translate((width - width * fitScale) / 2, (height - height * fitScale) / 2)
        .scale(fitScale));

    // 호버 이벤트 핸들러
    function nodeHover(event, d, isHovering) {
        const targetNode = d3.select(event.currentTarget);
        if (isHovering) {
            g.selectAll(".node, .link").transition().duration(200).style("opacity", 0.2);
            targetNode.transition().duration(200).style("opacity", 1.0)
                .attr("transform", `translate(${d.x},${d.y}) scale(1.8)`);
        } else {
            g.selectAll(".node").transition().duration(0).style("opacity", 1.0);
            g.selectAll(".link").transition().duration(0).style("opacity", l => getBaseLinkOpacity(l));
            targetNode.transition().duration(0).attr("transform", `translate(${d.x},${d.y}) scale(1)`);
        }
    }

    function dragstarted(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
    function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
    function dragended(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }
}

// -------------------------------------------------------
// [실행부] 리소스 최적화 및 안정화 로직
// -------------------------------------------------------

function safeInit() {
    // 1. 컨테이너와 데이터가 모두 존재할 때만 딱 한 번 실행
    const container = document.getElementById('image-graph');
    if (container && window.quartzGraphData) {
        initGraph();
    }
}

// Quartz 내비게이션 대응
window.addEventListener("nav", safeInit);

// 데이터 감시 (Setter 활용 - 리소스 소모 없음)
if (!window.quartzGraphData) {
    let _data;
    Object.defineProperty(window, 'quartzGraphData', {
        configurable: true,
        enumerable: true,
        get: () => _data,
        set: (v) => {
            _data = v;
            safeInit(); // 데이터가 설정되는 순간 실행
        }
    });
}

// 초기 실행 (새로고침 대응)
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeInit);
} else {
    safeInit();
}

let isGraphInitialized = false;

function safeInit() {
    const container = document.getElementById('image-graph');
    
    // 데이터와 컨테이너가 모두 있고, 아직 초기화되지 않았을 때만 실행
    if (container && window.quartzGraphData) {
        // 이미 그래프가 그려져 있다면 중복 실행 방지 (선택 사항)
        if (container.children.length > 0) return; 
        
        console.log("Graph Container Found! Initializing...");
        initGraph();
    }
}

// 1. Quartz 전용 내비게이션 이벤트 (페이지 이동 시)
window.addEventListener("nav", () => {
    // 이동 시마다 다시 체크
    setTimeout(safeInit, 50); // Quartz의 DOM 교체 시간을 벌기 위해 미세한 지연 추가
});

// 2. [핵심] MutationObserver: DOM에 변화가 생길 때마다 #image-graph가 있는지 감시
// 제목을 눌러 index로 올 때 요소가 뒤늦게 생기는 문제를 완벽히 해결합니다.
const observer = new MutationObserver((mutations) => {
    if (document.getElementById('image-graph')) {
        safeInit();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// 3. 데이터 감시 (데이터가 나중에 로드되는 경우 대비)
if (!window.quartzGraphData) {
    let _data;
    Object.defineProperty(window, 'quartzGraphData', {
        configurable: true,
        enumerable: true,
        get: () => _data,
        set: (v) => {
            _data = v;
            safeInit();
        }
    });
}

// 4. 최초 로드 시 실행
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeInit);
} else {
    safeInit();
}