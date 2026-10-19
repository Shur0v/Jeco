# Demo Accounts Specification

1. **Purpose**: Provide permissive demo login, registration, profile editing, order history, and wishlist access.
2. **Routes**:
   - `/account/login` (`LoginView`)
   - `/account/register` (`RegisterView`)
   - `/account/recover` (`RecoverView`)
   - `/account` (`AccountDashboardView`)
3. **Permissive Login Contract**: Any non-empty email/user ID and any non-empty password immediately establish a local `DemoUserSession` without persisting or logging the password.
