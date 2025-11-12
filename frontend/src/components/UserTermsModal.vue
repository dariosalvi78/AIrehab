<template>
  <q-dialog class="q-pa-none">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('common.consent.information_letter') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section>
        <div class="text-body2 q-py-md">
          <div class="text-bold">Information till forskningspersoner</div>
          <br>
          Vi vill fråga dig om du vill delta i ett forskningsprojekt. I det här dokumentet får du information om projektet och om vad det innebär att delta.
          <br><br>
          <q-list class="q-pa-none q-ma-none">
            <q-expansion-item
              label="Vad är det för ett projekt och varför vill vi att du ska delta?"
              header-class="expansion-header"
            >
              Postural orientering handlar om kroppens förmåga att hålla kroppsdelarna i rätt position i förhållande till varandra, och det är ett sätt att mäta rörelsekvalitet. Nedsatt rörelsekvalitet kan öka risken för skador. Inom vård och idrott görs idag bedömningar av rörelsekvalitet, men det saknas ett enhetligt och tillförlitligt sätt att göra detta, eftersom de metoder som finns ofta är avancerade och/eller tar mycket tid. Med hjälp av artificiell intelligens (AI) kan man bedöma rörelser på ett snabbt och pålitligt sätt. Vi har utvecklat AI-modeller som kan användas för att mäta rörelsekvalitet på ett enklare sätt.
              <br><br>
              Syftet med projektet är att ta reda på hur användare upplever en mobilapplikation som används för att bedöma rörelsekvalitet med hjälp av artificiell intelligens.
              <br><br>
              <div v-if="isPatient">Din fysioterapeut har accepterat att delta i studien och därför får du denna information och förfrågan om att delta.</div>
              <div v-else>Alla personer som kontaktat oss via vår annonsering om studien får denna information och förfrågan om att delta</div>
              <br>
              Forskningshuvudman för projektet är Lunds universitet. Med forskningshuvudman menas den organisation som är ansvarig för projektet. Forskningen är godkänd av Etikprövningsmyndigheten, diarienummer för prövningen hos Etikprövningsmyndigheten är ange diarienummer 
            </q-expansion-item>
            <q-expansion-item
              label="Hur går projektet till?"
              header-class="expansion-header"
            >
            <div v-if="isPatient">
              Din fysioterapeut kommer få tillgång till en mobilapplikation under 8 veckor för att via videomaterial vid utförande av övningar bedöma rörelsekvalitet med hjälp av AI-modeller på sina patienter när de utför ett test. Du kommer få tillgång till en inloggning till mobilapplikationen där du accepterar att delta i studien samt där du kan se resultat från dina tester. Deltagande innebär att du delar med dig av videomaterial och bakgrundinformation (ålder, kön, skada, idrott).
              <br><br>
              Du kommer även få möjligheten att besvara en digital enkät via mobilapplikationen vid 3 tillfällen; före användning, efter 3 mätningar och efter minst 6 veckor och 5 mätningar. Enkäterna handlar om hur du upplever appens användbarhet och om du tycker den är lätt att använda. Varje enklät tar ca 5-10 minuter att fyll i. Du kan också välja att ge samtycke till att ditt videomaterial används/delas utan att du behöver besvara frågeformulären. 
            </div>
            <div v-else>
              Du kommer få tillgång till en mobilapplikation som du under 8 veckor kan använda för att bedöma rörelsekvalitet med hjälp av AI-modeller när dina patienter utför en enbensknäböj. För att du ska kunna använda mobilapplikationen säkert behöver du godkänna cookies. Dessa används enbart för att hantera din inloggade session och fungerar endast inom Lunds universitets webbdomäner. Cookien lagras inte i webbläsaren, vilket minskar risken för obehörig åtkomst, till exempel via phishing. Godkännandet av cookies är nödvändigt för att applikationen ska fungera korrekt.
              <br><br>
              Du kommer få besvara en digital enkät via mobilapplikationen vid 3 tillfällen; före användning, efter 2 och 8 veckors användning. Enkäterna handlar om hur du upplever appens användbarhet och om du tycker den är lätt att använda. Varje enklät tar ca 5-10 minuter att fyll i. 
              <br><br>
              Du kommer även att bli inbjuden att delta i uppföljande intervjuer och/eller workshops om användningen av mobilapplikationen. Intervjuer/workshops beräknas ta mellan 30-90 min.
              <br><br>
              Om du deltar i en intervju/workshop så kommer du få möjlighet att läsa en sammanställning av den samt ge återkoppling på den.
            </div>
            <br>
            </q-expansion-item>
            <q-expansion-item
              label="Möjliga följder och risker med att delta i projektet"
              header-class="expansion-header"
            >
              <div v-if="isPatient">
                Deltagande kan innebära integritetsintrång för dig då du filmas. Det samlas även in känsliga personuppgifter, till exempel om din skada. Filmerna sparas i mobilapplikationen som är lösenordskyddad och filmer och resultat från bedömningarna av rörelsekvalitet via maskininlärningsmodellerna sparas på en säker server på Lunds universitet.
              </div>
              <div v-else>
                Vi kommer att hantera personuppgifter, till exempel din mejladress. All data hanteras kodad och det går inte att härleda data till enskilda individer.
                <br><br>
                Deltagande kan innebära integritetsintrång för dina patienter då de filmas. Det samlas även in känsliga personuppgifter, till exempel om deras skada. Filmerna sparas i mobilapplikationen som är lösenordskyddad och filmer och resultat från bedömningarna av rörelsekvalitet via maskininlärningsmodellerna sparas på en säker server på Lunds universitet.            
              </div>
            </q-expansion-item>
            <q-expansion-item
              label="Vad händer med dina uppgifter?"
              header-class="expansion-header"
            >
              <div v-if="isPatient">Projektet kommer att samla in och registrera information om dig.</div>
              <div v-else>
                Projektet kommer att samla in och registrera information om dig samt information och filmer på dina patienter. Patienten ger samtycke att dela videomaterial via appen.
              </div>
              <br>
              All data kodas och registreras i en databas som sparas på en säker server på Lunds universitet som endast forskarna i projektet har tillgång till. Dina svar och dina resultat kommer att behandlas så att inte obehöriga kan ta del av dem. Data kommer att presenteras på ett sådant sätt att ingen enskild person kan identifieras. Kodnyckel kommer att förvaras separat åtskilt från mätresultat, endast tillgänglig för forskare i projektet. I studien kommer personuppgifter om dig att registreras. Lunds universitet ansvarar för hantering av personuppgifter enligt EU:s dataskyddsförordning (GDPR). Om du samtycker till att delta i studien samtycker du också till att personuppgiftsbehandling sker. Allmän information om behandling av personuppgifter finns på Lunds universitets hemsida: <a target="_blank" href="https://www.lu.se/om-universitetet/kontakta-oss/behandling-av-personuppgifter-vid-lunds-universitet">Behandling av personuppgifter vid Lunds universitet | Lunds universitet.</a>
              <br><br>
              Ansvarig för dina personuppgifter är Lunds universitet. Enligt EU:s dataskyddsförordning har du rätt att kostnadsfritt få ta del av de uppgifter om dig som hanteras i projektet, och vid behov få eventuella fel rättade. Du kan också begära att uppgifter om dig raderas samt att behandlingen av dina personuppgifter begränsas. Rätten till radering och till begränsning av behandling av personuppgifter gäller dock inte när uppgifterna är nödvändiga för den aktuella forskningen.
              <br><br>
              Om du vill ta del av uppgifterna ska du kontakta Jenny Älmqvist Nae, Institutionen för hälsovetenskaper, Lunds universitet, Box 117, 22100 Lund, +46761379322. Dataskyddsombud nås på telefonnr: +46 46 2220000 eller dataskyddsombud@lu.se. Om du är missnöjd med hur dina personuppgifter behandlas har du rätt att ge in klagomål till Integritetsskyddsmyndigheten, som är tillsynsmyndighet.
            </q-expansion-item>
            <q-expansion-item
              label="Hur får du information om resultatet av projektet"
              header-class="expansion-header"
            >
              Resultaten kommer att sammanställas och skickas till vetenskapligatidskrifter för publikation. Hör av dig till oss om du är intresserad av att ta del av resultat från studien. 
            </q-expansion-item>
            <q-expansion-item
              label="Försäkring och ersättning"
              header-class="expansion-header"
            >
              Du kommer att vara försäkrad via din patientansvarsförsäkring då datainsamlingen sker på kliniken där du genomför din rehabilitering.
              <br><br>
              Det sker ingen ekonomisk kompensation för deltagande i studien. 
            </q-expansion-item>
            <q-expansion-item
              label="Deltagandet är frivilligt"
              header-class="expansion-header"
            >
              Ditt deltagande är frivilligt och du kan när som helst välja att avbryta deltagandet. Om du väljer att inte delta eller vill avbryta ditt deltagande behöver du inte uppge varför, och det kommer inte heller att påverka din framtida vård eller behandling. Du avbryter ditt deltagande via mobilapplikationen. 
              <br><br>
              Det är dock viktigt att notera att enbart radering av applikationen inte betraktas som ett formellt återkallande av samtycke, utan endast förhindrar fortsatt datainsamling. För att formellt dra tillbaka sitt samtycke krävs aktivt återkallande via applikationens funktion för detta ändamål. Den data du hittills har genererat inom studien kommer att sparas, men om du vill att den ska raderas, kontakta den ansvariga för projektet (se nedan).  
            </q-expansion-item>
          </q-list>
          <q-separator />
          <div class="text-bold q-mt-md">Ansvarig för projektet</div>
          <p class="info-text">
            Jenny Älmqvist Nae, Dr med vet, Universitetsadjunkt 
            <br>
            Institutionen för hälsovetenskaper 
            <br>
            Lunds universitet
            <br>
            Box 117
            <br>
            22100 Lund
            <br>
            Tfn: +46761379322
            <br>
            <a href="mailto:jenny.almqvist_nae@med.lu.se">jenny.almqvist_nae@med.lu.se</a>
            <br>
          </p>
          <div class="text-bold q-mt-md">Övriga medverkande</div>
          <p class="info-text">
            Eva Ageberg, Professor 
            <br>
            Institutionen för hälsovetenskaper
            <br>
            Lunds universitet
            <br>
            <a href="mailto:eva.ageberg@med.lu.se ">eva.ageberg@med.lu.se</a>
          </p>
          <p class="info-text">
            Carl Magnus Olsson, Doktor
            <br>
            Institutionen för datavetenskap och medieteknik
            <br>
            Malmö universitet 
            <br>
            <a href="mailto:carl.magnus.olsson@mau.se">carl.magnus.olsson@mau.se</a>
          </p>
          <p class="info-text">
            Benjamin Maus, Doktorand
            <br>
            Institutionen för datavetenskap och medieteknik
            <br>
            Malmö universitet
            <br>
            <a href="mailto:benjamin.maus@mau.se">benjamin.maus@mau.se</a>
          </p>        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'UserTermsModal',
  props: { isPatient: Boolean }
}
</script>

<style>
  .expansion-header {
    font-weight:bold;
    padding:8px 0px;
  }
  .info-text {
    line-height: 28px;
    margin: 16px 0 16px;
  }
  .q-dialog__inner--minimized {
    padding: 12px;
  }
</style>