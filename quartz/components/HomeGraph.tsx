import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

export default (() => {
  const HomeGraph: QuartzComponent = ({ allFiles, fileData }: QuartzComponentProps) => {
    
    // 인덱스(홈) 페이지가 아니면 렌더링 안 함
    if (fileData.slug !== "index") {
      return <></>
    }

    const content = allFiles ?? []

    // 1. 데이터 변환 (실제 데이터)
    let nodes = content.map((file: any) => {
      const slug = file.slug
      const data = file.frontmatter ?? {}
      
      return {
        id: slug,
        title: data.title ?? slug,
        category: (data.tags && data.tags.length > 0) ? data.tags[0] : "etc", 
        imgUrl: data.heroImage ? `/${data.heroImage}` : "https://placehold.co/100x100?text=No+Img",
        // externalUrl이 있으면 그걸 쓰고, 없으면 원래대로 내부 슬러그 사용
        link: data.externalUrl ? data.externalUrl : `/${slug}`,
        // [중요] 링크 정보 전달
        links: file.links ?? [], 
        size: 40 
      }
    })

    // 2. 더미 데이터 (에러 수정됨: links: [] 추가)
    if (nodes.length === 0) {
        console.log("[HomeGraph] No content found. Using DUMMY data for testing.")
        nodes = [
            // 타입 에러 방지를 위해 links: []를 모두 추가했습니다.
            { id: "test-1", title: "Quartz Connected", category: "Graph", imgUrl: "https://placehold.co/100x100/orange/white", link: "#", size: 80, links: ["test-2", "test-3"] },
            { id: "test-2", title: "Data Flow", category: "Test", imgUrl: "https://placehold.co/100x100/blue/white", link: "#", size: 50, links: [] },
            { id: "test-3", title: "Success", category: "Test", imgUrl: "https://placehold.co/100x100/green/white", link: "#", size: 50, links: [] }
        ]
    }

    return (
      <div class="home-graph-wrapper">
        <div id="image-graph" style={{ width: "100%", height: "50vh", position: "relative", overflow: "hidden" }}></div>
        
        <script dangerouslySetInnerHTML={{__html: `
          window.quartzGraphData = ${JSON.stringify(nodes)};
        `}}></script>
        
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <script src="/static/home-graph.js"></script>
      </div>
    )
  }
  return HomeGraph
}) satisfies QuartzComponentConstructor