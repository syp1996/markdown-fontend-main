import { marked } from 'marked';
import hljs from 'highlight.js';

/**
 * 文件格式转换工具
 * 支持 Markdown、HTML、纯文本等格式之间的转换
 */
export class FormatConverter {
  
  /**
   * Markdown 转 HTML
   * @param {string} markdown - Markdown 内容
   * @returns {string} HTML 内容
   */
  static markdownToHtml(markdown) {
    try {
      // 配置 marked 选项
      marked.setOptions({
        breaks: true, // 支持换行
        gfm: true,    // 支持 GitHub 风格 Markdown
        sanitize: false, // 允许 HTML 标签（后续由 DOMPurify 统一清洗）
        langPrefix: 'language-',
        highlight(code, lang) {
          try {
            if (lang && hljs.getLanguage(lang)) {
              return hljs.highlight(code, { language: lang }).value
            }
            return hljs.highlightAuto(code).value
          } catch (e) {
            return code
          }
        }
      });
      
      return marked.parse(markdown);
    } catch (error) {
      console.error('Markdown 转 HTML 失败:', error);
      return `<pre>${markdown}</pre>`;
    }
  }
  
  /**
   * HTML 转纯文本
   * @param {string} html - HTML 内容
   * @returns {string} 纯文本内容
   */
  static htmlToText(html) {
    try {
      // 创建临时 DOM 元素来解析 HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // 移除 script 和 style 标签
      const scripts = tempDiv.querySelectorAll('script, style');
      scripts.forEach(script => script.remove());
      
      // 获取纯文本内容
      let text = tempDiv.textContent || tempDiv.innerText || '';
      
      // 清理多余的空白字符
      text = text.replace(/\s+/g, ' ').trim();
      
      return text;
    } catch (error) {
      console.error('HTML 转纯文本失败:', error);
      return html;
    }
  }
  
  /**
   * HTML 转 Markdown（简化版）
   * @param {string} html - HTML 内容
   * @returns {string} Markdown 内容
   */
  static htmlToMarkdown(html) {
    try {
      // 创建临时 DOM 元素
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // 移除 script 和 style 标签
      const scripts = tempDiv.querySelectorAll('script, style');
      scripts.forEach(script => script.remove());
      
      let markdown = '';
      
      // 遍历子节点进行转换
      for (const node of tempDiv.childNodes) {
        markdown += this.nodeToMarkdown(node);
      }
      
      return markdown.trim();
    } catch (error) {
      console.error('HTML 转 Markdown 失败:', error);
      return html;
    }
  }
  
  /**
   * 将 DOM 节点转换为 Markdown
   * @param {Node} node - DOM 节点
   * @returns {string} Markdown 内容
   */
  static nodeToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      const content = Array.from(node.childNodes)
        .map(child => this.nodeToMarkdown(child))
        .join('');
      
