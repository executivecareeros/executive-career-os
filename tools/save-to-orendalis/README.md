# Save to Orendalis — prepared browser helper

Status: prepared for security review; not packaged, distributed, or deployed.

This user-triggered helper copies a small, visible job summary from the currently open LinkedIn job page and opens the private Orendalis import form. The executive reviews and pastes the summary before anything is saved.

Security boundaries:

- runs only after the executive clicks the extension;
- uses `activeTab`, not persistent access to LinkedIn;
- has no LinkedIn host permission;
- does not read or store cookies, credentials, messages, profiles, or background activity;
- does not send data to Orendalis or any third party;
- does not scrape, crawl, schedule, or automate a LinkedIn account;
- copies only the page URL, visible role heading, visible company label, and visible location label;
- requires the normal Orendalis consent and import confirmation.

Before any distribution: complete browser-store policy review, privacy review, manual extraction review against the current LinkedIn DOM, signed-package review, and founder approval.
