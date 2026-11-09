let myTable;

let maxLunghezza = 0;
let maxPortata = 0;
let minTemp = 100;
let maxTemp = -100;
let sommaFattoriPortata = 0;

// continenti
let continenti = ["Africa", "Asia", "North America", "South America", "Europe", "Oceania"];
let nomiContinenti = ["Africa", "Asia", "America del Nord", "America del Sud", "Europa", "Oceania"];

// colori gradienti temperatura (freddo - caldo)
let coloreFreddo;
let coloreMedio;
let coloreCaldo;


async function setup() {
  myTable = await loadTable("assets/rivers.csv", ",", "header");

  createCanvas(windowWidth, windowHeight);

  let totaleFiumi = myTable.getRowCount();

  for (let numRiga = 0; numRiga < totaleFiumi; numRiga++) {
    let lunghezza = myTable.getNum(numRiga, "length");
    if (lunghezza > maxLunghezza) maxLunghezza = lunghezza;

    let portata = myTable.getNum(numRiga, "discharge");
    if (portata > maxPortata) maxPortata = portata;

    let temp = myTable.getNum(numRiga, "avg_temp");
    if (temp < minTemp) minTemp = temp;
    if (temp > maxTemp) maxTemp = temp;
  }

  // somma dei fattori di portata 
  for (let numRiga = 0; numRiga < totaleFiumi; numRiga++) {
    let portata = myTable.getNum(numRiga, "discharge");
    sommaFattoriPortata += (portata / maxPortata);
  }

  // azzurro - giallo - arancione
  coloreFreddo = color(80, 180, 235);
  coloreMedio = color(250, 210, 100);
  coloreCaldo = color(240, 110, 20);
}


