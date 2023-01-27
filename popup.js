console.log("This is a popup!");

// setClipboard(Date.now())

document.getElementById("copy").addEventListener("click", () => {
  const query = { active: true, currentWindow: true };

  chrome.tabs.query(query, (tabs) => {
    console.log(tabs);

    const url = tabs[0].url;
    const title = tabs[0].title;

    setClipboard(`[${title}](${url})`);
  })
});

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