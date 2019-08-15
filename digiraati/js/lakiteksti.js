var lawList = document.querySelectorAll("#lakilista li"); // this returns an array of each li
//var finlex_base = "http://data.finlex.fi/eli/sd";
var finlex_base = "https://www.finlex.fi/fi/laki/alkup"
var headers = {"Accept":"application/ld+json"};
var num_comments = 0;
var current_comment = "";
var logged_in = false;
var original = "";
var page = "";
var comments = [];

var kaisu = "<h1>Suunnitelmassa linjattuja politiikkatoimia päästöjen vähentämiseksi</h1><br><br><h3>Liikenne</h3><br><p>Päästökaupan ulkopuolella parhaat mahdollisuudet vähentää päästöjä ovat liikenteessä, joka aiheuttaa nyt noin viidenneksen Suomen kasvihuonekaasupäästöistä. Sen osuus taakanjakosektorin päästöistä on 40 %. Tavoitteena on pudottaa liikenteen päästöt puoleen vuoteen 2030 mennessä verrattuna vuoden 2005 tilanteeseen. Vähennyspotentiaali on suurin tieliikenteessä, jonne toimia erityisesti kohdistetaan.</p><br><p>Päästöjä vähennetään korvaamalla fossiilisia polttoaineita uusiutuvilla ja vähäpäästöisillä sekä parantamalla ajoneuvojen ja liikennejärjestelmän energiatehokkuutta. Sähköautoille on tarjolla hankintatukea ja vanhojen autojen muuntamista bio- ja flexfuel-autoiksi edistetään. Sähköisten latausasemien ja biokaasua tarjoavia tankkausasemien rakentamista ja taloyhtiöiden sähköautojen latauspisteiden lisäämistä vauhditetaan.</p><br><p>Kaupunkiseutujen liikennejärjestelmiä kehitetään maankäytön, asumisen ja liikenteen (MAL) sopimusten kautta, täydennysrakentamista edistetään ja työpaikkoja ja palveluita ohjataan liikenteen solmukohtiin. Pyöräilyä ja kävelyä edistetään kuntien ja valtion yhteisellä ohjelmalla.</p><br><h3>Maatalous</h3><br><p>Maataloussektorin päästövähennyksiä tuovat lisätoimet koskevat pääasiassa eloperäisten maiden päästöjen hillintää. Päästöjä vähennetään muun muassa nostamalla pohjaveden pintaa säätösalaojituksen avulla, metsittämällä eloperäisiä maita ja edistämällä biokaasun tuotantoa maataloudessa. Tutkimus- ja kokeilutoiminnalla pyritään myös edistämään hiilen sitomista maaperään. Tämä on osa Suomen tukemaa kansainvälistä aloitetta maaperän hiilivarastojen lisäämisestä vuosittain neljän promillen verran.</p><br><h3>Rakennusten erillislämmitys</h3><br><p>Rakennusten erillislämmityksessä suurimmat päästöt aiheutuvat öljylämmityksestä. Öljyalaa velvoitetaan lisäämään myytävään lämmitysöljyyn biokomponenttia 10 prosenttia vuoteen 2030 mennessä. Biokomponentin nosto tehdään etupainotteisesti. Valtio luopuu öljylämmityksestä omistamissaan kiinteistössä vuoteen 2025 mennessä, ja kaikkia julkisia toimijoita kannustetaan samaan. Lisäksi edistetään pellettien ja klapien puhdasta polttoa.</p><br><h3>Jätteet</h3><br><p>Jätehuollon päästöt ovat peräisin kaatopaikkasijoituksesta, kompostoinnista, mädätyksestä ja jätevesien käsittelystä sekä jätteenpoltosta. Vaikka jätteenpoltto aiheuttaa hiilidioksidipäästöjä, se on hyvin kustannustehokas tapa leikata kasvihuonekaasupäästöjä verrattuna jätteen kaatopaikkasijoitukseen. Keskipitkän aikavälin suunnitelman toimena selvitetään jätteenpolton päästöjen siirtäminen päästökaupan piiriin. Lisäksi suunnitelmassa esitetään, että kaatopaikka-asetuksen toimeenpanoa valvotaan ja seurataan.</p><br><h3>F-kaasut</h3><br><p>F-kaasupäästöt tulevat erilaisista laitteista, joissa käytetään näitä ilmaston kannalta hyvin haitallisia teollisuuskaasuja. Nykytoimilla F-kaasujen päästöt vähenevät varsin tehokkaasti mutta viiveellä. Päästövähennyksen nopeuttamiseksi suunnitelmassa linjataan, että julkisen sektorin hankinnoissa vältetään F-kaasuja sisältäviä laitteita, edistetään vaihtoehtoisten teknologioiden käyttöönottoa ja tehostetaan F-kaasujen talteenottoa koulutuksen ja tiedotuksen keinoin sekä selvitetään ja demonstroidaan paikallisiin oloihin soveltuvia vaihtoehtoisia teknologioita.</p><br><h3>Työkoneet</h3><br><p>Työkoneiden hiilidioksidipäästöille asetetaan ensimmäistä kertaa päästövähennystavoitteita. Työkoneiden päästöjä voidaan vähentää parantamalla niiden energiatehokkuutta tai siirtymällä vaihtoehtoisiin polttoaineisiin tai käyttövoimiin. Suunnitelman toimenpiteinä ovat bionesteen sekoitevelvoite kevyeen polttoöljyyn, biokaasun käytön edistäminen työkoneissa sekä vähäpäästöisten työkoneiden lisääminen julkisten hankintojen kautta. Lisäksi lämmityspolttoaineiden verotusta nostettiin jo vuodelle 2018, millä on vaikutusta myös kevyen polttoöljyn hintaan.</p><br><h3>Poikkileikkaavat toimet</h3><br><p>Vaikuttaminen kulutuksen ja kulutuskäyttäytymiseen on keskeinen tapa vaikuttaa kulutusperäisiin kasvihuonekaasupäästöihin. Suunnitelmassa on määritelty joukko toimia, joilla voidaan vähentää kulutusperäisiä päästöjä. Päästölaskennassa nämä vähennystoimet näkyvät taakanjakosektorilla käytännössä esim. liikenteen, erillislämmityksen ja maatalouden päästöissä. Esimerkiksi kestävillä ruokavalinnoilla voidaan vaikuttaa kulutuksen hiilidioksidipäästöihin.</p><br><p>Energiatehokkuudessa on myös paljon poikkileikkaavia, sekä päästökauppasektorin että taakanjakosektorin päästöjä vähentäviä toimia ja uusia teknologioita. Puun pienpoltosta muodostuva musta hiili leviää ilmakehässä ja voimistaa arktisen alueen lämpenemistä. Puhtaan polton edistäminen vähentää sekä ilmasto- että terveysvaikutuksia.</p><br><p>Ilmastopolitiikan suunnitelma korostaa myös kuntien roolia, sillä kunnilla on vastuu paikallisen kaavoituksen, liikennesuunnittelun, joukkoliikenteen ja ympäristökasvatuksen järjestäjänä. Kuntien ja valtion välistä vuorovaikutusta ilmastopolitiikassa on edelleen tarpeen tiivistää. Julkiset hankinnat tarjoavat varteenotettavan mahdollisuuden edistää ilmastopolitiikan tavoitteita julkisen sektorin käytännön toiminnassa.</p>"

