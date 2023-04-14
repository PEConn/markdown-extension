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

    const id = this.getAttribute("option-id");
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

function addTitleOption(id, title) {
  const option = document.createElement("title-option");
  option.setAttribute("option-id", id);
  option.setAttribute("option", title);
  
  document.getElementById("titles").appendChild(option);
}

function addTitleOptions() {
  const query = { active: true, currentWindow: true };

  chrome.tabs.query(query, (tabs) => {
    const title = tabs[0].title;

    getTitles(title).forEach((title, idx) => addTitleOption("suggestion-" + idx, title))

    const clean = cleanTitle(title);

    if (title !== clean) {
      addTitleOption("suggestion-clean", clean);
    }

    document.getElementById("suggestion-0").checked = true;

  })
}

function getSelectedTitleOption() {
  // This funky thing turns a HTMLCollection into an array.
  // https://stackoverflow.com/a/222847
  const inputs = [].slice.call(document.getElementsByTagName("input"))
      .filter(input => input.id.startsWith("suggestion"));

  const selected = inputs.filter(input => input.checked);

  return selected[0].value;
}

console.log("This is a popup!");
addTitleOptions();

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

    var title = getSelectedTitleOption();

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
  return title
    .replace('Google.com Mail - ', '')
    .replace('- peconn@google.com - Google.com Mail', String.fromCodePoint(0x1F4E7))
    .replace('- Google Docs', String.fromCodePoint(0x1F4D8))
    .replace(' - Chromium Code Search', '');
}

function indexOfSeparator(word, start) {
  const pipe = word.indexOf("|", start);
  const dash = word.indexOf("-", start)

  if (pipe === -1) return dash;
  if (dash === -1) return pipe;

  return Math.min(pipe, dash);
}

function getSeparatorLocations(word) {
  let arr = [];
  let start = 0;
  // while (word.indexOf("|", start) !== -1) {
  //   const i = word.indexOf("|", start);
  while (indexOfSeparator(word, start) !== -1) {
    const i = indexOfSeparator(word, start);
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
