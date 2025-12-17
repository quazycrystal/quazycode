import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// simplifySlug import 삭제됨

export default (() => {
  // cfg 파라미터 삭제됨
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
        
        // 마크다운 프론트매터의 'imgUrl' (없으면 기본 이미지)
        imgUrl: data.imgUrl ? data.imgUrl : "https://placehold.co/100x100?text=No+Img",
        
        // 외부 링크 처리
        link: data.externalUrl ? data.externalUrl : slug,
        
        // [핵심] 외부 링크 여부
        isExternal: !!data.externalUrl,
        
        links: file.links ?? [], 
        size: 40 
      }
    })

    // 3. 더미 데이터 (데이터가 없을 때 테스트용)
    if (nodes.length === 0) {
        // console.log("[HomeGraph] No content found. Using DUMMY data.")
        nodes = [
            { 
              id: "test-1", title: "Quartz Connected", category: "Graph", 
              imgUrl: "https://placehold.co/100x100/orange/white", 
              link: "#", size: 80, links: ["test-2", "test-3"], 
              isExternal: false 
            },
            { 
              id: "test-2", title: "Data Flow", category: "Test", 
              imgUrl: "https://placehold.co/100x100/blue/white", 
              link: "#", size: 50, links: [], 
              isExternal: false 
            },
            { 
              id: "test-3", title: "Google Link", category: "External", 
              imgUrl: "https://placehold.co/100x100/green/white", 
              link: "https://google.com", size: 50, links: [], 
              isExternal: true 
            }
        ]
    }

    return (
      <div class="home-graph-wrapper">
        <div id="image-graph" style={{ width: "100%", height: "50%", position: "relative", overflow: "hidden" }}></div>
        
        {/* 데이터 주입 */}
        <script dangerouslySetInnerHTML={{__html: `
          window.quartzGraphData = ${JSON.stringify(nodes)};
        `}}></script>
        
        {/* 라이브러리 및 스크립트 로드 */}
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <script src="./static/home-graph.js"></script>
      </div>
    )
  }
  return HomeGraph
}) satisfies QuartzComponentConstructor