
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

var ilmastolaki = '<div id="laki-alkup"><p class="annettu">Annettu Helsingissä 22 päivänä toukokuuta 2015</p><h3><strong>Ilmastolaki </strong> </h3><p>Eduskunnan päätöksen mukaisesti säädetään:</p><h5 id="Pidp445839744">12009§</h5><h5 class="ot">Lain tarkoitus ja tavoitteet</h5><p class="py">Tämän lain tarkoituksena on:</p><p class="py">1)2002vahvistaa puitteet Suomen ilmastopolitiikan suunnittelulle ja sen toteutumisen seurannalle;</p><p class="py">2)2002tehostaa ja sovittaa yhteen valtion viranomaisten toimintaa ilmastonmuutoksen hillitsemiseen ja siihen sopeutumiseen tähtäävien toimenpiteiden suunnittelussa ja täytäntöönpanon seurannassa;</p><p class="py">3)2002vahvistaa eduskunnan ja yleisön mahdollisuuksia osallistua ja vaikuttaa Suomen ilmastopolitiikan suunnitteluun.</p><p class="py">Lain ja sen mukaisen ilmastopolitiikan suunnittelujärjestelmän tavoitteena on:</p><p class="py">1)2002varmistaa osaltaan Suomea sitovista sopimuksista sekä Euroopan unionin lainsäädännöstä johtuvien kasvihuonekaasujen vähentämistä ja seurantaa koskevien velvoitteiden täyttyminen;</p><p class="py">2)2002vähentää ihmisen aiheuttamia kasvihuonekaasupäästöjä ilmakehään, kansallisin toimin osaltaan hillitä ilmastonmuutosta ja sopeutua siihen.</p><h5 id="Pidp447026304">22009§</h5><h5 class="ot">Soveltamisala</h5><p class="py">Tässä laissa säädetään valtion viranomaisten tehtävistä ilmastopolitiikan suunnitelmien laatimisessa sekä niiden täytäntöönpanon varmistamisessa.</p><p class="py">Sen lisäksi, mitä tässä laissa säädetään ilmastonmuutoksen hillitsemisestä tai ilmastonmuutokseen sopeutumisesta, noudatetaan, mitä niistä muussa laissa säädetään.</p><p class="py">Päästökauppasektoriin kuuluvista kasvihuonekaasujen päästöistä ja toimista niiden vähentämiseksi säädetään päästökauppalaissa (311/2011), lentoliikenteen päästökaupasta annetussa laissa (34/2010) ja Kioton mekanismien käytöstä annetussa laissa (109/2007).</p><h5 id="Pidp447328064">32009§</h5><h5 class="ot">Vaikutukset muuhun suunnitteluun ja päätöksentekoon</h5><p class="py">Tämän lain nojalla laaditut suunnitelmat on, siten kuin niistä muussa laissa erikseen säädetään, otettava huomioon suunniteltaessa ja päätettäessä muun lainsäädännön nojalla kasvihuonekaasujen päästöjen vähentämistä, ilmastonmuutoksen hillitsemistä ja ilmastonmuutokseen sopeutumista koskevista toimista.</p><h5 id="Pidp447330480">42009§</h5><h5 class="ot">Ilmastonmuutoksen hillitsemistä ja siihen sopeutumista edistävät toimet</h5><p class="py">Valtion viranomaisen on edistettävä toiminnassaan mahdollisuuksien mukaan tämän lain mukaisten suunnitelmien toteutumista.</p><h5 id="Pidp447332576">52009§</h5><h5 class="ot">Määritelmät</h5><p class="py">Tässä laissa tarkoitetaan:</p><p class="py">1)2002<em>kasvihuonekaasulla</em> hiilidioksidia, metaania, typpioksiduulia, fluorihiilivetyjä, perfluorihiilivetyjä, rikkiheksafluoridia, typpitrifluoridia ja muita ilmakehän luonnollisia ja ihmisen toiminnan aiheuttamia kaasumaisia ainesosia, jotka ottavat vastaan ja lähettävät edelleen infrapunasäteilyä, siten kuin niistä kulloinkin voimassa olevissa Suomea sitovissa kansainvälisissä velvoitteissa määrätään;</p><p class="py">2)2002<em>ilmastonmuutoksella</em> sellaista muutosta ilmastossa, joka aiheutuu maapallon ilmakehän koostumusta suoraan tai välillisesti muuttavasta ihmisen toiminnasta ja joka ylittää ilmaston luonnollisen vaihtelun vertailukelpoisten ajanjaksojen kuluessa;</p><p class="py">3)2002<em>ilmastonmuutoksen hillitsemisellä</em> ihmisten toiminnasta aiheutuvien kasvihuonekaasupäästöjen syntymisen ja niiden ilmakehään pääsemisen estämistä sekä muuta ilmastonmuutoksen vaikutusten lieventämistä tai poistamista;</p><p class="py">4)2002<em>ilmastonmuutokseen sopeutumisella</em> toimia, joilla varaudutaan ja mukaudutaan ilmastonmuutokseen ja sen vaikutuksiin sekä toimia, joiden avulla voidaan hyötyä ilmastonmuutokseen liittyvistä vaikutuksista;</p><p class="py">5)2002<em>politiikkatoimilla</em> niitä valtion viranomaisten toimenpiteitä, joilla vaikutetaan kasvihuonekaasupäästöihin ja ilmastonmuutokseen sopeutumiseen;</p><p class="py">6)2002<em>kansallisella kasvihuonekaasujen inventaariojärjestelmällä</em> järjestelmästä kasvihuonekaasupäästöjen seuraamiseksi ja niistä raportoimiseksi sekä muista ilmastonmuutosta koskevista tiedoista raportoimiseksi kansallisella ja unionin tasolla sekä päätöksen N:o 280/2004/EY kumoamisesta annetun Euroopan parlamentin ja neuvoston asetuksen (EU) N:o 525/201320093 artiklan 2 kohdassa tarkoitettua kansallista inventaariojärjestelmää;</p><p class="py">7)2002<em>kansallisella politiikkatoimien raportointijärjestelmällä</em> 6 kohdassa mainitun asetuksen 3 artiklan 15 kohdassa tarkoitettua politiikkojen ja toimien sekä ennusteiden järjestelmää;</p><p class="py">8)2002<em>päästökauppasektorilla</em> päästökauppalain 2—52009§:ssä tarkoitettuja mainitun lain soveltamisalaan kuuluvia päästöjä ja lentoliikenteen päästökaupasta annetun lain 22009§:ssä tarkoitettuja mainitun lain soveltamisalaan kuuluvia päästöjä;</p><p class="py">9)2002<em>päästökaupan ulkopuolisella sektorilla</em> jäsenvaltioiden pyrkimyksistä vähentää kasvihuonekaasupäästöjään yhteisön kasvihuonekaasupäästöjen vähentämissitoumusten täyttämiseksi vuoteen 2020 mennessä annetun Euroopan parlamentin ja neuvoston päätöksen N:o 406/2009/EY 2 artiklan 1 kohdassa tarkoitettuja kasvihuonekaasujen päästöjä.</p><h5 id="Pidp446373136">62009§</h5><h5 class="ot">Ilmastopolitiikan suunnittelujärjestelmä</h5><p class="py">Tämän lain mukainen ilmastopolitiikan suunnittelujärjestelmä muodostuu seuraavista osista:</p><p class="py">1)2002pitkän aikavälin ilmastopolitiikan suunnitelma;</p><p class="py">2)2002keskipitkän aikavälin ilmastopolitiikan suunnitelma, joka perustuu 1 kohdassa tarkoitetun suunnitelman arvioihin ja tavoitteisiin;</p><p class="py">3)2002ilmastonmuutoksen kansallinen sopeutumissuunnitelma.</p><p class="py">Ilmastopolitiikan suunnittelujärjestelmän tarkoituksena on määrittää kasvihuonekaasujen päästöjen vähentämisen ja ilmastonmuutokseen sopeutumisen tavoitteet sekä niiden saavuttamiseksi tarvittavat toimet eri hallinnonaloilla siten kuin jäljempänä tarkemmin säädetään.</p><p class="py">Ilmastopolitiikan suunnittelujärjestelmän tavoitteena on osaltaan varmistaa, että ihmisen toiminnasta aiheutuvien kasvihuonekaasujen kokonaispäästöt ilmakehään vähentyvät Suomen osalta vuoteen 2050 mennessä vähintään 80 prosenttia verrattuna vuoteen 1990. Jos Suomea sitovaan kansainväliseen sopimukseen tai Euroopan unionin lainsäädäntöön sisältyy edellä mainitusta poikkeava vuoteen 2050 asetettu kasvihuonekaasujen kokonaispäästöjä koskeva vähennystavoite, suunnittelujärjestelmän pitkän aikavälin päästövähennystavoitteen tulee perustua siihen. Ilmastonmuutokseen sopeutumisen suunnittelussa tavoitteena on edistää ilmastonmuutoksen aiheuttamien riskien hallintaa ja toimialakohtaista sopeutumista ilmastonmuutokseen.</p><p class="py">Ilmastopolitiikan suunnitelmien laadinnassa tavoitteena on kustannustehokkaalla tavalla pyrkiä sekä hillitsemään ilmastonmuutosta että sopeutumaan siihen. Ilmastonmuutoksen hillitsemistä ja siihen sopeutumista koskevat tavoitteet ja toimet on asetettava suunnitelmissa tieteellisen tiedon perusteella siten, että otetaan huomioon ilmastonmuutoksen eteneminen, sen todennäköiset myönteiset ja kielteiset vaikutukset, siihen liittyvät vaarat ja riskit sekä mahdollisuudet onnettomuuksien estämiseen ja niiden haitallisten vaikutusten rajoittamiseen. Maataloustuotantoon liittyvässä suunnittelussa on varmistettava, että ilmastonmuutoksen hillitsemiseen liittyvät toimet suunnitellaan ja toteutetaan niin, etteivät ne vaaranna kotimaista ruuan tuotantoa tai globaalia ruokaturvaa.</p><p class="py">Ilmastopolitiikan suunnitelmien laatimisessa on lisäksi otettava huomioon seuraavat seikat:</p><p class="py">1)2002Suomea sitovista kansainvälisistä sopimuksista ja Euroopan unionin lainsäädännöstä johtuvat velvoitteet;</p><p class="py">2)2002kansallisessa kasvihuonekaasupäästöjen inventaariojärjestelmässä ja kansallisessa politiikkatoimien raportointijärjestelmässä tuotetut tiedot;</p><p class="py">3)2002ilmastonmuutosta koskeva ajantasainen tieteellinen tieto sekä arviot kansainvälisen ja Euroopan unionin ilmastopolitiikan kehityksestä;</p><p class="py">4)2002ympäristölliset, taloudelliset ja sosiaaliset tekijät kestävän kehityksen periaatteen mukaisesti;</p><p class="py">5)2002kasvihuonekaasujen vähentämistä ja ilmastonmuutoksen hillitsemistä sekä ilmastonmuutokseen sopeutumista koskevan teknologian taso ja kehitys;</p><p class="py">6)2002muut yhteiskunnan kehityksen kannalta olennaiset tekijät.</p><h5 id="Pidp446388112">72009§</h5><h5 class="ot">Pitkän aikavälin ilmastopolitiikan suunnitelma</h5><p class="py">Valtioneuvosto hyväksyy vähintään kerran kymmenessä vuodessa pitkän aikavälin ilmastopolitiikan suunnitelman päästökauppasektoriin sekä päästökaupan ulkopuoliseen sektoriin kohdistuvista keskeisistä politiikkatoimista, joilla saavutetaan 62009§:n 3 momentissa tarkoitetut pitkän aikavälin kasvihuonekaasupäästöjen vähentämistä ja ilmastonmuutoksen hillitsemistä ja ilmastonmuutokseen sopeutumista koskevat tavoitteet.</p><p class="py">Sen lisäksi, mitä 1 momentissa säädetään, pitkän aikavälin ilmastopolitiikan suunnitelmassa esitetään seuraavat asiat:</p><p class="py">1)200262009§:n 3 momentissa tarkoitettuun kasvihuonekaasujen vähennystavoitteeseen perustuvat kasvihuonekaasupäästöjen skenaariot vuoteen 2050 sekä keskeiset toimialakohtaiset etenemisvaihtoehdot pitkän aikavälin päästövähennystavoitteen saavuttamiseksi;</p><p class="py">2)2002kuvauksen ilmastopolitiikan kansainvälisestä ja eurooppalaisesta toimintaympäristöstä ja sen kehitysnäkymistä pitkällä aikavälillä;</p><p class="py">3)2002arvion kasvihuonekaasujen päästöjen vähennysmenetelmien kehitysnäkymistä Suomen näkökulmasta;</p><p class="py">4)2002muut tarpeelliseksi katsotut seikat.</p><h5 id="Pidp446285648">82009§</h5><h5 class="ot">Ilmastonmuutoksen kansallinen sopeutumissuunnitelma</h5><p class="py">Valtioneuvosto hyväksyy ilmastonmuutoksen kansallisen sopeutumissuunnitelman vähintään kerran kymmenessä vuodessa.</p><p class="py">Sopeutumissuunnitelma sisältää riski- ja haavoittuvuustarkastelun sekä tarpeen mukaan hallinnonaloittaisia sopeutumista koskevia toimintaohjelmia.</p><h5 id="Pidp446288432">92009§</h5><h5 class="ot">Keskipitkän aikavälin ilmastopolitiikan suunnitelma</h5><p class="py">Valtioneuvosto hyväksyy kerran vaalikaudessa keskipitkän aikavälin ilmastopolitiikan suunnitelman. Suunnitelmaan sisältyy toimenpideohjelma, jossa esitetään, millä toimilla ihmisen toiminnasta aiheutuvia kasvihuonekaasujen päästöjä vähennetään ja ilmastonmuutosta hillitään päästökaupan ulkopuolisella sektorilla, sekä päästökehitysarviot kasvihuonekaasujen päästöjen kehityksestä ja politiikkatoimien vaikutuksista siihen.</p><p class="py">Edellä 1 momentissa tarkoitetussa ilmastotoimenpideohjelmassa esitetään seuraavat asiat:</p><p class="py">1)2002kansainvälisistä sopimuksista ja Euroopan unionin lainsäädännöstä johtuvat sitoumukset kasvihuonekaasupäästöjen vähentämiseksi;</p><p class="py">2)2002nykyiset päästökaupan ulkopuoliseen sektoriin kohdistuvat politiikkatoimet kasvihuonekaasupäästöjen vähentämiseksi ja arvio niiden vaikuttavuudesta;</p><p class="py">3)2002edellä 72009§:ssä tarkoitetun pitkän aikavälin ilmastopolitiikan suunnitelman ja tämän momentin 1 kohdassa tarkoitettujen sitoumusten mukaisten kasvihuonekaasupäästöjen vähentämistä koskevien tavoitteiden saavuttamiseksi mahdollisesti tarvittavat uudet päästökaupan ulkopuoliseen sektoriin kohdistuvat politiikkatoimet ja arvio niiden vaikuttavuudesta;</p><p class="py">4)2002muut tarpeelliseksi katsotut seikat.</p><p class="py">Edellä 1 momentissa tarkoitetuissa päästökehitysarvioissa esitetään seuraavat asiat:</p><p class="py">1)2002tiedot Suomen kasvihuonekaasujen kokonaispäästöjen kehityksestä vuodesta 1990;</p><p class="py">2)2002tiedot päästökauppasektorin ja päästökaupan ulkopuolisen sektorin päästöjen kehityksestä vuodesta 2005;</p><p class="py">3)2002arvio kasvihuonekaasujen kokonaispäästöjen ja erikseen päästökaupan ulkopuolisen sektorin päästöjen kehityksestä suunnitelman hyväksymistä seuraavien 10—20 vuoden aikana nykyisten politiikkatoimien perusteella;</p><p class="py">4)2002arvio päästökaupan ulkopuolisen sektorin päästöjen kehityksestä suunnitelman hyväksymistä seuraavien 10—20 vuoden aikana nykyisten ja 2 momentin 3 kohdassa tarkoitettujen uusien politiikkatoimien perusteella;</p><p class="py">5)2002muut tarpeelliseksi katsotut seikat.</p><p class="py">Keskipitkän aikavälin ilmastopolitiikan suunnitelma tulee sovittaa tarvittavilta osin yhteen energia- ja liikennepolitiikan suunnittelun kanssa.</p><h5 id="Pidp446300592">102009§</h5><h5 class="ot">Ilmastopolitiikan suunnitelmien valmistelu</h5><p class="py">Edellä 7—92009§:ssä tarkoitettuja ilmastopolitiikan suunnitelmia valmisteltaessa on yleisölle varattava tilaisuus tutustua suunnitelmaluonnokseen sekä esittää siitä mielipiteensä kirjallisesti. Lisäksi keskeisiltä viranomaisilta ja yhteisöiltä sekä 162009§:ssä tarkoitetulta tieteelliseltä asiantuntijaelimeltä on pyydettävä suunnitelmaluonnoksesta lausunto.</p><p class="py">Ilmastopolitiikan suunnitelmien ympäristövaikutusten arvioinnista säädetään viranomaisten suunnitelmien ja ohjelmien ympäristövaikutusten arvioinnista annetussa laissa (200/2005). Suunnitelmien laatimisen yhteydessä myös niiden taloudelliset ja sosiaaliset sekä muut vaikutukset on selvitettävä tarpeellisessa määrin.</p><h5 id="Pidp446304176">112009§</h5><h5 class="ot">Selonteko eduskunnalle</h5><p class="py">Valtioneuvosto antaa eduskunnalle selonteon hyväksymästään 72009§:ssä tarkoitetusta pitkän aikavälin ilmastopolitiikan suunnitelmasta. Selontekoon sisällytetään tarvittaessa tiedot 82009§:ssä tarkoitetusta ilmastonmuutoksen kansallisesta sopeutumissuunnitelmasta.</p><p class="py">Valtioneuvosto antaa eduskunnalle selonteon hyväksymästään 92009§:ssä tarkoitetusta keskipitkän aikavälin ilmastopolitiikan suunnitelmasta.</p><h5 id="Pidp446307280">122009§</h5><h5 class="ot">Ilmastopolitiikan suunnitelmien toteutumisen seuranta</h5><p class="py">Valtioneuvoston on seurattava 7—92009§:ssä tarkoitettujen ilmastopolitiikan suunnitelmien toteutumista riittävästi sen toteamiseksi, saavutetaanko suunnitelmien mukaisilla politiikkatoimilla niissä asetetut ilmastonmuutoksen hillitsemistä ja sopeutumista koskevat tavoitteet. Seurannan perusteella valtioneuvosto päättää tarvittaessa tavoitteiden saavuttamiseksi tarvittavista lisätoimista.</p><p class="py">Valtioneuvoston on seurattava 62009§:n 3 momentissa tarkoitetun päästövähennystavoitteen riittävyyttä ajantasaisen ilmastonmuutoksen etenemistä koskevan tieteellisen tiedon perusteella sekä sen varmistamiseksi, että tavoite täyttää Suomea sitovien kansainvälisten sopimusten ja Euroopan unionin lainsäädännön mukaiset velvoitteet.</p><p class="py">Edellä 7 ja 92009§:ssä tarkoitettujen ilmastopolitiikan suunnitelmiin sisältyvien päästökehitysarvioiden toteutumista on seurattava kansallisessa kasvihuonekaasujen inventaariojärjestelmässä vuosittain tuotettujen Suomen kasvihuonekaasupäästöjä koskevien tietojen perusteella. Lisäksi suunnitelmien seurannassa on huomioitava kansallisessa politiikkatoimien raportointijärjestelmässä tuotetut tiedot.</p><p class="py">Seurannan tuloksista on tiedotettava yleisölle riittävästi.</p><h5 id="Pidp446312688">132009§</h5><h5 class="ot">Ilmastopolitiikan suunnitelmien muuttaminen</h5><p class="py">Valtioneuvoston on 122009§:n 1 momentissa tarkoitetun lisätoimia koskevan päätöksen mukaisesti muutettava 7—92009§:ssä tarkoitettuja ilmastopolitiikan suunnitelmia. Suunnitelmien muuttamisessa noudatetaan, mitä 102009§:ssä säädetä��n suunnitelmien valmistelussa noudatettavasta menettelystä.</p><p class="py">Sen lisäksi, mitä 1 momentissa säädetään, 7—92009§:ssä tarkoitettuja ilmastopolitiikan suunnitelmia voidaan muuttaa myös niiden sisältämissä merkitykseltään vähäisissä tiedoissa ilmenneiden puutteiden johdosta. Tällaisen seikan muuttaminen voidaan suorittaa noudattamatta 102009§:n mukaista menettelyä.</p><h5 id="Pidp446316208">142009§</h5><h5 class="ot">Ilmastovuosikertomus</h5><p class="py">Valtioneuvosto toimittaa kalenterivuosittain eduskunnalle tiedot päästökehityksestä sekä 92009§:ssä tarkoitettuun keskipitkän aikavälin ilmastopolitiikan suunnitelmaan sisältyvien päästövähennystavoitteiden toteutumisesta ja niiden saavuttamisen edellyttämistä 122009§:n 1 momentissa tarkoitetuista lisätoimista (<em>ilmastovuosikertomus</em>).</p><p class="py">Valtioneuvosto toimittaa osana ilmastovuosikertomusta edellä 92009§:n 1 momentissa tarkoitettujen politiikkatoimien toteutumista koskevat tiedot eduskunnalle joka toinen vuosi.</p><p class="py">Ilmastovuosikertomukseen tulee sisällyttää vähintään kerran vaalikaudessa tarvittavassa laajuudessa arvio 82009§:ssä tarkoitettuun sopeutumissuunnitelmaan sisältyvien sopeutumistoimien riittävyydestä ja tehokkuudesta sekä tarvittaessa selostus suunniteltujen sopeutumistoimien toteutumisesta hallinnonalakohtaisesti.</p><h5 id="Pidp446321088">152009§</h5><h5 class="ot">Viranomaisten tehtävät</h5><p class="py">Kukin ministeriö valmistelee hallinnonalaansa koskevan osuuden 7—92009§:ssä tarkoitetuista ilmastopolitiikan suunnitelmista ja toimittaa hallinnonalaansa koskevat tiedot 14 §:n mukaista ilmastovuosikertomusta varten. Ilmastopolitiikan suunnitelmien yhteensovittamisesta ja kokoamisesta vastaa 72009§:ssä tarkoitetun pitkän aikavälin ilmastopolitiikan suunnitelman osalta työ- ja elinkeinoministeriö, 82009§:ssä tarkoitetun ilmastonmuutoksen kansallisen sopeutumissuunnitelman osalta maa- ja metsätalousministeriö ja 92009§:ssä tarkoitetun keskipitkän aikavälin ilmastopolitiikan suunnitelman osalta ympäristöministeriö. Ilmastovuosikertomuksen kokoamisesta vastaa ympäristöministeriö.</p><p class="py">Tämän lain mukaisten suunnitelmien täytäntöönpanon ohjaus ja seuranta kuuluvat toimialallaan kullekin ministeriölle.</p><p class="py">Kasvihuonekaasujen kansallisen inventaariojärjestelmän vastuuyksikkönä toimii Tilastokeskus.</p><p class="py">Valtioneuvoston asetuksella voidaan antaa tarkempia säännöksiä tässä pykälässä tarkoitetuista viranomaisten tehtävistä.</p><h5 id="Pidp446326576">162009§</h5><h5 class="ot">Tieteellinen asiantuntijaelin</h5><p class="py">Valtioneuvosto asettaa tieteellisen ja riippumattoman asiantuntijaelimen ilmastopolitiikan suunnittelun ja sitä koskevan päätöksenteon tueksi. Asiantuntijaelimen nimi on Suomen ilmastopaneeli ja sen tehtävänä on ilmastopolitiikan suunnittelua ja seurantaa varten koostaa ja eritellä tieteellistä tietoa ilmastonmuutoksen hillitsemisestä ja siihen sopeutumisesta. Asiantuntijaelin voi suorittaa myös muita ilmastonmuutosta koskevan tietopohjan tuottamista koskevia tehtäviä.</p><p class="py">Asiantuntijaelimessä tulee olla edustus eri tieteenaloilta. Asiantuntijaelimen jäsenet nimitetään määräajaksi.</p><p class="py">Valtioneuvoston asetuksella voidaan antaa tarkempia säännöksiä tieteellisen asiantuntijaelimen tehtävistä ja kokoonpanosta.</p><h5 id="Pidp446330960">172009§</h5><h5 class="ot">Voimaantulo</h5><p class="py">Tämä laki tulee voimaan 1 päivänä kesäkuuta 2015.</p><a class="ulos" href="https://www.eduskunta.fi/valtiopaivaasiat/he+82/2014" title="Linkki hallituksen esitykseen Eduskunnan palvelimelle">HE 82/2014</a><br />YmVM 22/2014<br />EV 310/2014<p class="center">20032003Helsingissä 22 päivänä toukokuuta 2015</p><p class="center">Tasavallan Presidentti<br /><strong>SAULI NIINISTÖ</strong></p><p class="center">Ympäristöministeri<br /><strong>Sanni Grahn-Laasonen</strong></p></div>'

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
  //html = get_text(id);
  //lakihtml = httpGet(finlex_base + id);
  //console.log(html);
  //text = lakihtml.getElementById('laki-alkup');
  //console.log(text);
  //original = new DOMParser().parseFromString(ilmastolaki, "text/xml");
  original = ilmastolaki;
  document.getElementById("lakiteksti").insertAdjacentHTML('afterbegin', original);
}

function get_text(id){
  url = finlex_base + id;
  console.log(url);
  var r = new XMLHttpRequest();
  r.open( "GET", url, false );
  console.log(r);
  r.setRequestHeader("Accept", "application/json");
  r.send();
  //var data = JSON.parse(r["response"]);
//return data["temporalVersion"]["languageVersion"]["hasFormat"]["content_fi"];
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
  console.log("cancelling comment");
  document.getElementById('rclickmenu').style.display = "none";
}

function bold_commented(e){
  var text_element = document.getElementById("lakiteksti");
  text = text_element.innerHTML;
  var i = text.indexOf(e.value);
  console.log(text.indexOf(e.value));
  console.log(e.value);
  if(i > -1){
    var text_length = e.value.length;
    var temp_text = text.substr(0, i) + "<b><b>";
    temp_text = temp_text + text.substr(i, text_length);
    temp_text = temp_text + "</b></b>" + text.substr(text_length + i);
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
