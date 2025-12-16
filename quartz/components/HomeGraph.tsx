import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  const HomeGraph: QuartzComponent = ({ allFiles, fileData }: QuartzComponentProps) => {
    
    // 1. 홈 화면(index)이 아니면 그리지 않음
    if (fileData.slug !== "index") {
      return <></>
    }

    const content = allFiles ?? []

    // 2. 데이터 변환 (실제 파일들)
    let nodes = content.map((file: any) => {
      const slug = file.slug
      const data = file.frontmatter ?? {}
      
      return {
        id: slug,
        title: data.title ?? slug,
        category: (data.tags && data.tags.length > 0) ? data.tags[0] : "etc", 
        imgUrl: data.heroImage ? `/${data.heroImage}` : "https://placehold.co/100x100?text=No+Img",
        
        // [외부 링크 처리] externalUrl이 있으면 그걸 쓰고, 없으면 내부 링크
        link: data.externalUrl ? data.externalUrl : `/${slug}`,
        
        // [핵심] 이 노드가 외부 링크인지 표시 (true/false)
        isExternal: !!data.externalUrl,
        
        links: file.links ?? [], 
        size: 40 
      }
    })

    // 3. 더미 데이터 (데이터가 없을 때 테스트용)
    // [수정됨] 여기에도 'isExternal'을 넣어줘야 타입 에러가 안 납니다!
    if (nodes.length === 0) {
        console.log("[HomeGraph] No content found. Using DUMMY data for testing.")
        nodes = [
            { 
              id: "test-1", title: "Quartz Connected", category: "Graph", 
              imgUrl: "https://placehold.co/100x100/orange/white", 
              link: "#", size: 80, links: ["test-2", "test-3"], 
              isExternal: false // <--- 이거 추가됨
            },
            { 
              id: "test-2", title: "Data Flow", category: "Test", 
              imgUrl: "https://placehold.co/100x100/blue/white", 
              link: "#", size: 50, links: [], 
              isExternal: false // <--- 이거 추가됨
            },
            { 
              id: "test-3", title: "Google Link", category: "External", 
              imgUrl: "https://placehold.co/100x100/green/white", 
              link: "https://google.com", size: 50, links: [], 
              isExternal: true // <--- 이거 추가됨
            }
        ]
    }

    return (
      <div class="home-graph-wrapper">
        <div id="image-graph" style={{ width: "100%", height: "600px", position: "relative", overflow: "hidden" }}></div>
        
        {/* 데이터 주입 */}
        <script dangerouslySetInnerHTML={{__html: `
          window.quartzGraphData = ${JSON.stringify(nodes)};
        `}}></script>
        
        {/* 라이브러리 및 스크립트 로드 */}
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <script src="/static/home-graph.js"></script>
      </div>
    )
  }
  return HomeGraph
}) satisfies QuartzComponentConstructor