import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Lightbulb, 
  Database, 
  FileEdit,
  Loader2, 
  ChevronDown
} from 'lucide-react';
import { ChatEvent, ChatEventType } from '@/lib/types';

export interface ChatTurnSection {
  type: 'REASONING_BLOCK' | 'FILE_EDIT_GROUP' | 'TOOL_LOG' | 'FINAL_RESPONSE';
  events?: ChatEvent[];
  fileEdits?: ChatEvent[];
  event?: ChatEvent;
}

export function parseChatTurnSections(events: ChatEvent[]): ChatTurnSection[] {
  const sections: ChatTurnSection[] = [];
  if (!events || events.length === 0) return sections;

  const firstFileEditIndex = events.findIndex(e => e.type === ChatEventType.FILE_EDIT);

  if (firstFileEditIndex !== -1) {
    // Events before first FILE_EDIT (Reasoning block)
    const preEvents = events.slice(0, firstFileEditIndex);
    const fileEdits: ChatEvent[] = [];
    const postEvents: ChatEvent[] = [];

    for (let i = firstFileEditIndex; i < events.length; i++) {
      const ev = events[i];
      if (ev.type === ChatEventType.FILE_EDIT) {
        fileEdits.push(ev);
      } else {
        postEvents.push(ev);
      }
    }

    if (preEvents.length > 0) {
      sections.push({
        type: 'REASONING_BLOCK',
        events: preEvents,
      });
    }

    if (fileEdits.length > 0) {
      sections.push({
        type: 'FILE_EDIT_GROUP',
        fileEdits: fileEdits,
      });
    }

    postEvents.forEach(ev => {
      if (ev.type === ChatEventType.THOUGHT) {
        sections.push({ type: 'REASONING_BLOCK', events: [ev] });
      } else if (ev.type === ChatEventType.TOOL_LOG) {
        sections.push({ type: 'TOOL_LOG', event: ev });
      } else {
        sections.push({ type: 'FINAL_RESPONSE', event: ev });
      }
    });
  } else {
    // No file edits in this turn
    const thoughts = events.filter(e => e.type === ChatEventType.THOUGHT);
    const nonThoughts = events.filter(e => e.type !== ChatEventType.THOUGHT);

    if (thoughts.length > 0) {
      sections.push({
        type: 'REASONING_BLOCK',
        events: thoughts,
      });
    }

    nonThoughts.forEach(ev => {
      if (ev.type === ChatEventType.TOOL_LOG) {
        sections.push({ type: 'TOOL_LOG', event: ev });
      } else {
        sections.push({ type: 'FINAL_RESPONSE', event: ev });
      }
    });
  }

  return sections;
}

const markdownReasoningComponents = {
  p: ({ children }: any) => (
    <p style={{ fontSize: '14px', lineHeight: '1.5' }} className="my-1.5 text-[#94A3B8]">
      {children}
    </p>
  ),
  li: ({ children }: any) => (
    <li style={{ fontSize: '14px', lineHeight: '1.5' }} className="my-0.5 text-[#94A3B8]">
      {children}
    </li>
  ),
};

const markdownResponseComponents = {
  p: ({ children }: any) => (
    <p style={{ fontSize: '14px', lineHeight: '1.5' }} className="my-2 text-[#F8FAFC]">
      {children}
    </p>
  ),
  li: ({ children }: any) => (
    <li style={{ fontSize: '14px', lineHeight: '1.5' }} className="my-0.5 text-[#F8FAFC]">
      {children}
    </li>
  ),
  h1: ({ children }: any) => (
    <h1 style={{ fontSize: '16px', lineHeight: '1.4' }} className="font-semibold text-[#F8FAFC] my-3">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 style={{ fontSize: '15px', lineHeight: '1.4' }} className="font-semibold text-[#F8FAFC] my-2.5">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 style={{ fontSize: '14px', lineHeight: '1.4' }} className="font-semibold text-[#F8FAFC] my-2">
      {children}
    </h3>
  ),
  code: ({ children }: any) => (
    <code style={{ fontSize: '13px' }} className="bg-[#1E2638] px-1.5 py-0.5 rounded font-mono text-[#E2E8F0]">
      {children}
    </code>
  ),
};

export const ReasoningBlock = ({ events, isLoading }: { events: ChatEvent[], isLoading?: boolean }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="my-2.5 rounded-xl bg-[#0B101D]/90 border border-white/10 border-l-2 border-l-[#4F8CFF]/60 p-3.5 space-y-2 text-[#94A3B8]">
      {events.map((event, idx) => {
        if (event.type === ChatEventType.THOUGHT) {
          return (
            <div key={idx} className="flex items-start gap-2 text-[#4F8CFF] font-medium text-[13px]">
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4F8CFF] shrink-0 mt-0.5" />
              ) : (
                <Lightbulb className="w-3.5 h-3.5 text-[#4F8CFF] shrink-0 mt-0.5" />
              )}
              <span style={{ fontSize: '14px', lineHeight: '1.5' }} className="text-[#94A3B8] font-normal">{event.content}</span>
            </div>
          );
        }

        return (
          <div key={idx} className="text-[#94A3B8]">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownReasoningComponents}>
              {event.content}
            </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
};