      switch (tagName) {
        case 'h1':
          return `# ${content}\n\n`;
        case 'h2':
          return `## ${content}\n\n`;
        case 'h3':
          return `### ${content}\n\n`;
        case 'h4':
          return `#### ${content}\n\n`;
        case 'h5':
          return `##### ${content}\n\n`;
        case 'h6':
          return `###### ${content}\n\n`;
        case 'p':
          return `${content}\n\n`;
        case 'br':
          return '\n';
        case 'strong':
        case 'b':
          return `**${content}**`;
        case 'em':
        case 'i':
          return `*${content}*`;
        case 'code':
          return `\`${content}\``;
        case 'pre':
          return `\n\`\`\`\n${content}\n\`\`\`\n\n`;
        case 'ul':
          return Array.from(node.children)
            .map(li => `- ${this.nodeToMarkdown(li).trim()}`)
            .join('\n') + '\n\n';
        case 'ol':
          return Array.from(node.children)
            .map((li, index) => `${index + 1}. ${this.nodeToMarkdown(li).trim()}`)
            .join('\n') + '\n\n';
        case 'li':
          return Array.from(node.childNodes)
            .map(child => this.nodeToMarkdown(child))
            .join('') + '\n';
        case 'blockquote':
          return `> ${content.trim()}\n\n`;
        case 'a': {
          const href = node.getAttribute('href') || '';
          return `[${content}](${href})`;
        }
        case 'img': {
          const src = node.getAttribute('src') || '';
          const alt = node.getAttribute('alt') || '';
          return `![${alt}](${src})`;
        }
        default:
          return content;
      }
    }
    
    return '';
  }
  
  /**
   * 纯文本转 Markdown
   * @param {string} text - 纯文本内容
   * @returns {string} Markdown 内容
   */
  static textToMarkdown(text) {
    try {
      // 简单的文本格式化
      let markdown = text;
      
      // 检测标题（以数字和点开头的行）
      markdown = markdown.replace(/^(\d+\.\s+)(.+)$/gm, '## $2');
      
      // 检测列表项（以 - 或 * 开头的行）
      markdown = markdown.replace(/^([-*]\s+)(.+)$/gm, '- $2');
      
      // 检测强调文本（用 ** 包围的文本）
      markdown = markdown.replace(/\*\*(.+?)\*\*/g, '**$1**');
      
      // 检测斜体文本（用 * 包围的文本）
      markdown = markdown.replace(/\*([^*]+)\*/g, '*$1*');
      
      // 检测代码块（用 ` 包围的文本）
      markdown = markdown.replace(/`([^`]+)`/g, '`$1`');
      
      return markdown;
    } catch (error) {
      console.error('纯文本转 Markdown 失败:', error);
      return text;
    }
  }
  
  /**
   * 检测内容格式
   * @param {string} content - 文件内容
   * @returns {string} 检测到的格式
   */
  static detectFormat(content) {
    if (!content || typeof content !== 'string') {
      return 'unknown';
    }
    
    // 检测 HTML 标签
    if (/<[^>]+>/.test(content)) {
      return 'html';
    }
    
    // 检测 Markdown 语法
    if (/#{1,6}\s+/.test(content) || 
        /\*\*.*\*\*/.test(content) || 
        /\*.*\*/.test(content) ||
        /\[.*\]\(.*\)/.test(content) ||
        /```[\s\S]*```/.test(content)) {
      return 'markdown';
    }
    
    // 检测纯文本
    return 'text';
  }
  
  /**
   * 转换文件格式
   * @param {string} content - 原始内容
   * @param {string} fromFormat - 原始格式
   * @param {string} toFormat - 目标格式
   * @returns {string} 转换后的内容
   */
  static convert(content, fromFormat, toFormat) {
    if (fromFormat === toFormat) {
      return content;
    }
    
    try {
      switch (`${fromFormat}-${toFormat}`) {
        case 'markdown-html':
          return this.markdownToHtml(content);
        case 'html-text':
          return this.htmlToText(content);
        case 'html-markdown':
          return this.htmlToMarkdown(content);
        case 'text-markdown':
          return this.textToMarkdown(content);
        case 'markdown-text':
          return this.htmlToText(this.markdownToHtml(content));
        default:
          console.warn(`不支持的格式转换: ${fromFormat} → ${toFormat}`);
          return content;
      }
    } catch (error) {
      console.error('格式转换失败:', error);
      return content;
    }
  }
  
  /**
   * 获取支持的文件格式列表
   * @returns {Array} 支持的格式列表
   */
  static getSupportedFormats() {
    return [
      { value: 'markdown', label: 'Markdown', extension: '.md' },
      { value: 'html', label: 'HTML', extension: '.html' },
      { value: 'text', label: '纯文本', extension: '.txt' }
    ];
  }
  
  /**
   * 获取格式的 MIME 类型
   * @param {string} format - 文件格式
   * @returns {string} MIME 类型
   */
  static getMimeType(format) {
    const mimeTypes = {
      markdown: 'text/markdown',
      html: 'text/html',
      text: 'text/plain'
    };
    return mimeTypes[format] || 'text/plain';
  }
  
  /**
   * 获取格式的文件扩展名
   * @param {string} format - 文件格式
   * @returns {string} 文件扩展名
   */
  static getExtension(format) {
    const extensions = {
      markdown: '.md',
      html: '.html',
      text: '.txt'
    };
    return extensions[format] || '.txt';
  }
}

export default FormatConverter;
