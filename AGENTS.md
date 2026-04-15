# Agent Configuration

## Available Agents for Development

### 1. Code Generator
- Role: Generates new components and features
- Trigger: When creating new components or services

### 2. Test Runner
- Role: Runs tests and validates code
- Trigger: Before commits and PRs

### 3. Tauri Builder
- Role: Builds desktop application
- Trigger: For production releases

## Development Workflow

1. **Feature Development**: Use Code Generator for new components
2. **Testing**: Run tests through Test Runner
3. **Integration**: Test with Tauri bridge
4. **Release**: Build with Tauri Builder

## Notes
- Always ensure Zustand store updates are tested
- Tauri IPC commands must be mocked in tests
- Component styling uses Tailwind CSS with custom green theme
