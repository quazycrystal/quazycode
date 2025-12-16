import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"
// ▼▼▼ 1. joinSegments를 추가로 불러옵니다 (경로 꼬임 방지) ▼▼▼
import { pathToRoot, joinSegments } from "../util/path"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg, fileData }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    
    // 루트 경로 계산
    const baseDir = pathToRoot(fileData.slug!)

    return (
      <footer class={`${displayClass ?? ""}`}>
        <hr />
        
      {/*<p>
          Created with <a href="https://quartz.jzhao.xyz/">Quartz</a> © {year}
        </p> */}
  
        <div class="footer-icons">
          {/* ▼▼▼ 2. joinSegments를 사용해서 경로를 안전하게 합칩니다 ▼▼▼ */}
          
          {/* 이메일 */}
          <a href="mailto:quazycrystal@gmail.com" target="_blank">
            <img 
              src={joinSegments(baseDir, "static/img/icons/email-white.png")} 
              alt="Email" class="social-icon" 
            />
          </a>

          {/* 링크드인 */}
          <a href="https://linkedin.com/in/jiwonkim-art-audio-design" target="_blank">
            <img 
              src={joinSegments(baseDir, "static/img/icons/linkedin.png")} 
              alt="LinkedIn" class="social-icon" 
            />
          </a>

          {/* 깃헙 */}
          <a href="https://github.com/quazycrystal" target="_blank">
            <img 
              src={joinSegments(baseDir, "static/img/icons/github-white.png")} 
              alt="Github" class="social-icon" 
            />
          </a>

          {/* 인스타그램 */}
          <a href="https://www.instagram.com/quazycrystal/" target="_blank">
            <img 
              src={joinSegments(baseDir, "static/img/icons/instagram.png")} 
              alt="Instagram" class="social-icon" 
            />
          </a>

          {/* 로고 */}
          <p>
          Jiwon Kim © {year}
          </p>
        </div>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor