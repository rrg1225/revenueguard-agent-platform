# Security

RevenueGuard runs in dry-run mode by default and does not require secrets.

- Do not commit `.env` files or customer data.
- Keep external write adapters disabled unless explicit approval flow is implemented.
- Treat generated traces as sensitive operational data.
- Report security issues privately through GitHub security advisories when enabled.
