/**
 * Simple markdown parser using marked library with highlight.js.
 */

import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';

// Import commonly used languages
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import typescript from 'highlight.js/lib/languages/typescript';
import sql from 'highlight.js/lib/languages/sql';
import markdown from 'highlight.js/lib/languages/markdown';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import rust from 'highlight.js/lib/languages/rust';
import go from 'highlight.js/lib/languages/go';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', cpp);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('go', go);

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch {
        // Fallback
      }
    }
    try {
      return hljs.highlightAuto(code).value;
    } catch {
      return code;
    }
  },
});

/**
 * Parse markdown string to HTML
 */
export function parseMarkdown(text) {
  if (!text) return '';
  try {
    return marked.parse(text);
  } catch {
    return text;
  }
}
