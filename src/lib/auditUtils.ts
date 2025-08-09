export function summarize(details: any, eventType: string): string {
  try {
    switch (eventType) {
      case 'tool_added':
        return `Added ${details?.name ?? details?.id ?? 'tool'}${details?.category ? ` (${details.category})` : ''}`;
      case 'tool_removed':
        return `Removed ${details?.name ?? details?.id ?? 'tool'}`;
      case 'share_created':
        return `Share ${details?.shareId ?? details?.id ?? ''} created`.trim();
      case 'export_pdf':
        return `Exported ${details?.scope ?? details?.target ?? 'PDF'}`;
      case 'export_png':
        return `Exported PNG ${details?.scope ? `(${details.scope})` : ''}`.trim();
      case 'suggestion_applied':
        return `Applied suggestion ${details?.name ?? details?.id ?? ''}`.trim();
      case 'view_ai_suggestions':
      case 'ai_suggestions_viewed':
        return `Viewed AI suggestions (tools=${details?.toolsCount ?? details?.count ?? ''})`.trim();
      default:
        return JSON.stringify(details).slice(0, 100);
    }
  } catch {
    return '';
  }
}
