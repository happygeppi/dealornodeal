const values = [
  1, 2, 5, 10, 20, 50, 100, 250, 500, 750, 1500, 2500, 5000, 7500, 10000, 15000,
  25000, 50000, 75000, 100000, 250000, 500000, 750000, 1000000,
];

const bankerIntervals = [5, 5, 5, 3, 2, 1, 1, 1]; // sum must equal values.length - 1
let DealIndex = 0;

const Notations = ["de-DE", "en-US"];
const NumberNotation = Notations[0];

const cases = [];
let Opened = 0;

let playerCase;

let state = 0;
// 0: select players suitcase
// 1: select suitcase to open
// 2: deal or no deal

const $ = (id) => document.getElementById(id);
const $$ = (q) => document.querySelectorAll(q);

const EURO = "\u20AC";

function Init() {
  CreateCases();
  InitHTML();
}

function InitHTML() {
  InitValues();
  InitCases();
  InitBanker();
}

function InitValues() {
  for (let col = 0; col < 2; col++) {
    const Col = document.createElement("div");
    Col.classList.add("value-col");
    $("value-container").append(Col);

    for (let row = 0; row < values.length / 2; row++) {
      const Value = document.createElement("div");
      Value.classList.add("value");
      Col.append(Value);

      const Text = document.createElement("span");
      Text.classList.add("value-text");
      Value.append(Text);
      Text.innerHTML = `${values[
        (col * values.length) / 2 + row
      ].toLocaleString(NumberNotation)}${EURO}`;
    }
  }
}

function InitCases() {
  const gridSize = { horz: 6, vert: 4 };

  for (let j = 0; j < gridSize.vert; j++) {
    const Row = document.createElement("div");
    Row.classList.add("case-row");
    $("case-container").append(Row);

    for (let i = 0; i < gridSize.horz; i++) {
      const Suitcase = document.createElement("div");
      Suitcase.classList.add("suitcase");
      Row.append(Suitcase);

      const Content = document.createElement("div");
      Content.classList.add("suitcase-content");
      Suitcase.append(Content);

      const Front = document.createElement("div");
      Front.classList.add("suitcase-front");
      Content.append(Front);

      const Back = document.createElement("div");
      Back.classList.add("suitcase-back");
      Content.append(Back);

      const index = j * gridSize.horz + i;
      const Number = document.createElement("span");
      Number.classList.add("suitcase-number");
      Front.append(Number);
      Number.innerHTML = cases[index].number;

      const BackNumber = Number.cloneNode();
      BackNumber.innerHTML = Number.innerHTML;
      Back.append(BackNumber);

      const Value = document.createElement("span");
      Value.classList.add("suitcase-value");
      Back.append(Value);
      const ValueText = cases[index].value.toLocaleString(NumberNotation);
      Value.innerHTML = `${ValueText}${EURO}`;

      Suitcase.onclick = () => Update(index);
    }
  }
}

function InitBanker() {
  const Heading = document.createElement("h1");
  Heading.id = "banker-heading";
  $("deal-container").append(Heading);
  Heading.innerHTML = "N\u00e4chstes Angebot in";

  const Counter = document.createElement("span");
  Counter.id = "deal-counter";
  $("deal-container").append(Counter);
  Counter.innerHTML = bankerIntervals[0];
}

function CreateCases() {
  const shuffled = values.slice().shuffle();

  for (const value of shuffled)
    cases.push({ value: value, number: cases.length + 1, opened: false });

  cases.shuffle();
}

function CreateDealInterface() {
  state = 2;
  $("banker-heading").innerHTML = "DEAL OR NO DEAL?";
  $("deal-counter").innerHTML = CalculateDeal();
  $("deal-counter").id = "deal-value";

  const Container = document.createElement("div");
  Container.id = "deal-yn";
  $("deal-container").append(Container);

  const Yes = document.createElement("span");
  Yes.id = "deal-yes";
  Container.append(Yes);
  Yes.innerHTML = "DEAL";
  Yes.onclick = Deal;

  const No = document.createElement("span");
  No.id = "deal-no";
  Container.append(No);
  No.innerHTML = "NO DEAL";
  No.onclick = NoDeal;
}

function NoMoreDeals() {
  $("banker-heading").innerHTML = "Keine weiteren Angebote";
  $("deal-value").remove();
}

function CalculateDeal() {
  let value = 0;
  let numUnknown = 0;

  for (const c of cases) {
    value += c.value * !c.opened;
    numUnknown += !c.opened;
  }

  value /= numUnknown;

  let roundingTo = 1;
  if (value > 50) roundingTo = 5;
  if (value > 100) roundingTo = 10;
  if (value > 500) roundingTo = 50;
  if (value > 1000) roundingTo = 100;
  if (value > 5000) roundingTo = 500;
  if (value > 10000) roundingTo = 1000;
  if (value > 50000) roundingTo = 5000;
  if (value > 100000) roundingTo = 10000;

  console.log("Unknown:", numUnknown);
  console.log("Value:", value);
  console.log("Rounding:", roundingTo);

  value -= value % roundingTo;

  console.log("Rounded:", value);

  return `${value.toLocaleString(NumberNotation)}${EURO}`;
}

function Deal() {
  console.log("Congrats! You won x!");
}

function NoDeal() {
  $("deal-yn").remove();

  DealIndex++;
  state = 1;

  if (DealIndex == bankerIntervals.length - 1) return NoMoreDeals();

  $("banker-heading").innerHTML = "N\u00e4chstes Angebot in";
  $("deal-value").id = "deal-counter";
  $("deal-counter").innerHTML = bankerIntervals[DealIndex];
}

function EndGame() {
  $$(".value")[values.indexOf(playerCase.value)].id = "players-value";
}

function OpenSuitcase(i) {
  // chick if opening is possible
  if ($$(".suitcase")[i].classList.contains("players")) return;
  if ($$(".suitcase")[i].classList.contains("opened")) return;

  // html animation
  $$(".suitcase")[i].classList.add("opened");

  // reveal corresponding value
  $$(".value")[values.indexOf(cases[i].value)].classList.add("revealed");

  // check if game finished
  cases[i].opened = true;
  Opened++;
  if (Opened == cases.length - 1) return EndGame();
  UpdateDealCounter();
}

function UpdateDealCounter() {
  let count = parseInt($("deal-counter").innerHTML);
  count--;
  if (count > 0) $("deal-counter").innerHTML = count;
  else if (DealIndex < bankerIntervals.length - 1) CreateDealInterface();
}

function ChooseSuitcase(i) {
  playerCase = cases[i];
  $$(".suitcase")[i].classList.add("players");

  state++;
}

function Update(i) {
  if (state == 2) return;
  if (state == 1) OpenSuitcase(i);
  if (state === 0) ChooseSuitcase(i);
}

Array.prototype.shuffle = function () {
  if (this.length == 0) return this;
  for (let i = this.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    let temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }
  return this;
};

Init();

// Ü, ü     \u00dc, \u00fc
// Ä, ä     \u00c4, \u00e4
// Ö, ö     \u00d6, \u00f6
// ß        \u00df

/*

TODO:

keyboard accessibility
animation when deal counter is updated?
dialogue window when hovering on "i"
animation when players case value is revealed
endscreen
different themes
hsl theme colors
gaps, paddings, margins, border radii in variables
adjust sizing
add title?
Englisch/Deutsch Schalter

*/
