# Permissive Demo Authentication System

## Security & Privacy Rules
- **Permissive Login**: Any non-empty User ID/Email and any non-empty Password immediately establish a local simulated session (`DemoUserSession`).
- **Zero Password Persistence**: Entered passwords are validated strictly for non-emptiness in memory and immediately discarded. They are never stored in `localStorage`, `sessionStorage`, cookies, or logs.
- **UI Transparency**: Both `/account/login` and `/account/register` prominently display:
  `"Demo Access — Any user ID and password will work. Do not enter real credentials."`
