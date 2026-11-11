# Agent guidance

## Global theme tokens

- Express palette and interaction-state changes through global Ant Design tokens (`theme.token`, mapping, or algorithm), so components sharing a semantic token stay consistent. Keep paired states such as `colorPrimaryBorder` and `colorPrimaryBorderHover` aligned.
- Do not add or alter visual-style tokens under `theme.components.*`. If a requested result cannot be achieved with global tokens without unacceptable cross-component effects, pause and get explicit user approval before introducing a component-level override.
- Existing component tokens for geometry or compatibility are established exceptions; preserve them and do not extend or change them unless the user asks.
