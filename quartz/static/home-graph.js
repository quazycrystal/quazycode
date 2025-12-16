// quartz/static/home-graph.js

function initGraph() {
    const container = document.getElementById('image-graph');
    if (!container || !window.quartzGraphData) return;

    // 1. 초기화 및 크기 설정
    container.innerHTML = '';
    let width = container.clientWidth;
    let height = container.clientHeight || 600;
    
    const isMobile = () => window.innerWidth < 768; // 모바일 감지 함수

    // 원본 데이터 가져오기
    const allNodes = window.quartzGraphData.map(d => ({...d}));
    const links = [];

    // ------------------------------------------------------------
    // 2. 링크 데이터 생성 & 노드 필터링
    // ------------------------------------------------------------
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

    if (filteredNodes.length === 0) {
        console.log("[HomeGraph] 표시할 노드가 없습니다.");
        return; 
    }

    // ------------------------------------------------------------
    // [추가됨] 2.5 노드 거리(Depth) 계산 - 자연스러운 펼쳐짐을 위해
    // ------------------------------------------------------------
    // 홈(index)에서부터 몇 칸 떨어져 있는지 계산합니다.
    const adjacencyList = {};
    filteredNodes.forEach(n => adjacencyList[n.id] = []);
    links.forEach(l => {
        if(adjacencyList[l.source]) adjacencyList[l.source].push(l.target);
        if(adjacencyList[l.target]) adjacencyList[l.target].push(l.source);
    });

    const nodeDepths = {}; // 각 노드의 거리 저장
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

    // 깊이 정보가 없는 노드(index와 끊긴 그룹)는 일단 최대 깊이로 간주
    filteredNodes.forEach(n => {
        if (nodeDepths[n.id] === undefined) nodeDepths[n.id] = maxDepth + 1;
    });

    // ------------------------------------------------------------
    // [핵심 기능 1] 화면에 딱 맞는 배율(Fit Scale) 계산
    // ------------------------------------------------------------
    // 노드 개수가 많을수록 그래프가 넓어지므로, 이를 기반으로 지름을 추정합니다.
    const nodeCount = filteredNodes.length;
    // 노드 하나당 공간을 대략 60~80px로 잡고 제곱근을 사용하여 지름 추정
    const estimatedDiameter = Math.sqrt(nodeCount) * (isMobile() ? 100 : 120); 
    
    // 화면 너비/높이 중 작은 쪽을 기준으로 배율 설정
    let fitScale = Math.min(width, height) / estimatedDiameter;

    // 배율이 너무 크거나 작지 않게 제한 (최소 0.3배 ~ 최대 1.0배)
    if (fitScale > 1.0) fitScale = 1.0;
    if (fitScale < 0.3) fitScale = 0.3;

// ------------------------------------------------------------
    // 3. 물리 엔진 설정 (거리 기반 위치 조정)
    // ------------------------------------------------------------
    const simulation = d3.forceSimulation(filteredNodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(isMobile() ? 50 : 80)) // 거리를 살짝 줄여서 탄탄하게
        .force("charge", d3.forceManyBody().strength(isMobile() ? -150 : -250))
        .force("collide", d3.forceCollide().radius(d => d.size * 0.8).iterations(2));

    // [핵심] 위치 강제 힘 적용
    if (isMobile()) {
        // [모바일] 외부(위) -> 홈(중상단) -> 먼 노드(아래)
        simulation.force("y", d3.forceY(d => {
            if (d.isExternal) return height * 0.1; // 외부 링크는 최상단(10%)
            if (d.id === "index") return height * 0.25; // 홈은 상단(25%)
            
            // 나머지는 깊이에 따라 30% ~ 90% 사이로 쫙 펼침
            const depthRatio = nodeDepths[d.id] / (maxDepth || 1); 
            return (height * 0.3) + (depthRatio * (height * 0.6));
        }).strength(0.5));
        
        // X축은 중앙 유지
        simulation.force("center", d3.forceX(width / 2));
        
    } else {
        // [PC] 외부(왼쪽) -> 홈(왼쪽 중앙) -> 먼 노드(오른쪽)
        simulation.force("x", d3.forceX(d => {
            if (d.isExternal) return width * 0.1; // 외부 링크는 최좌측(10%)
            if (d.id === "index") return width * 0.25; // 홈은 좌측(25%)
            
            // 나머지는 깊이에 따라 30% ~ 90% 사이로 쫙 펼침
            const depthRatio = nodeDepths[d.id] / (maxDepth || 1);
            return (width * 0.3) + (depthRatio * (width * 0.6));
        }).strength(0.4)); // strength가 너무 세면 일자로 정렬되니 적당히(0.4)

        // Y축은 중앙 유지
        simulation.force("center", d3.forceY(height / 2));
    }
    // ------------------------------------------------------------
    // 4. 그리기 (SVG & Zoom)
    // ------------------------------------------------------------
    const zoom = d3.zoom()
        .scaleExtent([0.1, 5])
        .on("zoom", (event) => g.attr("transform", event.transform));

    const svg = d3.select("#image-graph").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .on("dblclick.zoom", null);

    const g = svg.append("g");

    // 선 그리기
    const link = g.append("g").attr("class", "links")
        .selectAll("line").data(links).enter().append("line")
        .style("stroke", d => d.type === "external" ? "#ffab91" : "#ccc") 
        .style("stroke-dasharray", d => d.type === "external" ? "4,4" : "none")
        .style("stroke-width", "1.5px");

    // 노드 그리기
    const node = g.append("g").attr("class", "nodes")
        .selectAll("g").data(filteredNodes).enter().append("g")
        .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
        .on("click", (event, d) => { window.location.href = d.link; });

    node.append("circle")
        .attr("r", d => d.size / 2)
        .style("fill", "#fff")
        .style("stroke", "#546e7a")
        .style("stroke-width", "2px");

    // 이미지
    node.append("image")
        .attr("xlink:href", d => d.imgUrl)
        .attr("width", d => d.size).attr("height", d => d.size)
        .attr("x", d => -d.size / 2).attr("y", d => -d.size / 2)
        .attr("clip-path", d => `circle(${d.size/2}px at ${d.size/2}px ${d.size/2}px)`)
        .on("error", function() { d3.select(this).style("display", "none"); });

    // 텍스트
    node.append("text")
        .text(d => d.title.length > 10 ? d.title.substring(0, 10) + "..." : d.title)
        .attr("dy", d => (d.size / 2) + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#ffffffff")
        .style("pointer-events", "none");

    // ------------------------------------------------------------
    // 5. 업데이트 및 중앙 정렬 적용
    // ------------------------------------------------------------
    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // [핵심 기능 2] 계산된 Fit Scale을 사용하여 초기 화면 중앙 정렬
    // 원리: 물리 엔진은 (w/2, h/2)를 중심으로 잡고 있으므로, 
    // 줌(Zoom) 기능도 (w/2, h/2)가 화면 중앙에 오도록 좌표를 보정합니다.
    const initialTranslateX = (width - width * fitScale) / 2;
    const initialTranslateY = (height - height * fitScale) / 2;

    svg.call(zoom.transform, d3.zoomIdentity
        .translate(initialTranslateX, initialTranslateY)
        .scale(fitScale)
    );

    // [핵심 기능 3] 창 크기 변경(Resize) 시 중앙 재정렬
    window.addEventListener("resize", () => {
        width = container.clientWidth;
        height = container.clientHeight;
        svg.attr("width", width).attr("height", height);
        
        // 물리 엔진 중심점 업데이트
        simulation.force("center", d3.forceCenter(width / 2, height / 2));
        simulation.alpha(0.3).restart();

        // 줌 상태 재계산 (선택 사항: 리사이즈 시 줌을 초기화하려면 아래 주석 해제)
        /*
        const newFitScale = Math.min(width, height) / estimatedDiameter;
        const newTx = (width - width * newFitScale) / 2;
        const newTy = (height - height * newFitScale) / 2;
        svg.call(zoom.transform, d3.zoomIdentity.translate(newTx, newTy).scale(newFitScale));
        */
    });

    // 드래그 함수
    function dragstarted(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
    function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
    function dragended(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGraph);
} else {
    initGraph();
}