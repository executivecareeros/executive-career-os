const button = document.querySelector("#save");
const status = document.querySelector("#status");

button.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !/^https:\/\/(?:www\.)?linkedin\.com\/jobs\/view\//i.test(tab.url ?? "")) {
    status.textContent = "Open a LinkedIn job page first.";
    return;
  }
  const [{ result }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => {
    const visible = (selector) => document.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim();
    return {
      url: location.href,
      title: visible("h1"),
      company: visible("[class*='company-name'], [class*='topcard__org-name-link'], .job-details-jobs-unified-top-card__company-name"),
      location: visible("[class*='topcard__flavor--bullet'], .job-details-jobs-unified-top-card__primary-description-container"),
    };
  } });
  const summary = [`Title: ${result?.title ?? "Not captured"}`, `Company: ${result?.company ?? "Not captured"}`, `Location: ${result?.location ?? "Not captured"}`, `LinkedIn URL: ${result?.url ?? tab.url}`].join("\n");
  await navigator.clipboard.writeText(summary);
  await chrome.tabs.create({ url: "https://www.orendalis.com/opportunities#linkedin-import" });
  status.textContent = "Copied. Review and paste it in Orendalis.";
});