export const FinalResponse = ({ event, isLoading }: { event: ChatEvent, isLoading?: boolean }) => {
  return (
    <div className="my-2.5 text-[#F8FAFC]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownResponseComponents}>
        {event.content}
      </ReactMarkdown>
      {isLoading && <span className="inline-block w-1.5 h-4 ml-1 bg-[#4F8CFF] animate-pulse align-middle" />}
    </div>
  );
};

export const FileEditGroup = ({ fileEdits, isLoading }: { fileEdits: ChatEvent[], isLoading?: boolean }) => {
  const files = fileEdits
    .map(e => e.filePath || (e.metadata?.split(',') || []).filter(Boolean)[0] || '')
    .filter(Boolean);

  const fileCount = files.length;
  const defaultExpanded = fileCount <= 4;
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (fileCount === 0) return null;

  if (fileCount === 1) {
    const filename = files[0].split('/').pop();
    return (
      <div className="flex items-center gap-3 my-1.5">
        <div className="text-[#949494] shrink-0">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#4F8CFF]" /> : <FileEdit className="w-4 h-4" />}
        </div>
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-[#949494] text-[13px] font-medium shrink-0">
            {isLoading ? "Editing" : "Edited"}
          </span>
          <span className="bg-[#262626] text-[#ececec] text-[12px] px-2 py-0.5 rounded-md font-mono border border-[#333] truncate">
            {filename}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-2 rounded-lg border border-[#333] bg-[#141A29]/70 overflow-hidden">
      <button 
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#949494] hover:text-[#ececec] hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="text-[#949494] shrink-0">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#4F8CFF]" /> : <FileEdit className="w-4 h-4" />}
          </div>
          <span className="text-[13px] font-medium text-[#ececec] shrink-0">
            {isLoading ? "Editing" : "Edited"} {fileCount} files
          </span>
          {!isExpanded && (
            <span className="text-[#808080] text-[11px] font-mono truncate">
              ({files.slice(0, 2).map(f => f.split('/').pop()).join(', ')}{fileCount > 2 ? `, +${fileCount - 2} more` : ''})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-[#949494] shrink-0 ml-2">
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-2.5 pt-1.5 flex flex-wrap gap-2 border-t border-[#262626] bg-[#0D121F]/80">
          {files.map((filePath, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="bg-[#262626] text-[#ececec] text-[12px] px-2 py-0.5 rounded-md font-mono border border-[#333] truncate flex items-center gap-1.5">
                <FileEdit className="w-3 h-3 text-[#949494] shrink-0" />
                {filePath.split('/').pop()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ChatEventRenderer = ({ event, isLoading }: { event: ChatEvent, isLoading?: boolean }) => {
  switch (event.type) {
    case ChatEventType.THOUGHT:
      return <ReasoningBlock events={[event]} isLoading={isLoading} />;

    case ChatEventType.TOOL_LOG:
      return <CollapsibleEvent 
                icon={<Database className="w-4 h-4" />} 
                label="Read" 
                event={event} 
              />;

    case ChatEventType.FILE_EDIT:
      return <FileEditGroup fileEdits={[event]} isLoading={isLoading} />;

    case ChatEventType.MESSAGE:
      return <FinalResponse event={event} isLoading={isLoading} />;

    default:
      return null;
  }
};

const CollapsibleEvent = ({ 
  icon, 
  label, 
  event,
  hideToggle = false,
  forceSingleLine = false
}: { 
  icon: React.ReactNode, 
  label: string, 
  event: ChatEvent,
  hideToggle?: boolean,
  forceSingleLine?: boolean
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const files = event.type === ChatEventType.FILE_EDIT 
    ? [event.filePath].filter(Boolean) as string[]
    : (event.metadata?.split(',') || []).filter(Boolean).map(f => f.trim());

  if (files.length === 0) return null;

  const hasMultipleFiles = files.length > 1;
  const showButton = !hideToggle && hasMultipleFiles && !forceSingleLine;

  return (
    <div className="flex flex-col gap-2 my-2">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="text-[#949494] shrink-0">{icon}</div>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[#949494] text-[13px] font-medium shrink-0">{label}</span>
            <span className="bg-[#262626] text-[#ececec] text-[12px] px-2 py-0.5 rounded-md font-mono border border-[#333] truncate">
              {files[0].split('/').pop()}
            </span>
            {!isExpanded && hasMultipleFiles && (
              <span className="text-[#949494] text-[11px] whitespace-nowrap">
                +{files.length - 1} more
              </span>
            )}
          </div>
        </div>
        
        {showButton && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#949494] hover:text-[#ececec] text-[12px] font-medium bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#333] transition-colors ml-4 cursor-pointer"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {isExpanded && hasMultipleFiles && !forceSingleLine && (
        <div className="flex flex-col gap-2">
          {files.slice(1).map((file, idx) => (
            <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
               <div className="text-[#949494] shrink-0 opacity-0">{icon}</div>
               <span className="text-[#949494] text-[13px] font-medium w-8 shrink-0">{label}</span>
               <span className="bg-[#262626] text-[#ececec] text-[12px] px-2 py-0.5 rounded-md font-mono border border-[#333] truncate">
                 {file.split('/').pop()}
               </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};