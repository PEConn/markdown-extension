class TitleOption extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Don't use shadow DOM, as that breaks radio button grouping.
    // this.attachShadow({ mode: "open" });

    // <label class="block">
    //   <input type="radio" name="titles" id={id} value={display}>
    //   <span>{display}</span>
    // </label>

    const id = this.getAttribute("id");
    const display = this.getAttribute("option");

    const input = document.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("name", "titles");
    input.setAttribute("id", id);
    input.setAttribute("value", display);

    const title = document.createElement("span");
    title.textContent = display;

    const label = document.createElement("label");
    label.setAttribute("class", "block");
    label.appendChild(input);
    label.appendChild(title);

    this.append(label);
  }
}

customElements.define("title-option", TitleOption);

function addTitleOption(title) {
  const id = "" + Math.random();

  const option = document.createElement("title-option");
  option.setAttribute("id", id);
  option.setAttribute("option", title);
  
  document.getElementById("titles").appendChild(option);
}

addTitleOption("Title 3");

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

    const title = cleanTitle(tabs[0].title);

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

function cleanTitle(title) {
  return title.replace(' - Chromium Code Search', '');
}

function getSeparatorLocations(word) {
  let arr = [];
  let start = 0;
  while (word.indexOf("|", start) !== -1) {
    const i = word.indexOf("|", start);
    arr.push(i);
    start = i + 1;
  }
  return arr;
}

function getTitles(title) {
  const possibleSplits = getSeparatorLocations(title)
      .map(loc => title.substr(0, loc).trim());
  possibleSplits.push(title);
  return possibleSplits;
}
