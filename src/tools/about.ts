export async function handleAbout(args?: any) {
  return {
    content: [{
      type: "text" as const,
      text: "Onedrive mcp server - tools to perform read/write actions in personal onedrive app folder."
    }]
  };
}