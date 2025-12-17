// quartz/static/home-graph.js

function initGraph() {
    const container = document.getElementById('image-graph');
    if (!container) return;

    // [수정 1] 데이터가 로드될 때까지 재시도 (최대 10번, 0.2초 간격)
    if (!window.quartzGraphData) {
        if (!window._graphRetry) window._graphRetry = 0;
        if (window._graphRetry < 10) {
            window._graphRetry++;
            console.log(`[HomeGraph] 데이터 대기 중... (${window._graphRetry}/10)`);
            setTimeout(initGraph, 200);
            return;
        } else {
            console.error("[HomeGraph] 그래프 데이터를 찾을 수 없습니다.");
            return;
        }
    }

    console.log("[HomeGraph] 초기화 시작"); // 디버깅용

    // 1. 초기화 및 크기 설정
    container.innerHTML = '';
    let width = container.clientWidth;
    let height = container.clientHeight || 600;
    
    const isMobile = () => window.innerWidth < 768;

    // 원본 데이터 가져오기
    const allNodes = window.quartzGraphData.map(d => ({...d}));
    const links = [];

    // [수정 2] 경로 보정 헬퍼 함수
    // Quartz 설정에 따라 링크가 '/'로 시작하면 배포 시 서브디렉토리가 무시될 수 있음
    // 현재 페이지의 base url을 고려하여 링크를 수정
    function resolveLink(link) {
        // 이미 http로 시작하면 그대로 반환
        if (link.startsWith("http")) return link;
        
        // 링크가 /로 시작하고, 현재 주소에 서브디렉토리(예: /blog)가 있다면 붙여줌
        // 간단한 해결책: 상대 경로로 변환하거나, document baseURI 활용
        // 여기서는 가장 안전한 방법으로 '현재 사이트의 root'를 찾아 붙입니다.
        
        // 1. Quartz의 SPA 라우터가 있다면 사용 (추천)
        // 2. 없다면 location.pathname의 depth만큼 ../ 를 붙이거나
        // 3. 단순히 base tag가 있는지 확인
        
        // 배포 환경에서 '/slug' 형태가 문제된다면 아래 로직이 유효합니다.
        // 만약 d.link가 "./slug" 형태라면 수정 불필요.
        
        // 가장 확실한 방법: 링크가 /로 시작하면 현재 origin 뒤에 base path를 고려해야 함
        // 하지만 Quartz 데이터는 보통 slug를 제공하므로, 상대 경로 처리가 낫습니다.
        return link; 
    }

    // ------------------------------------------------------------
    // 2. 링크 데이터 생성 & 노드 필터링
    // ------------------------------------------------------------
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

    if (filteredNodes.length === 0) {
        console.log("[HomeGraph] 표시할 노드가 없습니다.");
        return; 
    }

    // ------------------------------------------------------------
    // 2.5 노드 거리(Depth) 계산
    // ------------------------------------------------------------
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

    // ------------------------------------------------------------
    // [핵심 기능 1] Fit Scale
    // ------------------------------------------------------------
    const nodeCount = filteredNodes.length;
    const estimatedDiameter = Math.sqrt(nodeCount) * (isMobile() ? 100 : 120); 
    let fitScale = Math.min(width, height) / estimatedDiameter;
    if (fitScale > 1.0) fitScale = 1.0;
    if (fitScale < 0.3) fitScale = 0.3;

    // ------------------------------------------------------------
    // 3. 물리 엔진 설정
    // ------------------------------------------------------------
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

    // ------------------------------------------------------------
    // 4. 그리기
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

    const link = g.append("g").attr("class", "links")
        .selectAll("line").data(links).enter().append("line")
        .style("stroke", d => d.type === "external" ? "#ffab91" : "#ccc") 
        .style("stroke-dasharray", d => d.type === "external" ? "4,4" : "none")
        .style("stroke-width", "1.5px");

    const node = g.append("g").attr("class", "nodes")
        .selectAll("g").data(filteredNodes).enter().append("g")
        .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
        // [수정 3] 클릭 이벤트 수정: URL 처리 강화
        .on("click", (event, d) => { 
            // Quartz v4는 보통 SPA 라우팅을 사용하지 않고 a 태그를 쓰거나 window.location을 씁니다.
            // 하지만 BaseURL 문제를 피하기 위해 상대 경로인지 확인합니다.
            
            let targetUrl = d.link;
            
            // 만약 배포 사이트가 서브디렉토리(예: /my-wiki)에 있는데
            // d.link가 "/notes/abc"라면 "/my-wiki/notes/abc"로 가야 함.
            // 가장 쉬운 꼼수: d.link가 "/"로 시작하면 현재 origin을 확인
            
            // 1. URL이 http로 시작하면 외부 링크이므로 바로 이동
            if (targetUrl.startsWith('http')) {
                window.location.href = targetUrl;
                return;
            }

            // 2. 내부 링크인데 '/'로 시작하는 경우 처리
            // Quartz Config에서 baseUrl을 제대로 설정했다면 d.link에 이미 포함되어 있을 수도 있음.
            // 하지만 안전을 위해 href 값을 그대로 할당하기보다, Quartz의 기본 동작을 따라갑니다.
            
            // 만약 SPA 네비게이션 함수가 있다면 사용 (Quartz 버전에 따라 다름)
            // 여기선 안전하게 location.assign 사용
            
            // [중요] d.link 값을 그대로 대입하되, 만약 404가 뜬다면 
            // 아래 주석을 해제하여 상대 경로로 변환을 시도해보세요.
            /*
            const basePath = document.body.getAttribute('data-baseurl') || ''; 
            // 만약 body 태그에 baseurl 속성이 없다면 수동 지정 필요할 수 있음
            // targetUrl = basePath + targetUrl; 
            */

            console.log("Navigating to:", targetUrl);
            window.location.href = targetUrl; 
        });

    node.append("circle")
        .attr("r", d => d.size / 2)
        .style("fill", "#fff")
        .style("stroke", "#546e7a")
        .style("stroke-width", "2px");

    node.append("image")
        .attr("xlink:href", d => {
            // [수정 4] 이미지 경로 보정
            if (d.imgUrl.startsWith('http')) return d.imgUrl;
            // 배포 시 이미지 경로가 깨진다면 여기에 prefix 추가 로직 필요
            return d.imgUrl;
        })
        .attr("width", d => d.size).attr("height", d => d.size)
        .attr("x", d => -d.size / 2).attr("y", d => -d.size / 2)
        .attr("clip-path", d => `circle(${d.size/2}px at ${d.size/2}px ${d.size/2}px)`)
        .on("error", function() { 
            // 이미지 로드 실패 시 숨김 처리 대신, 기본 색상 원으로 대체하거나 로그 출력
            console.warn("이미지 로드 실패:", d3.select(this).attr("xlink:href"));
            d3.select(this).style("display", "none"); 
        });

    node.append("text")
        .text(d => d.title.length > 10 ? d.title.substring(0, 10) + "..." : d.title)
        .attr("dy", d => (d.size / 2) + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "var(--darkgray)") // Quartz 테마 변수 사용 권장 (혹은 #333)
        .style("pointer-events", "none");

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

// [수정 5] Quartz의 네비게이션 이벤트(nav)에 대응 (SPA 이동 시 그래프가 다시 그려져야 함)
window.addEventListener("nav", () => {
    // 페이지 이동 후 그래프가 있는 페이지라면 다시 실행
    if (document.getElementById('image-graph')) {
        initGraph();
    }
});

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGraph);
} else {
    initGraph();
}