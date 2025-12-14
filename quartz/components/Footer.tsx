import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    /* quartz/components/Footer.tsx 파일의 return 부분 수정 */

return (
  <footer class={`${displayClass ?? ""}`}>
    <hr />
    
    {/* 1. 원래 있던 저작권 문구 (필요하면 남겨두세요) */}
    {/* <p>
      Created with <a href="https://quartz.jzhao.xyz/">Quartz</a> © {year}
    </p> */}

    {/* 2. 사용자님이 원하시는 아이콘 링크들 (여기에 직접 적습니다!) */}
    <div class="footer-icons">
      
      {/* 이메일 */}
      <a href="mailto:quazycrystal@gmail.com" target="_blank">
        <img src="/static/img/icons/email-white.png" alt="Email" class="social-icon" />
      </a>

      {/* 링크드인 */}
      <a href="https://linkedin.com/in/jiwonkim-art-audio-design" target="_blank">
        <img src="/static/img/icons/linkedin.png" alt="LinkedIn" class="social-icon" />
      </a>

      {/* 깃헙 */}
      <a href="https://github.com/quazycrystal" target="_blank">
        <img src="/static/img/icons/github-white.png" alt="Github" class="social-icon" />
      </a>

      {/* 인스타그램 */}
      <a href="https://www.instagram.com/quazycrystal/" target="_blank">
        <img src="/static/img/icons/instagram.png" alt="Instagram" class="social-icon" />
      </a>
    </div>
  </footer>
)
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
