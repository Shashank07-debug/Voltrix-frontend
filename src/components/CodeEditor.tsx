import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { EditorView } from '@codemirror/view';
import { FileCode, Loader2 } from "lucide-react";
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { useTheme } from './ThemeProvider';

interface CodeEditorProps {
  content: string;
  filePath: string | null;
  isLoading?: boolean;
  onCodeChange?: (newCode: string) => void;
}

// Custom theme extension to style line-number gutter and dark theme scrollbars
const customDarkTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "#060913 !important",
  },
  ".cm-gutters": {
    backgroundColor: "#03050B !important",
    color: "#475569 !important",
    borderRight: "1px solid rgba(255, 255, 255, 0.12) !important",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(255, 255, 255, 0.05) !important",
    color: "#F8FAFC !important",
    fontWeight: "600 !important",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(255, 255, 255, 0.025) !important",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    paddingLeft: "8px !important",
    paddingRight: "8px !important",
  },
  ".cm-scroller": {
    fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace !important",
    overflowX: "auto !important",
    overflowY: "auto !important",
  },
  ".cm-scroller::-webkit-scrollbar": {
    height: "8px",
    width: "8px",
  },
  ".cm-scroller::-webkit-scrollbar-track": {
    backgroundColor: "rgba(3, 5, 11, 0.6)",
  },
  ".cm-scroller::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(79, 140, 255, 0.3)",
    borderRadius: "9999px",
    border: "2px solid rgba(6, 9, 19, 0.8)",
  },
  ".cm-scroller::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "rgba(79, 140, 255, 0.6)",
  }
});

const customLightTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "#F8FAFC !important",
  },
  ".cm-gutters": {
    backgroundColor: "#F1F5F9 !important",
    color: "#64748B !important",
    borderRight: "1px solid rgba(0, 0, 0, 0.1) !important",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(0, 0, 0, 0.05) !important",
    color: "#0F172A !important",
    fontWeight: "600 !important",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(0, 0, 0, 0.03) !important",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    paddingLeft: "8px !important",
    paddingRight: "8px !important",
  },
  ".cm-scroller": {
    fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace !important",
    overflowX: "auto !important",
    overflowY: "auto !important",
  },
  ".cm-scroller::-webkit-scrollbar": {
    height: "8px",
    width: "8px",
  },
  ".cm-scroller::-webkit-scrollbar-track": {
    backgroundColor: "rgba(241, 245, 249, 0.8)",
  },
  ".cm-scroller::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(37, 99, 235, 0.3)",
    borderRadius: "9999px",
    border: "2px solid rgba(248, 250, 252, 0.8)",
  },
  ".cm-scroller::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "rgba(37, 99, 235, 0.6)",
  }
});

export function CodeEditor({ content, filePath, isLoading, onCodeChange }: CodeEditorProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#060913] dark:bg-[#060913] light:bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F8CFF]" />
      </div>
    );
  }

  if (!filePath) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#060913] dark:bg-[#060913] light:bg-[#F8FAFC]">
        <FileCode className="w-12 h-12 text-[#475569] dark:text-[#475569] light:text-[#94A3B8] mb-4" />
        <h3 className="text-sm font-medium text-[#94A3B8] dark:text-[#94A3B8] light:text-[#64748B]">No file selected</h3>
      </div>
    );
  }

  // Sanitize content to remove stray '<' before code statements (e.g. <import -> import)
  const sanitizedContent = content
    ? content.replace(/^<(import|export|const|let|var|function|type|interface|class|\/\/|\/\*)/, '$1')
    : '';

  // Auto-detect language extension
  const getLanguage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return [javascript({ jsx: true, typescript: true })];
      case 'json':
        return [json()];
      case 'css':
      case 'scss':
        return [css()];
      case 'html':
      case 'svg':
        return [javascript({ jsx: true })];
      default:
        return [];
    }
  };

  const extensions = [
    ...getLanguage(filePath),
    isLight ? customLightTheme : customDarkTheme,
  ];

  return (
    <div className="relative h-full w-full overflow-hidden border-l border-white/5 dark:border-white/5 light:border-black/10 bg-[#060913] dark:bg-[#060913] light:bg-[#F8FAFC]">
      {/* Subtle left-edge fade vignette between editor and left panel divider */}
      <div className="absolute top-0 left-0 bottom-0 w-3 bg-gradient-to-r from-black/50 to-transparent dark:from-black/50 light:from-black/10 pointer-events-none z-10" />

      <CodeMirror
        value={sanitizedContent}
        height="100%"
        theme={isLight ? githubLight : githubDark}
        editable={false}
        extensions={extensions}
        onChange={(value) => onCodeChange?.(value)}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
        }}
        className="text-sm h-full"
      />
    </div>
  );
}