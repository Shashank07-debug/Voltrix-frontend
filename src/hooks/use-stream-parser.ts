import { useMemo } from 'react';
import { ChatEvent, ChatEventType } from '@/lib/types';

// Regex to capture tags: thought, think, tool, message, file
const PARSE_REGEX = /<(thought|think|tool|message|file)(?:[^>]*)>([\s\S]*?)(?:<\/\1>|$)/gi;
const ATTR_REGEX = /(?:path|args)="([^"]+)"/i;

export const useStreamParser = (streamBuffer: string) => {
  return useMemo(() => {
    const events: ChatEvent[] = [];
    let match: RegExpExecArray | null;
    
    // Reset regex index
    PARSE_REGEX.lastIndex = 0;

    while ((match = PARSE_REGEX.exec(streamBuffer)) !== null) {
      const [fullMatch, tagName, content] = match;
      const typeStr = tagName.toLowerCase();
      
      const openTagMatch = streamBuffer.substring(match.index, match.index + fullMatch.indexOf('>') + 1); 
      const attrMatch = ATTR_REGEX.exec(openTagMatch);
      const attrValue = attrMatch ? attrMatch[1] : undefined;

      let type: ChatEventType = ChatEventType.MESSAGE;
      let filePath: string | undefined;
      let metadata: string | undefined;

      if (typeStr === 'thought' || typeStr === 'think') {
        type = ChatEventType.THOUGHT;
      } else if (typeStr === 'tool') {
        type = ChatEventType.TOOL_LOG;
        metadata = attrValue;
      } else if (typeStr === 'file') {
        type = ChatEventType.FILE_EDIT;
        filePath = attrValue;
      }

      events.push({
        type,
        content: content.trim(),
        filePath,
        metadata
      });
    }

    // Fallback for raw text without tags
    if (events.length === 0 && streamBuffer && streamBuffer.trim().length > 0) {
      events.push({
        type: ChatEventType.MESSAGE,
        content: streamBuffer.trim()
      });
    }

    return events;
  }, [streamBuffer]);
};