function draw() {
 
  background(240, 242, 245);

  let margineSx = 80;
  let margineDx = 80;
  let baseY = windowHeight - 70;            
  let altezzaMax = baseY - 180;             
  let altezzaMin = 12;                      
  let spazioGruppi = 25;                    
  let spazioFiumi = 2;                      

  let totaleFiumi = myTable.getRowCount();
  let numGruppi = continenti.length;
  
  // calcolo per la viewport 
  let larghezzaDisponibile = windowWidth - margineSx - margineDx;
  let spazioTotaleTraGruppi = spazioGruppi * (numGruppi - 1);
  let spazioTotaleTraFiumi = spazioFiumi * (totaleFiumi - numGruppi);
  
  // Spazio per barre dei fiumi
  let spazioPerBarre = larghezzaDisponibile - spazioTotaleTraGruppi - spazioTotaleTraFiumi;
  
  let larghezzaMin = 3; 
  // Ricaviamo la larghezza massima 
  let larghezzaMax = larghezzaMin + (spazioPerBarre - (totaleFiumi * larghezzaMin)) / sommaFattoriPortata;
  if (larghezzaMax < larghezzaMin) larghezzaMax = larghezzaMin * 2;

  let fiumeHover = -1;


  // Griglia km
  textSize(11);
  textAlign(RIGHT, CENTER);
  for (let km = 0; km <= maxLunghezza; km = km + 2000) {
    let y = baseY - map(km, 0, maxLunghezza, 0, altezzaMax);
    stroke(210, 216, 224);
    line(margineSx - 10, y, windowWidth - margineDx, y);
    noStroke();
    fill(110, 120, 135);
    text(formatta(km) + " km", margineSx - 16, y);
  }


  // Fiumi
  let posx = margineSx;

  for (let numCont = 0; numCont < continenti.length; numCont++) {

    let inizioGruppo = posx;
    let conta = 0;

    for (let numRiga = 0; numRiga < myTable.getRowCount(); numRiga++) {

      let continente = myTable.getString(numRiga, "continent");
      if (continente == "Australia") {
        continente = "Oceania";
      }

      if (continente == continenti[numCont]) {

        let lunghezza = myTable.getNum(numRiga, "length");
        let altezzaCalculata = map(lunghezza, 0, maxLunghezza, 0, altezzaMax);
        let altezza = max(altezzaCalculata, altezzaMin);

        let portata = myTable.getNum(numRiga, "discharge");
        let larghezza = larghezzaMin + (portata / maxPortata) * (larghezzaMax - larghezzaMin);

        let temp = myTable.getNum(numRiga, "avg_temp");

        let sopra = mouseX >= posx - (spazioFiumi / 2) && 
                    mouseX < posx + larghezza + (spazioFiumi / 2) &&
                    mouseY > baseY - altezzaMax - 20 && mouseY < baseY;

        // glifo del fiume
        noStroke();
        fill(coloreTemperatura(temp));
        rect(posx, baseY - altezza, larghezza, altezza);

        // evidenziazione al passaggio del mouse
        if (sopra) {
          fiumeHover = numRiga;
          noFill();
          stroke(35, 45, 60);
          strokeWeight(1.5);
          rect(posx - 1, baseY - altezza - 2, larghezza + 2, altezza + 4);
          strokeWeight(1);
        }

        posx = posx + larghezza + spazioFiumi;
        conta = conta + 1;
      }
    }

    // toglie spazio in ecceso
    posx = posx - spazioFiumi;
    let fineGruppo = posx;
    let centro = (inizioGruppo + fineGruppo) / 2;

    // linea e nome del continente in basso
    stroke(35, 45, 60);
    strokeWeight(2);
    line(inizioGruppo, baseY + 1, fineGruppo, baseY + 1);
    strokeWeight(1);

    noStroke();
    textAlign(CENTER, TOP);
    fill(35, 45, 60);
    textSize(13);
    text(nomiContinenti[numCont], centro, baseY + 14);
    fill(110, 120, 135);
    textSize(11);
    text(conta + " fiumi", centro, baseY + 32);

    // spazio prima del prossimo continente
    if (numCont < continenti.length - 1) {
      posx = posx + spazioGruppi;
    }
  }


  // titolo
  noStroke();
  textAlign(LEFT, TOP);
  fill(35, 45, 60);
  textFont("Georgia");
  textStyle(BOLD);
  textSize(28);
  text("World Rivers", margineSx, 28);

  textFont("sans-serif");
  textStyle(NORMAL);
  textSize(12);
  fill(80, 90, 105);
  text("Questo istogramma mostra la lunghezza, portata e temperatura dei fiumi del mondo.", margineSx, 66, 350, 40);


  // legenda
  let lx = windowWidth - margineDx - 210;
  let ly = 28;

  fill(35, 45, 60);
  textStyle(BOLD);
  textSize(13);
  text("Legenda", lx, ly);

  textStyle(NORMAL);
  textSize(12);
  fill(80, 90, 105);
  text("Altezza = lunghezza (max " + formatta(maxLunghezza) + " km)", lx, ly + 20);
  text("Larghezza = portata (max " + formatta(maxPortata) + " m³/s)", lx, ly + 36);
  text("Colore = temperatura media", lx, ly + 52);

  // barra del gradiente di temperatura
  let larghezzaBarra = 220;
  for (let i = 0; i < larghezzaBarra; i++) {
    let t = map(i, 0, larghezzaBarra - 1, minTemp, maxTemp);
    stroke(coloreTemperatura(t));
    line(lx + i, ly + 72, lx + i, ly + 84);
  }
  noStroke();
  fill(80, 90, 105);
  textSize(11);
  textAlign(LEFT, TOP);
  text(formatta(minTemp) + " °C", lx, ly + 88);
  textAlign(RIGHT, TOP);
  text(formatta(maxTemp) + " °C", lx + larghezzaBarra, ly + 88);


  // more info sul fiume con hoover
  if (fiumeHover >= 0) {
    
    let rawNome = myTable.getString(fiumeHover, "name");
    let nome = rawNome.split('/')[0].split('(')[0].trim().replaceAll("–", " – ");
    
    let lunghezza = myTable.getNum(fiumeHover, "length");
    let portata = myTable.getNum(fiumeHover, "discharge");
    let temp = myTable.getNum(fiumeHover, "avg_temp");
    let sbocco = myTable.getString(fiumeHover, "outflow");
    let colFiume = coloreTemperatura(temp);

    let boxL = 340;
    let boxA = 125;
    let boxX = (windowWidth - boxL) / 2; // Centrato orizzontalmente nello spazio bianco in alto
    let boxY = 28;

    // Sfondo del box
    fill(255);
    stroke(200, 206, 214);
    strokeWeight(1);
    rect(boxX, boxY, boxL, boxA, 8);

    // Riga superiore personalizzata con il colore del fiume
    noStroke();
    fill(colFiume);
    rect(boxX + 1, boxY + 1, boxL - 2, 6, 8, 8, 0, 0);

    // Testi del box
    fill(35, 45, 60);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(15);
    text(nome, boxX + 16, boxY + 18, boxL - 32, 38);

    textStyle(NORMAL);
    textSize(12);
    fill(80, 90, 105);
    text("Lunghezza: " + formatta(lunghezza) + " km", boxX + 16, boxY + 56);
    text("Portata: " + formatta(portata) + " m³/s", boxX + 16, boxY + 72);
    text("Temperatura media: " + formatta(temp) + " °C", boxX + 16, boxY + 88);
    text("Sfocia in: " + sbocco, boxX + 16, boxY + 104, boxL - 32, 20);

  }
}


function coloreTemperatura(temp) {
  let t = map(temp, minTemp, maxTemp, 0, 1);

  if (t < 0.5) {
    return lerpColor(coloreFreddo, coloreMedio, t * 2);
  } else {
    return lerpColor(coloreMedio, coloreCaldo, (t - 0.5) * 2);
  }
}



function formatta(valore) {
  return valore.toLocaleString("de-DE");
}