// quartz/static/home-graph.js

function initGraph() {
    const container = document.getElementById('image-graph');
    if (!container || !window.quartzGraphData) return;

    // 초기화
    container.innerHTML = '';
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 원본 데이터 가져오기
    const allNodes = window.quartzGraphData.map(d => ({...d}));
    const links = [];

    // ------------------------------------------------------------
    // 1. 링크 데이터 생성 (누가 누구랑 연결되었나?)
    // ------------------------------------------------------------
    const nodeMap = new Map(allNodes.map(n => [n.id, n]));

    allNodes.forEach(sourceNode => {
        // 실제 링크가 있는 경우 연결
        if (sourceNode.links && sourceNode.links.length > 0) {
            sourceNode.links.forEach(targetSlug => {
                // 링크 대상이 실제로 존재하는 경우에만 선을 연결
                if (nodeMap.has(targetSlug)) {
                    links.push({ 
                        source: sourceNode.id, 
                        target: targetSlug
                    });
                }
            });
        }
    });

    // ------------------------------------------------------------
    // 2. [핵심] 연결되지 않은 노드 제거 (필터링)
    // ------------------------------------------------------------
    // 링크에 한 번이라도 등장한(source든 target이든) 노드의 ID를 수집합니다.
    const connectedNodeIds = new Set();
    links.forEach(l => {
        connectedNodeIds.add(l.source);
        connectedNodeIds.add(l.target);
    });

    // 수집된 ID 목록에 있는 노드만 남기고 나머지는 버립니다.
    // (단, 만약 하나도 연결된 게 없어서 텅 비게 되면 너무 썰렁하니 'index'는 살려둘 수도 있지만,
    //  요청하신 대로 '연결 안 된 건 아예 안 나오게' 처리합니다.)
    // ex) const filteredNodes = allNodes.filter(node => connectedNodeIds.has(node.id));
    // index는 왕따라도 살려주는 코드 (필요하면 사용)
    //const filteredNodes = allNodes.filter(node => connectedNodeIds.has(node.id) || node.id === "quazycrystal");

    // 만약 필터링했더니 남은 게 하나도 없다면? (안내 문구라도 띄우는 게 좋습니다)
    if (filteredNodes.length === 0) {
        console.log("[HomeGraph] 연결된 노드가 하나도 없어 그래프를 표시하지 않습니다.");
        return; 
    }

    // ------------------------------------------------------------
    // 3. 물리 엔진 설정
    // ------------------------------------------------------------
    const simulation = d3.forceSimulation(filteredNodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300)) // 서로 밀어내는 힘
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(d => d.size * 0.8).iterations(2));

    // ------------------------------------------------------------
    // 4. 그리기 (SVG)
    // ------------------------------------------------------------
    const svg = d3.select("#image-graph").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", (event) => g.attr("transform", event.transform)))
        .on("dblclick.zoom", null);

    const g = svg.append("g");

    // 선 그리기
    const link = g.append("g").attr("class", "links")
        .selectAll("line").data(links).enter().append("line")
        .style("stroke", "#ccc")
        .style("stroke-width", "1.5px");

    // 노드 그리기 (filteredNodes 사용)
    const node = g.append("g").attr("class", "nodes")
        .selectAll("g").data(filteredNodes).enter().append("g")
        .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
        .on("click", (event, d) => {
             // 클릭 시 해당 페이지로 이동
             window.location.href = d.link; 
        });

    // 노드 배경 (원)
    node.append("circle")
        .attr("r", d => d.size / 2)
        .style("fill", "#fff")
        .style("stroke", "#546e7a")
        .style("stroke-width", "2px");

    // 이미지 (있으면 표시)
    node.append("image")
        .attr("xlink:href", d => d.imgUrl)
        .attr("width", d => d.size).attr("height", d => d.size)
        .attr("x", d => -d.size / 2).attr("y", d => -d.size / 2)
        .attr("clip-path", d => `circle(${d.size/2}px at ${d.size/2}px ${d.size/2}px)`)
        .on("error", function() { d3.select(this).style("display", "none"); });

    // 텍스트 (제목)
    node.append("text")
        .text(d => d.title.length > 10 ? d.title.substring(0, 10) + "..." : d.title)
        .attr("dy", d => (d.size / 2) + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#333")
        .style("pointer-events", "none");

    // ------------------------------------------------------------
    // 5. 프레임 업데이트
    // ------------------------------------------------------------
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // 드래그 함수
    function dragstarted(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
    function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
    function dragended(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }
}

// 실행 트리거
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGraph);
} else {
    initGraph();
}