var socket = io();

socket.on('refresh comments', function(c){
  comments = c;
  display_comments();
});

lawList.forEach(function(item) {
  item.onclick = function(e) {
    page = this.innerHTML;
    display_text(this.id); // this returns clicked li's value
    socket.emit('comment refresh request', page);
  }
});

function display_text(id){
  original = kaisu;
  document.getElementById("lakiteksti").insertAdjacentHTML('afterbegin', original);
}

function get_text(id){
  url = finlex_base + id;
  var r = new XMLHttpRequest();
  r.open( "GET", url, false );
  r.setRequestHeader("Accept", "application/json");
  r.send();
}

function getSelectionText() {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  }
  return text;
}

$("#lakiteksti_container").mouseup(function(e){
  selected_text = getSelectionText();
  if(selected_text.length == 0){
    hide_context_menu();
    return;
  }
  else {
    open_context_menu(e);
  }
});

function open_context_menu(e){
  var rclickmenu = document.getElementById("rclickmenu");
  var quote = getSelectionText();
  var display_quote = quote;
  if(quote.length > 200){
    display_quote = display_quote.substr(0,200);
    display_quote = display_quote += "...";
  }
  document.getElementById("comment_quote").innerHTML = "\"" + display_quote + "\"";
  current_comment = quote;
  rclickmenu.style.left = e.pageX +"px";
  rclickmenu.style.top = e.pageY +"px";
  rclickmenu.style.display = "block";
}

function hide_context_menu(e){
  document.getElementById("rclickmenu").style.display = "none";
}

function startFocusOut(){
  $("#cancel_comment").on("click",function(){
    $("#rclickmenu").hide();
    $(document).off("click");
  });
}

function display_single_comment(c, i){
  var new_comment = document.createElement("a");
  new_comment.classList.add("comment");
  new_comment.innerHTML = c[0];
  new_comment.id = "comment-" + i;
  new_comment.value = c[1];
  new_comment.onmouseover = function(){bold_commented(this)};
  new_comment.onmouseout = function(){unbold_commented(this)};
  comment_list = document.getElementById("comment_container");
  comment_list.appendChild(new_comment);
  comment_list.appendChild(document.createElement('br'));
}

function clear_comments(){
  comment_list = document.getElementById("comment_container");
  while (comment_list.firstChild) {
    comment_list.removeChild(comment_list.firstChild);
  }
}

function display_comments(){
  clear_comments();
  for(i = 0; i < comments.length; ++i){
    display_single_comment(comments[i], i);
  }
}

function comment(){
  comment_text = document.getElementById("comment_text").value;
  socket.emit('add comment', page, comment_text, current_comment);
  document.getElementById('rclickmenu').style.display = "none";
}

function cancel_comment(){
  document.getElementById('rclickmenu').style.display = "none";
}

function bold_commented(e){
  var text_element = document.getElementById("lakiteksti");
  text = text_element.innerHTML;
  var i = text.indexOf(e.value);
  if(i > -1){
    var text_length = e.value.length;
    var temp_text = text.substr(0, i) + '<span style="color:#0000FF"><b><b>';
    temp_text = temp_text + text.substr(i, text_length);
    temp_text = temp_text + "</b></b></span>" + text.substr(text_length + i);
    text_element.innerHTML = temp_text;
  }
}

function unbold_commented(e){
  var text_element = document.getElementById("lakiteksti");
  text_element.innerHTML = original;
}

function home(){
  goToPage("/");
}
