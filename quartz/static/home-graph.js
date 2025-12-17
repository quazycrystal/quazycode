function initGraph() {
    const container = document.getElementById('image-graph');
    if (!container) return;

    // [추가됨] 데이터 로딩 대기 로직 (배포 환경에서 데이터가 늦게 뜰 때 대비)
    if (!window.quartzGraphData) {
        if (!window._graphRetry) window._graphRetry = 0;
        if (window._graphRetry < 10) {
            window._graphRetry++;
            // console.log(`[HomeGraph] 데이터 대기 중... (${window._graphRetry}/10)`);
            setTimeout(initGraph, 200);
            return;
        }
        return; // 데이터 없으면 종료
    }

    // 1. 초기화 및 크기 설정
    container.innerHTML = '';
    let width = container.clientWidth;
    let height = container.clientHeight || 600;
    
    const isMobile = () => window.innerWidth < 768; 

    // 원본 데이터 가져오기
    const allNodes = window.quartzGraphData.map(d => ({...d}));
    const links = [];

    // 2. 링크 데이터 생성 & 노드 필터링
    const nodeMap = new Map(allNodes.map(n => [n.id, n]));

    allNodes.forEach(sourceNode => {
        // 내부 링크 연결
        if (sourceNode.links && sourceNode.links.length > 0) {
            sourceNode.links.forEach(targetSlug => {
                if (nodeMap.has(targetSlug)) {
                    links.push({ source: sourceNode.id, target: targetSlug });
                }
            });
        }
        // 외부 링크 강제 연결 (index와)
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

    // 연결된 노드 혹은 index만 남김
    const filteredNodes = allNodes.filter(node => connectedNodeIds.has(node.id) || node.id === "index");

    if (filteredNodes.length === 0) return;

    // 2.5 노드 거리(Depth) 계산
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

    // Fit Scale 계산
    const nodeCount = filteredNodes.length;
    const estimatedDiameter = Math.sqrt(nodeCount) * (isMobile() ? 100 : 120); 
    let fitScale = Math.min(width, height) / estimatedDiameter;
    if (fitScale > 1.0) fitScale = 1.0;
    if (fitScale < 0.3) fitScale = 0.3;

    // 3. 물리 엔진 설정
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

    // 4. 그리기
    const zoom = d3.zoom()
        .scaleExtent([0.1, 5])
        .on("zoom", (event) => g.attr("transform", event.transform));

    const svg = d3.select("#image-graph").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .on("dblclick.zoom", null);

    const g = svg.append("g");

    const link = g.append("g").attr("class", "links")
        .selectAll("line").data(links).enter().append("line")
        .style("stroke", d => d.type === "external" ? "#ffab91" : "#ccc") 
        .style("stroke-dasharray", d => d.type === "external" ? "4,4" : "none")
        .style("stroke-width", "1.5px");

    const node = g.append("g").attr("class", "nodes")
        .selectAll("g").data(filteredNodes).enter().append("g")
        .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
        .on("click", (event, d) => { 
            // [수정됨] 클릭 시 경로 처리 강화
            if (d.link.startsWith('http')) {
                window.location.href = d.link;
            } else {
                // Quartz의 SPA 라우팅 방식 혹은 일반 이동
                const target = d.link; 
                window.location.href = target;
            }
        });

    node.append("circle")
        .attr("r", d => d.size / 2)
        .style("fill", "#fff")
        .style("stroke", "#546e7a")
        .style("stroke-width", "2px");

    node.append("image")
        .attr("xlink:href", d => d.imgUrl)
        .attr("width", d => d.size).attr("height", d => d.size)
        .attr("x", d => -d.size / 2).attr("y", d => -d.size / 2)
        .attr("clip-path", d => `circle(${d.size/2}px at ${d.size/2}px ${d.size/2}px)`)
        .on("error", function() { d3.select(this).style("display", "none"); });

    node.append("text")
        .text(d => d.title.length > 10 ? d.title.substring(0, 10) + "..." : d.title)
        .attr("dy", d => (d.size / 2) + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#ffffffff")
        .style("pointer-events", "none");

    // 5. 업데이트
    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    const initialTranslateX = (width - width * fitScale) / 2;
    const initialTranslateY = (height - height * fitScale) / 2;

    svg.call(zoom.transform, d3.zoomIdentity
        .translate(initialTranslateX, initialTranslateY)
        .scale(fitScale)
    );

    window.addEventListener("resize", () => {
        width = container.clientWidth;
        height = container.clientHeight;
        svg.attr("width", width).attr("height", height);
        simulation.force("center", d3.forceCenter(width / 2, height / 2));
        simulation.alpha(0.3).restart();
    });

    function dragstarted(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
    function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
    function dragended(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }
}

// [추가됨] SPA 네비게이션 대응 (페이지 이동 시 그래프 재로딩)
window.addEventListener("nav", () => {
    if (document.getElementById('image-graph')) {
        initGraph();
    }
});

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGraph);
} else {
    initGraph();
}