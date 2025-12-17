function initGraph() {
    const container = document.getElementById('image-graph');
    if (!container) return;

    // [데이터 로딩 대기]
    if (!window.quartzGraphData) {
        if (!window._graphRetry) window._graphRetry = 0;
        if (window._graphRetry < 10) {
            window._graphRetry++;
            setTimeout(initGraph, 200);
            return;
        }
        return; 
    }

    // -------------------------------------------------------
    // [설정] 이미지 경로 깨짐 방지 함수 (static 폴더 연결용)
    // -------------------------------------------------------
    
    // ⚠️ 중요: 여기에 깃허브 저장소 이름(Repository Name)을 적어주세요.
    // 예: https://quazycrystal.github.io/quazycode/ 라면 -> "quazycode"
    const REPO_NAME = "quazycode"; 

    function resolveImagePath(url) {
        if (!url) return "";
        if (url.startsWith("http")) return url; // 이미 외부 링크면 그대로 둠

        // 1. 앞의 슬래시(/) 제거 (중복 방지)
        let cleanPath = url.startsWith('/') ? url.slice(1) : url;

        // 2. 로컬(localhost)인지 확인
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

        // 3. 경로 생성
        if (isLocal) {
            // 로컬에선 그냥 /static/... 으로 접근
            return "/" + cleanPath;
        } else {
            // 배포 환경에선 /저장소이름/static/... 으로 접근
            // 만약 이미 저장소 이름이 경로에 포함되어 있다면 중복 방지
            if (cleanPath.startsWith(REPO_NAME)) return "/" + cleanPath;
            return "/" + REPO_NAME + "/" + cleanPath;
        }
    }

    // 1. 초기화
    container.innerHTML = '';
    let width = container.clientWidth;
    let height = container.clientHeight || 500;
    
    const isMobile = () => window.innerWidth < 768; 

    const allNodes = window.quartzGraphData.map(d => ({...d}));
    const links = [];

    // 2. 링크 생성 & 필터링
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

    // 2.5 Depth 계산
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
    if (fitScale > 1.0) fitScale = 1.0;
    if (fitScale < 0.3) fitScale = 0.3;

    // 3. 물리 엔진
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
    // 4. 그리기 (하이라이트 및 호버링 준비)
    // ------------------------------------------------------------
    
    // [설정] 강조 ID 목록
    const highlightIds = new Set([
        "index",        
        "Portfolio"
    ]);

    // [헬퍼] 기본 투명도 계산 (호버링 복구 시 사용)
    const getBaseLinkOpacity = (d) => {
        if (highlightIds.has(d.source.id) || highlightIds.has(d.target.id)) return 1.0;
        return 0.6;
    };

    const zoom = d3.zoom()
        .scaleExtent([0.1, 5])
        .on("zoom", (event) => g.attr("transform", event.transform));

    const svg = d3.select("#image-graph").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .on("dblclick.zoom", null);

    const g = svg.append("g");

    // [링크 그리기]
    const link = g.append("g").attr("class", "links")
        .selectAll("line").data(links).enter().append("line")
        .attr("class", "link") // 호버링용 클래스 추가
        .attr("id", d => `link-${d.source.id}-${d.target.id}`) // 호버링용 ID 부여 (source/target은 객체임)
        .style("stroke", d => {
            // 둘 다 강조 대상이면 흰색, 아니면 하늘색
            if (highlightIds.has(d.source.id) && highlightIds.has(d.target.id)) return "#ebebec";
            return "#55bbffff";
        }) 
        .style("stroke-width", d => {
            if (highlightIds.has(d.source.id) || highlightIds.has(d.target.id)) return "3px";
            return "1.5px";
        })
        .style("opacity", d => getBaseLinkOpacity(d)); // 헬퍼 함수 사용

    // [노드 그리기]
    const node = g.append("g").attr("class", "nodes")
        .selectAll("g").data(filteredNodes).enter().append("g")
        .attr("class", "node") // 호버링용 클래스 추가
        .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
        .on("click", (event, d) => { 
            const target = d.link.startsWith('http') ? d.link : d.link;
            window.location.href = target;
        })
        // [이벤트 연결] 여기서 호버링 함수 연결
        .on("mouseover", (event, d) => nodeHover(event, d, true))
        .on("mouseout", (event, d) => nodeHover(event, d, false));

    // [설정] 사각형의 가로 비율 (1.0 = 정사각형, 1.6 = 카드형)
    const ratio = 1.6; 

    // -------------------------------------------------------
    // A. [일반 노드] 하이라이트 리스트에 '없는' 애들은 -> 원(Circle)
    // -------------------------------------------------------
    node.filter(d => !highlightIds.has(d.id))
        .append("circle")
        .attr("r", d => d.size / 5)
        .style("fill", "#55bbffff")
        .style("stroke", "#55bbffff")
        .style("stroke-width", "1.5px")
        
        // B-5. 일반 노드 텍스트 라벨 추가
    node.filter(d => !highlightIds.has(d.id))
        .append("text")
        .attr("class", "node-text") // 호버링용 클래스 추가
        .text(d => d.title.length > 10 ? d.title.substring(0, 10) + "..." : d.title)
        .attr("dy", d => (d.size / 2) + (d.size / 5))
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill","#55bbffff")
        .style("font-weight", "normal")
        .style("pointer-events", "none")
        .style("stroke", "#161618")
        .style("stroke-width", "5px")
        .style("stroke-linejoin", "round")
        .style("paint-order", "stroke"); 

    // -------------------------------------------------------
    // B. [강조 노드] 하이라이트 리스트에 '있는' 애들은 -> 둥근 사각형 + 이미지
    // -------------------------------------------------------
    const highNodes = node.filter(d => highlightIds.has(d.id));

    // B-1. 클립 패스(ClipPath) 정의 
    // (이미지가 둥근 사각형 밖으로 튀어나가지 않게 자르는 틀을 만듭니다)
    highNodes.append("defs")
        .append("clipPath")
        .attr("id", d => `clip-${d.id}`) // 각 노드마다 고유 ID 부여
        .append("rect")
        .attr("width", d => d.size * ratio)
        .attr("height", d => d.size)
        .attr("rx", 7).attr("ry", 7) // 모서리 둥글기
        .attr("x", d => -(d.size * ratio) / 2) // 중앙 정렬 좌표 계산
        .attr("y", d => -d.size / 2);

    // B-2. 배경 사각형(테두리) 그리기
    highNodes.append("rect")
        .attr("class", "node-rect")
        .attr("width", d => d.size * ratio)
        .attr("height", d => d.size)
        .attr("rx", 7).attr("ry", 7)
        .attr("x", d => -(d.size * ratio) / 2)
        .attr("y", d => -d.size / 2)
        .style("fill", "#fff")     // 이미지가 없을 경우를 대비한 흰 배경
        .style("stroke", "#ebebec") // ✨ 강조 색상 (흰색/밝은회색)
        .style("stroke-width", "3px");

    // B-3. 이미지 넣기 (클립 패스 적용)
    highNodes.append("image")
        .attr("class", "node-image")
        .attr("xlink:href", d => d.imgUrl)
        .attr("width", d => d.size * ratio)
        .attr("height", d => d.size)
        .attr("x", d => -(d.size * ratio) / 2)
        .attr("y", d => -d.size / 2)
        .attr("clip-path", d => `url(#clip-${d.id})`) // ✨ 위에서 만든 틀(B-1) 적용
        .attr("preserveAspectRatio", "xMidYMid slice") // 이미지가 꽉 차게 조절 (cover 효과)
        .on("error", function() { d3.select(this).style("display", "none"); }); // 이미지 없으면 숨김
    

    // B-4. 선택 노드 텍스트 라벨 추가
    highNodes.append("text")
        .attr("class", "node-text") // 호버링용 클래스 추가
        .text(d => d.title.length > 10 ? d.title.substring(0, 10) + "..." : d.title)
        .attr("dy", d => (d.size / 2) + 21)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#ebebec")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("stroke", "#161618")
        .style("stroke-width", "5px")
        .style("stroke-linejoin", "round")
        .style("paint-order", "stroke"); 


    // 5. 업데이트
    simulation.on("tick", () => {
        // ID 생성을 위해 객체화된 source.id를 사용해야 함에 주의
        link
            .attr("id", d => `link-${d.source.id}-${d.target.id}`)
            .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
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

    // ------------------------------------------------------------
    // 7. 호버링 이벤트 로직 (내부 함수로 통합)
    // ------------------------------------------------------------
    function nodeHover(event, d, isHovering) {
        const targetNode = d3.select(event.currentTarget);
        const scaleFactor = 2; // 2.0은 너무 클 수 있어 살짝 조절
        const dimOpacity = 0.2;  // 흐리게 할 때의 투명도
        const transitionDuration = 200; 
        const instantDuration = 0; 

        const getConnectedLinkIds = (hoveredNode) => {
            return links
                .filter(link => link.source.id === hoveredNode.id || link.target.id === hoveredNode.id)
                .map(link => `#link-${link.source.id}-${link.target.id}`);
        };

        if (isHovering) {
            // 1. 전체 흐리게
            g.selectAll(".node").transition().duration(transitionDuration).style("opacity", dimOpacity);
            g.selectAll(".link").transition().duration(transitionDuration).style("opacity", dimOpacity);

            // 2. 현재 노드 강조 및 확대
            targetNode.transition().duration(transitionDuration)
                .attr("transform", `translate(${d.x},${d.y}) scale(${scaleFactor})`)
                .style("opacity", 1.0);
            
            // 3. 텍스트 위치 보정
            targetNode.select(".node-text").transition().duration(transitionDuration)
                .attr("transform", `translate(0, ${(scaleFactor - 0.5)})`);
            
            // 4. 연결된 노드들도 강조 (선택 사항 - 연결된 노드까지 밝히려면 아래 주석 해제)
            // const neighborIds = new Set();
            // links.forEach(l => {
            //    if(l.source.id === d.id) neighborIds.add(l.target.id);
            //    if(l.target.id === d.id) neighborIds.add(l.source.id);
            // });
            // g.selectAll(".node").filter(n => neighborIds.has(n.id))
            //  .transition().duration(transitionDuration).style("opacity", 1.0);

            // 5. 연결된 선 강조
            // const connectedLinks = getConnectedLinkIds(d);
            // connectedLinks.forEach(linkId => {
            //     d3.select(linkId).transition().duration(transitionDuration).style("opacity", 1.0);
            // });

        } else {
            // [복구] 마우스 뗐을 때 즉시 복구
            
            // 1. 모든 노드 투명도 1.0으로 복구
            g.selectAll(".node").transition().duration(instantDuration).style("opacity", 1.0); 

            // 2. 모든 선의 투명도를 '원래 설정값'으로 복구 (중요!)
            g.selectAll(".link").transition().duration(instantDuration)
                .style("opacity", (l) => getBaseLinkOpacity(l)); // 1.0이 아니라 원래 로직대로 복구

            // 3. 현재 노드 크기 복원
            targetNode.transition().duration(instantDuration)
                .attr("transform", `translate(${d.x},${d.y}) scale(1)`);
            
            // 4. 텍스트 위치 복원
            targetNode.select(".node-text").transition().duration(instantDuration)
                .attr("transform", `translate(0, 0)`);
        }
    }
}

window.addEventListener("nav", () => {
    if (document.getElementById('image-graph')) initGraph();
});

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGraph);
} else {
    initGraph();
}