console.log("This is a popup!");

document.getElementById("copy").addEventListener("click", () => {
  copyCurrentUrl(false);
});

document.getElementById("copy_clean").addEventListener("click", () => {
  copyCurrentUrl(true);
});

function copyCurrentUrl(stripQuery) {
  const query = { active: true, currentWindow: true };

  chrome.tabs.query(query, (tabs) => {
    console.log(tabs);

    let url = tabs[0].url;

    if (stripQuery) {
      url = url.split('?')[0];
    }

    const title = tabs[0].title;

    setClipboard(`[${title}](${url})`);
  })
}

function setClipboard(text) {
  const type = "text/plain";
  const blob = new Blob([text], { type });
  const data = [new ClipboardItem({ [type]: blob })];

  navigator.clipboard.write(data).then(
      () => {
        console.log("Copied: " + text);
      },
      (err) => {
        console.log(err);
      }
  );
}
